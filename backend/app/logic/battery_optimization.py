import pandas as pd
import numpy as np
import os
from itertools import product
import json
import random
from typing import Dict, List, Union, Any, Optional, Tuple
from supabase import create_client, Client
from dotenv import load_dotenv
import pulp
from functools import lru_cache

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

class BatteryOptimizer:
    """
    A class for optimizing battery operations based on electricity prices.
    Designed to be used in a web application context.
    """
    
    def __init__(self, 
                 initial_soc: float = 0.4,
                 battery_power_capacity: float = 10,
                 battery_energy_capacity: float = 40,
                 min_soc: float = 0.2,
                 max_soc: float = 0.8,
                 max_charging: float = 7,
                 max_discharging: float = 10,
                 country: str = "Germany",
                 market: str = "Wholesale",
                 round_trip_efficiency: float = 0.95,
                 lifetime: int = 15,
                 battery_degradation: float = 0.024,
                 simulation_year: int = 0,
                 fcr_acceptance_rate: float = 0.35,
                 afrr_acceptance_rate: float = 0.5,
                 mfrr_acceptance_rate: float = 0.2):
        """
        Initialize the battery optimizer with configuration parameters.
        
        Parameters:
        - initial_soc: Initial state of charge (0-1)
        - battery_power_capacity: Maximum power capacity in MW
        - battery_energy_capacity: Maximum energy capacity in MWh
        - min_soc: Minimum state of charge (0-1)
        - max_soc: Maximum state of charge (0-1)
        - max_charging: Maximum charging power in MW
        - max_discharging: Maximum discharging power in MW
        - country: Country for which to fetch price data (default: "Germany")
        - market: Market type for which to fetch price data (default: "Wholesale")
        - round_trip_efficiency: Round-trip efficiency of the battery (default: 0.95)
        - lifetime: Battery lifetime in years (default: 15)
        - battery_degradation: Annual battery degradation rate (default: 0.024)
        - simulation_year: Year of simulation (0, 5, 10, etc.) (default: 0)
        - fcr_acceptance_rate: Acceptance rate for FCR bids (default: 0.35)
        - afrr_acceptance_rate: Acceptance rate for aFRR bids (default: 0.5)
        - mfrr_acceptance_rate: Acceptance rate for mFRR bids (default: 0.2)
        """
        self.initial_soc = initial_soc
        self.battery_power_capacity = battery_power_capacity
        self.battery_energy_capacity = battery_energy_capacity
        self.min_soc = min_soc
        self.max_soc = max_soc
        self.max_charging = max_charging
        self.max_discharging = max_discharging
        self.country = country
        self.market = market
        self.round_trip_efficiency = round_trip_efficiency
        self.lifetime = lifetime
        self.battery_degradation = battery_degradation
        self.simulation_year = simulation_year
        self.fcr_acceptance_rate = fcr_acceptance_rate
        self.afrr_acceptance_rate = afrr_acceptance_rate
        self.mfrr_acceptance_rate = mfrr_acceptance_rate
        
        # Apply degradation based on simulation year
        if simulation_year > 0:
            degradation_factor_power = 1 - ((battery_degradation / 2) * simulation_year)
            degradation_factor_energy = 1 - (battery_degradation * simulation_year)
            self.battery_power_capacity = battery_power_capacity * degradation_factor_power
            self.battery_energy_capacity = battery_energy_capacity * degradation_factor_energy
            self.max_charging = max_charging * degradation_factor_power
            self.max_discharging = max_discharging * degradation_factor_power
        
        # Internal parameters (not configurable from frontend)
        # Reduced look-ahead horizon for better performance
        self.look_ahead = 24  # Reduced from 40 to 24
        self.action_horizon = 6
        
        # Calculate hourly SOC changes
        self.hourly_soc_charge = self.max_charging / self.battery_energy_capacity
        self.hourly_soc_discharge = self.max_discharging / self.battery_energy_capacity
        
        # Initialize bidding results
        self.fcr_bids = {}
        self.afrr_bids = {}
        self.mfrr_bids = {}
        self.bid_results = {}
        
        # Time blocks for bidding (4-hour blocks)
        self.time_blocks = [
            (0, 4),   # 00:00-04:00
            (4, 8),   # 04:00-08:00
            (8, 12),  # 08:00-12:00
            (12, 16), # 12:00-16:00
            (16, 20), # 16:00-20:00
            (20, 24)  # 20:00-24:00
        ]
        
        # Initialize solver options for better performance
        self.solver_options = {
            'msg': 0,  # Suppress solver output
            'timeLimit': 10  # Limit solver time to 10 seconds
        }
        
        # Cache for market prices
        self.market_prices_cache = {}
    
    def optimize(self, prices: Optional[List[float]] = None, datetimes: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Run the battery optimization algorithm on the provided price data.
        If prices are not provided, they will be fetched from Supabase.
        
        Parameters:
        - prices: Optional list of hourly electricity prices
        - datetimes: Optional list of datetime strings corresponding to the prices
        
        Returns:
        - Dictionary containing optimization results and summary statistics
        """
        # If prices are not provided, fetch them from Supabase
        if prices is None:
            prices, datetimes = self._fetch_prices_from_supabase()
        
        # Convert prices to numpy array
        prices_array = np.array(prices)
        
        # Initialize variables
        soc = self.initial_soc
        results = []
        
        # Process each hour
        for i in range(len(prices_array)):
            current_price = prices_array[i]
            current_datetime = datetimes[i] if datetimes is not None else None
            
            # Check if we need to make bidding decisions
            if current_datetime is not None:
                dt = pd.to_datetime(current_datetime)
                
                # At 8 AM, make FCR and mFRR bidding decisions for the next day
                if dt.hour == 8 and dt.minute == 0:
                    next_day = dt + pd.Timedelta(days=1)
                    try:
                        self._make_fcr_bids(next_day, soc)
                        self._make_mfrr_bids(next_day, soc)
                    except Exception as e:
                        print(f"Error making FCR/mFRR bids: {e}")
                        # Continue with the simulation even if bidding fails
                
                # At 9 AM, make aFRR bidding decisions for the next day
                if dt.hour == 9 and dt.minute == 0:
                    next_day = dt + pd.Timedelta(days=1)
                    try:
                        self._make_afrr_bids(next_day, soc)
                    except Exception as e:
                        print(f"Error making aFRR bids: {e}")
                        # Continue with the simulation even if bidding fails
                
                # Check if we have bid results for this hour
                if dt in self.bid_results:
                    # Apply bid results to the current hour
                    bid_result = self.bid_results[dt]
                    if bid_result['accepted']:
                        # If bid was accepted, we need to reserve capacity
                        reserved_capacity = bid_result['capacity']
                        # Adjust available capacity for the current hour
                        available_capacity = self.battery_power_capacity - reserved_capacity
                        
                        # Update SOC for the worst-case scenario
                        # This assumes the entire bidded capacity is used for the entire time block
                        if 'energy_used' in bid_result:
                            energy_used = bid_result['energy_used']
                            # Calculate the new SOC based on the energy used
                            # This is a worst-case scenario where the entire capacity is used
                            soc_reduction = energy_used / self.battery_energy_capacity
                            soc = max(self.min_soc, soc - soc_reduction)
                    else:
                        available_capacity = self.battery_power_capacity
                else:
                    available_capacity = self.battery_power_capacity
            
            # Get future prices (up to look_ahead hours)
            future_prices = prices_array[i+1:i+1+self.look_ahead]
            
            # Handle the case when we're at the end of the price data
            if len(future_prices) == 0:
                # If no future prices, use the current price
                future_prices = np.array([current_price])
            
            # Get the price scenario for the action horizon
            price_scenario = self._get_price_scenario(future_prices, self.action_horizon)
            
            # Convert price_scenario to tuple for caching
            price_scenario_tuple = tuple(price_scenario)
            
            # Evaluate potential actions
            charge_revenue = self._evaluate_action('charge', soc, price_scenario_tuple, current_price, 
                                                self.battery_energy_capacity, self.max_charging, 
                                                self.min_soc, self.max_soc)
            
            discharge_revenue = self._evaluate_action('discharge', soc, price_scenario_tuple, current_price, 
                                                   self.battery_energy_capacity, self.max_discharging, 
                                                   self.min_soc, self.max_soc)
            
            hold_revenue = self._evaluate_action('hold', soc, price_scenario_tuple, current_price, 
                                              self.battery_energy_capacity, 0, 
                                              self.min_soc, self.max_soc)
            
            # Choose the action with the highest expected revenue
            revenues = {
                'charge': charge_revenue,
                'discharge': discharge_revenue,
                'hold': hold_revenue
            }
            
            best_action = max(revenues, key=revenues.get)
            best_revenue = revenues[best_action]
            
            # Calculate the actual quantity and update SOC
            quantity = 0
            revenue = 0
            effective_quantity = 0
            
            if best_action == 'charge' and soc < self.max_soc:
                quantity = min(self.max_charging, (self.max_soc - soc) * self.battery_energy_capacity)
                # Apply round-trip efficiency for charging
                effective_quantity = quantity * self.round_trip_efficiency
                soc += effective_quantity / self.battery_energy_capacity
                revenue = -quantity * current_price
            elif best_action == 'discharge' and soc > self.min_soc:
                quantity = min(self.max_discharging, (soc - self.min_soc) * self.battery_energy_capacity)
                # Apply round-trip efficiency for discharging
                effective_quantity = quantity * self.round_trip_efficiency
                soc -= quantity / self.battery_energy_capacity
                revenue = effective_quantity * current_price
            
            # Check if we have capacity reserved for this hour
            capacity_reserved = False
            capacity_revenue = 0
            if current_datetime is not None:
                dt = pd.to_datetime(current_datetime)
                if dt in self.bid_results and self.bid_results[dt]['accepted']:
                    capacity_reserved = True
                    capacity_revenue = self.bid_results[dt]['capacity'] * self.bid_results[dt]['price']
            
            # Calculate total revenue
            total_revenue = revenue + capacity_revenue
            
            # Store results - simplified to exclude market prices
            result = {
                'id': i,
                'simulation_year': self.simulation_year,
                'calendar_year': 2025 + self.simulation_year,
                'datetime': current_datetime,
                'soc': float(soc),
                'action': best_action,
                'capacity_reserved': capacity_reserved,
                'quantity': float(quantity),
                'wholesale_price': float(current_price),
                'wholesale_revenue': float(revenue),
                'expected_revenue': float(best_revenue),
                'charge_revenue': float(charge_revenue),
                'discharge_revenue': float(discharge_revenue),
                'capacity_revenue': float(capacity_revenue),
                'total_revenue': float(total_revenue)
            }
                
            results.append(result)
        
        # Calculate cumulative revenue
        cumulative_revenue = 0
        for result in results:
            cumulative_revenue += result['total_revenue']
            result['cumulative_revenue'] = float(cumulative_revenue)
        
        # Calculate summary statistics
        total_revenue = sum(result['total_revenue'] for result in results)
        action_counts = {}
        for result in results:
            action = result['action']
            action_counts[action] = action_counts.get(action, 0) + 1
        
        # Prepare the response
        response = {
            'results': results,
            'summary': {
                'total_revenue': float(total_revenue),
                'action_counts': action_counts,
                'final_soc': float(soc),
                'parameters': {
                    'initial_soc': self.initial_soc,
                    'battery_power_capacity': self.battery_power_capacity,
                    'battery_energy_capacity': self.battery_energy_capacity,
                    'min_soc': self.min_soc,
                    'max_soc': self.max_soc,
                    'max_charging': self.max_charging,
                    'max_discharging': self.max_discharging,
                    'country': self.country,
                    'market': self.market,
                    'round_trip_efficiency': self.round_trip_efficiency,
                    'lifetime': self.lifetime,
                    'battery_degradation': self.battery_degradation,
                    'simulation_year': self.simulation_year,
                    'calendar_year': 2025 + self.simulation_year,
                    'fcr_acceptance_rate': self.fcr_acceptance_rate,
                    'afrr_acceptance_rate': self.afrr_acceptance_rate,
                    'mfrr_acceptance_rate': self.mfrr_acceptance_rate
                }
            }
        }
        
        return response
    
    def _make_fcr_bids(self, target_date: pd.Timestamp, current_soc: float) -> None:
        """
        Make FCR bidding decisions for the target date.
        
        Parameters:
        - target_date: The date for which to make bidding decisions
        - current_soc: Current state of charge
        """
        # Fetch FCR prices for the target date
        fcr_prices, _ = self._fetch_prices_from_supabase(market="FCR", target_date=target_date)
        
        if len(fcr_prices) == 0:
            print(f"No FCR prices found for {target_date}")
            return
        
        # Create a MILP problem for FCR bidding
        prob = pulp.LpProblem("FCR_Bidding", pulp.LpMaximize)
        
        # Define variables for each time block
        bid_vars = {}
        for block_idx, (start_hour, end_hour) in enumerate(self.time_blocks):
            # Variable for bidding capacity (integer)
            bid_vars[block_idx] = pulp.LpVariable(f"bid_{block_idx}", 0, int(self.battery_power_capacity), pulp.LpInteger)
        
        # Objective function: maximize expected revenue
        # Expected revenue = bid capacity * price * acceptance rate
        prob += pulp.lpSum([bid_vars[block_idx] * fcr_prices[block_idx] * self.fcr_acceptance_rate 
                           for block_idx in bid_vars])
        
        # Constraints
        # 1. Battery must have enough capacity for each bid
        for block_idx in bid_vars:
            # Available capacity based on current SOC
            available_capacity = min(
                self.battery_power_capacity,
                (current_soc - self.min_soc) * self.battery_energy_capacity / 4  # 4 hours per block
            )
            prob += bid_vars[block_idx] <= available_capacity
        
        # 2. Battery must have enough energy for each bid
        for block_idx in bid_vars:
            # Available energy based on current SOC
            available_energy = (current_soc - self.min_soc) * self.battery_energy_capacity
            # Energy constraint: bid capacity * hours <= available energy
            # This ensures we have enough energy to provide the bidded capacity for the entire time block
            prob += bid_vars[block_idx] * 4 <= available_energy  # 4 hours per block
        
        # Solve the problem with error handling
        try:
            # Use the solver options for better performance
            prob.solve(pulp.PULP_CBC_CMD(**self.solver_options))
            
            # Check if the solver found a solution
            if pulp.LpStatus[prob.status] != 'Optimal':
                print(f"FCR bidding optimization did not find an optimal solution. Status: {pulp.LpStatus[prob.status]}")
                return
            
            # Extract the results
            bids = {}
            for block_idx, (start_hour, end_hour) in enumerate(self.time_blocks):
                bid_capacity = pulp.value(bid_vars[block_idx])
                if bid_capacity > 0:
                    # Create a datetime for each hour in the block
                    for hour in range(start_hour, end_hour):
                        hour_datetime = target_date.replace(hour=hour, minute=0)
                        bids[hour_datetime] = {
                            'capacity': bid_capacity,
                            'price': fcr_prices[block_idx],
                            'market': 'FCR'
                        }
            
            # Store the bids
            self.fcr_bids[target_date.date()] = bids
            
            # Simulate bid acceptance
            self._simulate_bid_acceptance(bids, self.fcr_acceptance_rate)
            
        except Exception as e:
            print(f"Error solving FCR bidding optimization: {e}")
            # Return without making bids
    
    def _make_afrr_bids(self, target_date: pd.Timestamp, current_soc: float) -> None:
        """
        Make aFRR bidding decisions for the target date.
        
        Parameters:
        - target_date: The date for which to make bidding decisions
        - current_soc: Current state of charge
        """
        # Fetch aFRR prices for the target date
        afrr_prices, _ = self._fetch_prices_from_supabase(market="aFRR", target_date=target_date)
        
        if len(afrr_prices) == 0:
            print(f"No aFRR prices found for {target_date}")
            return
        
        # Create a MILP problem for aFRR bidding
        prob = pulp.LpProblem("aFRR_Bidding", pulp.LpMaximize)
        
        # Define variables for each time block
        bid_vars = {}
        for block_idx, (start_hour, end_hour) in enumerate(self.time_blocks):
            # Variable for bidding capacity (integer)
            bid_vars[block_idx] = pulp.LpVariable(f"bid_{block_idx}", 0, int(self.battery_power_capacity), pulp.LpInteger)
        
        # Objective function: maximize expected revenue
        # Expected revenue = bid capacity * price * acceptance rate
        prob += pulp.lpSum([bid_vars[block_idx] * afrr_prices[block_idx] * self.afrr_acceptance_rate 
                           for block_idx in bid_vars])
        
        # Constraints
        # 1. Battery must have enough capacity for each bid
        for block_idx in bid_vars:
            # Available capacity based on current SOC
            available_capacity = min(
                self.battery_power_capacity,
                (current_soc - self.min_soc) * self.battery_energy_capacity / 4  # 4 hours per block
            )
            prob += bid_vars[block_idx] <= available_capacity
        
        # 2. Battery must have enough energy for each bid
        for block_idx in bid_vars:
            # Available energy based on current SOC
            available_energy = (current_soc - self.min_soc) * self.battery_energy_capacity
            # Energy constraint: bid capacity * hours <= available energy
            # This ensures we have enough energy to provide the bidded capacity for the entire time block
            prob += bid_vars[block_idx] * 4 <= available_energy  # 4 hours per block
        
        # Solve the problem with error handling
        try:
            # Use the solver options for better performance
            prob.solve(pulp.PULP_CBC_CMD(**self.solver_options))
            
            # Check if the solver found a solution
            if pulp.LpStatus[prob.status] != 'Optimal':
                print(f"aFRR bidding optimization did not find an optimal solution. Status: {pulp.LpStatus[prob.status]}")
                return
            
            # Extract the results
            bids = {}
            for block_idx, (start_hour, end_hour) in enumerate(self.time_blocks):
                bid_capacity = pulp.value(bid_vars[block_idx])
                if bid_capacity > 0:
                    # Create a datetime for each hour in the block
                    for hour in range(start_hour, end_hour):
                        hour_datetime = target_date.replace(hour=hour, minute=0)
                        bids[hour_datetime] = {
                            'capacity': bid_capacity,
                            'price': afrr_prices[block_idx],
                            'market': 'aFRR'
                        }
            
            # Store the bids
            self.afrr_bids[target_date.date()] = bids
            
            # Simulate bid acceptance
            self._simulate_bid_acceptance(bids, self.afrr_acceptance_rate)
            
        except Exception as e:
            print(f"Error solving aFRR bidding optimization: {e}")
            # Return without making bids
    
    def _make_mfrr_bids(self, target_date: pd.Timestamp, current_soc: float) -> None:
        """
        Make mFRR bidding decisions for the target date.
        
        Parameters:
        - target_date: The date for which to make bidding decisions
        - current_soc: Current state of charge
        """
        # Fetch mFRR prices for the target date
        mfrr_prices, _ = self._fetch_prices_from_supabase(market="mFRR", target_date=target_date)
        
        if len(mfrr_prices) == 0:
            print(f"No mFRR prices found for {target_date}")
            return
        
        # Create a MILP problem for mFRR bidding
        prob = pulp.LpProblem("mFRR_Bidding", pulp.LpMaximize)
        
        # Define variables for each time block
        bid_vars = {}
        for block_idx, (start_hour, end_hour) in enumerate(self.time_blocks):
            # Variable for bidding capacity (integer)
            bid_vars[block_idx] = pulp.LpVariable(f"bid_{block_idx}", 0, int(self.battery_power_capacity), pulp.LpInteger)
        
        # Objective function: maximize expected revenue
        # Expected revenue = bid capacity * price * acceptance rate
        prob += pulp.lpSum([bid_vars[block_idx] * mfrr_prices[block_idx] * self.mfrr_acceptance_rate 
                           for block_idx in bid_vars])
        
        # Constraints
        # 1. Battery must have enough capacity for each bid
        for block_idx in bid_vars:
            # Available capacity based on current SOC
            available_capacity = min(
                self.battery_power_capacity,
                (current_soc - self.min_soc) * self.battery_energy_capacity / 4  # 4 hours per block
            )
            prob += bid_vars[block_idx] <= available_capacity
        
        # 2. Battery must have enough energy for each bid
        for block_idx in bid_vars:
            # Available energy based on current SOC
            available_energy = (current_soc - self.min_soc) * self.battery_energy_capacity
            # Energy constraint: bid capacity * hours <= available energy
            # This ensures we have enough energy to provide the bidded capacity for the entire time block
            prob += bid_vars[block_idx] * 4 <= available_energy  # 4 hours per block
        
        # Solve the problem with error handling
        try:
            # Use the solver options for better performance
            prob.solve(pulp.PULP_CBC_CMD(**self.solver_options))
            
            # Check if the solver found a solution
            if pulp.LpStatus[prob.status] != 'Optimal':
                print(f"mFRR bidding optimization did not find an optimal solution. Status: {pulp.LpStatus[prob.status]}")
                return
            
            # Extract the results
            bids = {}
            for block_idx, (start_hour, end_hour) in enumerate(self.time_blocks):
                bid_capacity = pulp.value(bid_vars[block_idx])
                if bid_capacity > 0:
                    # Create a datetime for each hour in the block
                    for hour in range(start_hour, end_hour):
                        hour_datetime = target_date.replace(hour=hour, minute=0)
                        bids[hour_datetime] = {
                            'capacity': bid_capacity,
                            'price': mfrr_prices[block_idx],
                            'market': 'mFRR'
                        }
            
            # Store the bids
            self.mfrr_bids[target_date.date()] = bids
            
            # Simulate bid acceptance
            self._simulate_bid_acceptance(bids, self.mfrr_acceptance_rate)
            
        except Exception as e:
            print(f"Error solving mFRR bidding optimization: {e}")
            # Return without making bids
    
    def _simulate_bid_acceptance(self, bids: Dict[pd.Timestamp, Dict], acceptance_rate: float) -> None:
        """
        Simulate bid acceptance based on the acceptance rate.
        
        Parameters:
        - bids: Dictionary of bids
        - acceptance_rate: Probability of bid acceptance
        """
        for dt, bid in bids.items():
            # Determine if the bid is accepted
            accepted = random.random() < acceptance_rate
            
            # Store the result
            self.bid_results[dt] = {
                'accepted': accepted,
                'capacity': bid['capacity'] if accepted else 0,
                'price': bid['price'],
                'market': bid['market']
            }
            
            # If bid is accepted, update the SOC for the worst-case scenario
            # This assumes the entire bidded capacity is used for the entire time block
            if accepted and bid['capacity'] > 0:
                # Calculate the energy used in the worst case (full capacity for 4 hours)
                energy_used = bid['capacity'] * 4  # 4 hours per block
                
                # Store the energy used in the bid result
                self.bid_results[dt]['energy_used'] = energy_used
    
    def _fetch_prices_from_supabase(self, market: Optional[str] = None, target_date: Optional[pd.Timestamp] = None) -> tuple:
        """
        Fetch price data from Supabase, filtered by country and market.
        Handles pagination to retrieve all available data.
        
        Parameters:
        - market: Market type to fetch (default: self.market)
        - target_date: Specific date to fetch prices for (default: None)
        
        Returns:
        - Tuple of (prices, datetimes)
        """
        try:
            # Use the provided market or the default
            market_to_fetch = market if market is not None else self.market
            
            # Initialize variables for pagination
            all_data = []
            page_size = 1000
            offset = 0
            has_more = True
            
            # Fetch data in batches until no more data is available
            while has_more:
                # Query the energy_prices table from Supabase with filters and pagination
                query = supabase.table('energy_prices').select('*').eq('country', self.country).eq('market', market_to_fetch)
                
                # Add price_type filter for aFRR and mFRR
                if market_to_fetch in ['aFRR', 'mFRR']:
                    query = query.eq('price_type', 'Positive')
                
                # Add date filter if target_date is provided
                if target_date is not None:
                    # Format the date as YYYY-MM-DD
                    date_str = target_date.strftime('%Y-%m-%d')
                    # Use datetime column instead of date column
                    query = query.gte('datetime', f"{date_str} 00:00:00").lt('datetime', f"{date_str} 23:59:59")
                else:
                    # Filter for 2024 data only
                    query = query.gte('datetime', '2024-01-01 00:00:00').lt('datetime', '2025-01-01 00:00:00')
                
                # Execute the query with pagination
                response = query.range(offset, offset + page_size - 1).execute()
                
                # Add the data to our collection
                batch_data = response.data
                all_data.extend(batch_data)
                
                # Check if we've received fewer records than the page size (indicating we've reached the end)
                if len(batch_data) < page_size:
                    has_more = False
                else:
                    # Move to the next page
                    offset += page_size
            
            # Convert to DataFrame
            df = pd.DataFrame(all_data)
            
            if df.empty:
                print(f"No data found for country={self.country} and market={market_to_fetch}")
                return np.array([]), np.array([])
            
            # print(f"Retrieved {len(df)} rows from Supabase for {self.country} - {market_to_fetch}")
            
            # Convert datetime column to datetime type
            df['datetime'] = pd.to_datetime(df['datetime'])
            
            # Sort by datetime
            df = df.sort_values('datetime')
            
            # If target_date is provided, we need to aggregate prices by time block
            if target_date is not None:
                # Create a new DataFrame with time blocks
                block_prices = []
                
                for start_hour, end_hour in self.time_blocks:
                    # Filter data for this time block
                    block_data = df[(df['datetime'].dt.hour >= start_hour) & (df['datetime'].dt.hour < end_hour)]
                    
                    if not block_data.empty:
                        # Calculate average price for this block
                        avg_price = block_data['price'].mean()
                        block_prices.append(avg_price)
                    else:
                        # If no data for this block, use 0
                        block_prices.append(0)
                
                return np.array(block_prices), None
            
            # Extract prices and datetimes
            prices = df['price'].values
            datetimes = df['datetime'].dt.strftime('%Y-%m-%d %H:%M:%S').values
            
            return prices, datetimes
        except Exception as e:
            print(f"Error fetching data from Supabase: {e}")
            # Return empty arrays as fallback
            return np.array([]), np.array([])
    
    def _get_price_scenario(self, future_prices: np.ndarray, horizon: int) -> np.ndarray:
        """
        Get a single price scenario for the action horizon based on future prices.
        
        Parameters:
        - future_prices: Array of future prices
        - horizon: Number of hours to plan actions for
        
        Returns:
        - Array of shape (horizon,) containing the price scenario
        """
        if len(future_prices) < horizon:
            # If we don't have enough future prices, pad with the last available price
            last_price = future_prices[-1] if len(future_prices) > 0 else 0
            future_prices = np.pad(future_prices, (0, horizon - len(future_prices)), 
                                  mode='constant', constant_values=last_price)
        
        # Use the first 'horizon' prices as the scenario
        return future_prices[:horizon]
    
    @lru_cache(maxsize=1000)
    def _evaluate_action(self, action: str, current_soc: float, price_scenario_tuple: tuple, current_price: float, 
                        battery_energy_capacity: float, max_power: float, 
                        min_soc: float, max_soc: float) -> float:
        """
        Evaluate the expected revenue of an action based on the price scenario.
        This method is cached to improve performance.
        
        Parameters:
        - action: 'charge', 'discharge', or 'hold'
        - current_soc: Current state of charge
        - price_scenario_tuple: Tuple of future prices (for caching)
        - current_price: Current electricity price
        - battery_energy_capacity: Battery energy capacity in MWh
        - max_power: Maximum power for the action (charging or discharging)
        - min_soc: Minimum state of charge
        - max_soc: Maximum state of charge
        
        Returns:
        - Expected revenue for the action
        """
        # Convert tuple back to numpy array
        price_scenario = np.array(price_scenario_tuple)
        
        horizon = len(price_scenario)
        
        # Calculate the immediate revenue from the action
        immediate_revenue = 0
        next_soc = current_soc
        
        if action == 'charge' and current_soc < max_soc:
            quantity = min(max_power, (max_soc - current_soc) * battery_energy_capacity)
            # Apply round-trip efficiency for charging
            effective_quantity = quantity * self.round_trip_efficiency
            next_soc = current_soc + effective_quantity / battery_energy_capacity
            immediate_revenue = -quantity * current_price
        elif action == 'discharge' and current_soc > min_soc:
            quantity = min(max_power, (current_soc - min_soc) * battery_energy_capacity)
            # Apply round-trip efficiency for discharging
            effective_quantity = quantity * self.round_trip_efficiency
            next_soc = current_soc - quantity / battery_energy_capacity
            immediate_revenue = effective_quantity * current_price
        
        # Calculate the optimal future actions based on the price scenario
        scenario_revenue = immediate_revenue
        scenario_soc = next_soc
        
        # For each future hour in the scenario
        for h in range(1, horizon):
            future_price = price_scenario[h]
            
            # Determine the best action for this future hour
            future_charge_revenue = self._evaluate_single_step('charge', scenario_soc, future_price, 
                                                           battery_energy_capacity, max_power, 
                                                           min_soc, max_soc)
            
            future_discharge_revenue = self._evaluate_single_step('discharge', scenario_soc, future_price, 
                                                              battery_energy_capacity, max_power, 
                                                              min_soc, max_soc)
            
            future_hold_revenue = self._evaluate_single_step('hold', scenario_soc, future_price, 
                                                         battery_energy_capacity, 0, 
                                                         min_soc, max_soc)
            
            # Choose the best action
            future_revenues = {
                'charge': future_charge_revenue['revenue'],
                'discharge': future_discharge_revenue['revenue'],
                'hold': future_hold_revenue['revenue']
            }
            
            best_future_action = max(future_revenues, key=future_revenues.get)
            
            # Update scenario revenue and SOC
            if best_future_action == 'charge':
                scenario_revenue += future_charge_revenue['revenue']
                scenario_soc = future_charge_revenue['next_soc']
            elif best_future_action == 'discharge':
                scenario_revenue += future_discharge_revenue['revenue']
                scenario_soc = future_discharge_revenue['next_soc']
            else:  # hold
                scenario_revenue += future_hold_revenue['revenue']
                scenario_soc = future_hold_revenue['next_soc']
        
        return scenario_revenue
    
    @lru_cache(maxsize=1000)
    def _evaluate_single_step(self, action: str, current_soc: float, price: float, 
                            battery_energy_capacity: float, max_power: float, 
                            min_soc: float, max_soc: float) -> Dict[str, float]:
        """
        Evaluate a single action for a given price and SOC.
        This method is cached to improve performance.
        
        Parameters:
        - action: 'charge', 'discharge', or 'hold'
        - current_soc: Current state of charge
        - price: Electricity price
        - battery_energy_capacity: Battery energy capacity in MWh
        - max_power: Maximum power for the action (charging or discharging)
        - min_soc: Minimum state of charge
        - max_soc: Maximum state of charge
        
        Returns:
        - Dictionary with revenue and next SOC
        """
        revenue = 0
        next_soc = current_soc
        
        if action == 'charge' and current_soc < max_soc:
            quantity = min(max_power, (max_soc - current_soc) * battery_energy_capacity)
            # Apply round-trip efficiency for charging
            effective_quantity = quantity * self.round_trip_efficiency
            next_soc = current_soc + effective_quantity / battery_energy_capacity
            revenue = -quantity * price
        elif action == 'discharge' and current_soc > min_soc:
            quantity = min(max_power, (current_soc - min_soc) * battery_energy_capacity)
            # Apply round-trip efficiency for discharging
            effective_quantity = quantity * self.round_trip_efficiency
            next_soc = current_soc - quantity / battery_energy_capacity
            revenue = effective_quantity * price
        
        return {
            'revenue': revenue,
            'next_soc': next_soc
        }
    
    def to_json(self) -> str:
        """
        Convert the optimizer configuration to a JSON string.
        
        Returns:
        - JSON string representation of the optimizer configuration
        """
        config = {
            'initial_soc': self.initial_soc,
            'battery_power_capacity': self.battery_power_capacity,
            'battery_energy_capacity': self.battery_energy_capacity,
            'min_soc': self.min_soc,
            'max_soc': self.max_soc,
            'max_charging': self.max_charging,
            'max_discharging': self.max_discharging,
            'country': self.country,
            'market': self.market,
            'round_trip_efficiency': self.round_trip_efficiency,
            'lifetime': self.lifetime,
            'battery_degradation': self.battery_degradation,
            'simulation_year': self.simulation_year,
            'fcr_acceptance_rate': self.fcr_acceptance_rate,
            'afrr_acceptance_rate': self.afrr_acceptance_rate,
            'mfrr_acceptance_rate': self.mfrr_acceptance_rate
        }
        return json.dumps(config)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'BatteryOptimizer':
        """
        Create a BatteryOptimizer instance from a JSON string.
        
        Parameters:
        - json_str: JSON string representation of the optimizer configuration
        
        Returns:
        - BatteryOptimizer instance
        """
        config = json.loads(json_str)
        return cls(**config)

    def _prefetch_market_prices(self, datetimes: List[str]) -> None:
        """
        Pre-fetch all market prices for the entire period to avoid repeated database queries.
        
        Parameters:
        - datetimes: List of datetime strings
        """
        try:
            # Convert datetimes to pandas Timestamps
            dt_objects = [pd.to_datetime(dt) for dt in datetimes]
            
            # Get the start and end dates
            start_date = min(dt_objects).strftime('%Y-%m-%d')
            end_date = max(dt_objects).strftime('%Y-%m-%d')
            
            # Fetch FCR prices
            fcr_prices = self._fetch_market_prices_batch("FCR", start_date, end_date)
            
            # Fetch aFRR prices
            afrr_prices = self._fetch_market_prices_batch("aFRR", start_date, end_date)
            
            # Fetch mFRR prices
            mfrr_prices = self._fetch_market_prices_batch("mFRR", start_date, end_date)
            
            # Combine all prices into a single cache
            for dt_str in fcr_prices:
                if dt_str not in self.market_prices_cache:
                    self.market_prices_cache[dt_str] = {}
                self.market_prices_cache[dt_str]['FCR'] = fcr_prices[dt_str]
            
            for dt_str in afrr_prices:
                if dt_str not in self.market_prices_cache:
                    self.market_prices_cache[dt_str] = {}
                self.market_prices_cache[dt_str]['aFRR'] = afrr_prices[dt_str]
            
            for dt_str in mfrr_prices:
                if dt_str not in self.market_prices_cache:
                    self.market_prices_cache[dt_str] = {}
                self.market_prices_cache[dt_str]['mFRR'] = mfrr_prices[dt_str]
            
            print(f"Pre-fetched market prices for {len(self.market_prices_cache)} datetimes")
            
        except Exception as e:
            print(f"Error pre-fetching market prices: {e}")
    
    def _fetch_market_prices_batch(self, market: str, start_date: str, end_date: str) -> Dict[str, float]:
        """
        Fetch market prices for a date range in a single query.
        
        Parameters:
        - market: Market type (FCR, aFRR, mFRR)
        - start_date: Start date in YYYY-MM-DD format
        - end_date: End date in YYYY-MM-DD format
        
        Returns:
        - Dictionary mapping datetime strings to prices
        """
        try:
            # Query the energy_prices table from Supabase
            query = supabase.table('energy_prices').select('*').eq('country', self.country).eq('market', market)
            
            # Add price_type filter for aFRR and mFRR
            if market in ['aFRR', 'mFRR']:
                query = query.eq('price_type', 'Positive')
                
            query = query.gte('datetime', f"{start_date} 00:00:00").lt('datetime', f"{end_date} 23:59:59")
            
            # Execute the query
            response = query.execute()
            
            # Check if we have data
            if not response.data:
                return {}
            
            # Convert to DataFrame
            df = pd.DataFrame(response.data)
            
            # For aFRR and mFRR, we need to get the maximum value between Positive and Negative energy types
            if market in ['aFRR', 'mFRR'] and 'energy_type' in df.columns:
                # Group by datetime and get the maximum price
                result = {}
                for dt, group in df.groupby('datetime'):
                    positive_price = group[group['energy_type'] == 'Positive']['price'].max() if not group[group['energy_type'] == 'Positive'].empty else 0
                    negative_price = group[group['energy_type'] == 'Negative']['price'].max() if not group[group['energy_type'] == 'Negative'].empty else 0
                    result[dt] = max(positive_price, negative_price)
                return result
            
            # For other markets, just return the price for each datetime
            return {row['datetime']: row['price'] for _, row in df.iterrows()}
            
        except Exception as e:
            print(f"Error fetching {market} prices batch: {e}")
            return {}

    def _get_market_price_for_datetime(self, market: str, datetime: pd.Timestamp) -> float:
        """
        Get the price for a specific market and datetime from cache.
        
        Parameters:
        - market: Market type (FCR, aFRR, mFRR)
        - datetime: Datetime to get the price for
        
        Returns:
        - Price for the specified market and datetime
        """
        try:
            # Format the datetime as a string
            datetime_str = datetime.strftime('%Y-%m-%d %H:%M:%S')
            
            # Check if we have the price in cache
            if datetime_str in self.market_prices_cache and market in self.market_prices_cache[datetime_str]:
                return self.market_prices_cache[datetime_str][market]
            
            # If not in cache, fetch it
            # Format the datetime as a string for the query
            query = supabase.table('energy_prices').select('*').eq('country', self.country).eq('market', market)
            
            # Add price_type filter for aFRR and mFRR
            if market in ['aFRR', 'mFRR']:
                query = query.eq('price_type', 'Positive')
                
            query = query.eq('datetime', datetime_str)
            
            # Execute the query
            response = query.execute()
            
            # Check if we have data
            if not response.data:
                return 0.0
            
            # For aFRR and mFRR, we need to get the maximum value between Positive and Negative energy types
            if market in ['aFRR', 'mFRR']:
                # Group by energy_type and get the maximum price
                df = pd.DataFrame(response.data)
                if 'energy_type' in df.columns:
                    # Get the maximum price between Positive and Negative energy types
                    positive_price = df[df['energy_type'] == 'Positive']['price'].max() if not df[df['energy_type'] == 'Positive'].empty else 0
                    negative_price = df[df['energy_type'] == 'Negative']['price'].max() if not df[df['energy_type'] == 'Negative'].empty else 0
                    
                    # Cache the result
                    if datetime_str not in self.market_prices_cache:
                        self.market_prices_cache[datetime_str] = {}
                    self.market_prices_cache[datetime_str][market] = max(positive_price, negative_price)
                    
                    return max(positive_price, negative_price)
            
            # For other markets, just return the price
            price = response.data[0]['price']
            
            # Cache the result
            if datetime_str not in self.market_prices_cache:
                self.market_prices_cache[datetime_str] = {}
            self.market_prices_cache[datetime_str][market] = price
            
            return price
            
        except Exception as e:
            print(f"Error fetching {market} price for {datetime}: {e}")
            return 0.0


# Example usage for a web application
def create_api_endpoint():
    """
    Example of how to create an API endpoint using Flask or FastAPI.
    This is just a demonstration and should be adapted to your specific web framework.
    """
    # Example using Flask
    """
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    
    @app.route('/optimize', methods=['POST'])
    def optimize_endpoint():
        data = request.json
        
        # Extract parameters
        prices = data.get('prices', None)  # Now optional
        datetimes = data.get('datetimes', None)
        
        # Extract configuration parameters
        config = data.get('config', {})
        
        # Create optimizer with provided configuration
        optimizer = BatteryOptimizer(**config)
        
        # Run optimization
        results = optimizer.optimize(prices, datetimes)
        
        return jsonify(results)
    
    return app
    """
    
    # Example using FastAPI
    """
    from fastapi import FastAPI, Body
    
    app = FastAPI()
    
    @app.post("/optimize")
    async def optimize_endpoint(
        prices: Optional[List[float]] = Body(None),
        datetimes: Optional[List[str]] = Body(None),
        config: Dict[str, Any] = Body({})
    ):
        # Create optimizer with provided configuration
        optimizer = BatteryOptimizer(**config)
        
        # Run optimization
        results = optimizer.optimize(prices, datetimes)
        
        return results
    
    return app
    """
    
    # Return a placeholder message
    return "API endpoint creation example (commented code)"


def main():
    """
    Main function for testing the BatteryOptimizer class.
    """
    # Create optimizer with default parameters
    optimizer = BatteryOptimizer(country="Germany", market="Wholesale")
    
    # Run optimization with default price data (fetched from Supabase)
    results = optimizer.optimize()
    
    # Print summary
    print(f"Total revenue: {results['summary']['total_revenue']:.2f} EUR")
    print(f"Action Statistics: {results['summary']['action_counts']}")
    
    # Save results to CSV
    results_df = pd.DataFrame(results['results'])
    output_file = 'data/battery_optimization_results.csv'
    results_df.to_csv(output_file, index=False)
    print(f"\nResults saved to {output_file}")
    
    # Example of serializing to JSON
    config_json = optimizer.to_json()
    print(f"\nOptimizer configuration as JSON: {config_json}")
    
    # Example of creating from JSON
    new_optimizer = BatteryOptimizer.from_json(config_json)
    print(f"\nCreated new optimizer with same configuration")


if __name__ == "__main__":
    main() 