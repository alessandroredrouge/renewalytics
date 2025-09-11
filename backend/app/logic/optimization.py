import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from functools import lru_cache
import pulp
from .battery_model import BatteryModel
from .market_operations import MarketOperations
from .battery_operations import BatteryOperations
import random

class Optimization:
    """
    A class handling the optimization of battery operations.
    """
    
    def __init__(self,
                 market_operations: MarketOperations,
                 battery_operations: BatteryOperations,
                 horizon: int = 24,
                 time_step: float = 1.0,
                 max_iterations: int = 1000,
                 tolerance: float = 1e-6):
        """
        Initialize optimization with configuration parameters.
        
        Parameters:
        - market_operations: MarketOperations instance
        - battery_operations: BatteryOperations instance
        - horizon: Optimization horizon in hours
        - time_step: Time step in hours
        - max_iterations: Maximum number of iterations
        - tolerance: Convergence tolerance
        """
        self.market_ops = market_operations
        self.battery_ops = battery_operations
        self.horizon = horizon
        self.time_step = time_step
        self.max_iterations = max_iterations
        self.tolerance = tolerance
        
    def optimize(self) -> Dict:
        """
        Run the two-stage optimization:
        1. Day-ahead bidding for capacity markets
        2. Intraday optimization for wholesale market with remaining capacity
        3. PPA market participation
        
        Returns:
        - Dictionary containing optimization results
        """
        try:
            print("\nStarting optimization...")
            
            # Initialize results
            results = {
                'datetimes': [],
                'prices': {},
                'power': {},
                'soc': [],
                'revenue': 0.0,
                'market_actions': [],
                'fcr_bidded': [],
                'afrr_bidded': [],
                'mfrr_bidded': [],
                'fcr_won': [],
                'afrr_won': [],
                'mfrr_won': [],
                'ppa_committed': {},
                'revenues_ppa': {}
            }
            
            # Reset battery state
            self.battery_ops.reset()
            
            # Get current datetime
            current_datetime = '2024-01-01 08:00:00'  # Start at 8 AM
            
            # Stage 1: Day-ahead bidding for capacity markets
            print("\nStage 1: Optimizing day-ahead bids...")
            bid_results = self.market_ops.optimize_day_ahead_bids(
                battery_capacity=self.battery_ops.capacity,
                max_power=self.battery_ops.max_power,
                current_soc=self.battery_ops.get_soc(),
                current_datetime=current_datetime
            )
            
            # Process bid results
            for market in ['FCR', 'aFRR', 'mFRR']:
                if market in bid_results:
                    for block, bid in bid_results[market].items():
                        # Store bid and acceptance results
                        for hour in range(block[0], block[1]):
                            results[f'{market.lower()}_bidded'].append(bid['power'])
                            results[f'{market.lower()}_won'].append(bid['power'] if bid['accepted'] else 0)
                            
                            # Calculate revenue if bid was accepted
                            if bid['accepted']:
                                # Get price for this hour
                                prices, _ = self.market_ops._fetch_prices_from_csv(
                                    market=market,
                                    target_date=pd.Timestamp(current_datetime) + pd.Timedelta(days=1)
                                )
                                if len(prices) > hour:
                                    revenue = bid['power'] * prices[hour]
                                    results[f'revenues_{market.lower()}'] += revenue
            
            # Stage 2: Intraday optimization for wholesale market and PPA
            print("\nStage 2: Optimizing intraday wholesale market and PPA...")
            
            # Get wholesale prices
            prices, datetimes = self.market_ops._fetch_prices_from_csv(market='Wholesale')
            
            if len(prices) == 0:
                print("No wholesale price data available")
                return results
            
            # Run optimization for each time step
            for i in range(min(self.horizon, len(prices))):
                current_price = prices[i]
                current_datetime = datetimes[i]
                
                # Get PPA obligations for this hour
                ppa_obligations = self.market_ops.get_ppa_obligation(current_datetime)
                
                # Calculate available power considering capacity market commitments and PPA
                available_charge = self.battery_ops.get_available_power('charge')
                available_discharge = self.battery_ops.get_available_power('discharge')
                
                # Simple optimization strategy for wholesale market and PPA
                if current_price < np.mean(prices):
                    # Charge if price is below average
                    power = min(available_charge, self.battery_ops.max_power)
                else:
                    # Discharge if price is above average
                    power = -min(available_discharge, self.battery_ops.max_power)
                
                # Update battery state
                new_soc = self.battery_ops.update_soc(power, self.time_step)
                
                # Store results
                results['datetimes'].append(current_datetime)
                results['prices']['Wholesale'] = prices
                results['power']['Wholesale'] = power
                results['soc'].append(new_soc)
                results['market_actions'].append('Wholesale')
                
                # Process PPA obligations
                for ppa_name, (ppa_power, ppa_price) in ppa_obligations.items():
                    if ppa_name not in results['ppa_committed']:
                        results['ppa_committed'][ppa_name] = []
                        results['revenues_ppa'][ppa_name] = 0.0
                    
                    results['ppa_committed'][ppa_name].append(ppa_power)
                    ppa_revenue = ppa_power * ppa_price * self.time_step
                    results['revenues_ppa'][ppa_name] += ppa_revenue
                
                # Calculate wholesale revenue
                wholesale_revenue = -power * current_price * self.time_step
                results['revenue'] += wholesale_revenue
                
                print(f"Time step {i+1}/{self.horizon}: Market=Wholesale, Price={current_price:.2f}, Power={power:.2f}, SOC={new_soc:.2f}")
                for ppa_name, (ppa_power, _) in ppa_obligations.items():
                    print(f"PPA {ppa_name}: Power={ppa_power:.2f} MW")
            
            print(f"\nOptimization completed.")
            print(f"Total Revenue: {results['revenue']:.2f} EUR")
            print(f"FCR Revenue: {results['revenues_fcr']:.2f} EUR")
            print(f"aFRR Revenue: {results['revenues_afrr']:.2f} EUR")
            print(f"mFRR Revenue: {results['revenues_mfrr']:.2f} EUR")
            for ppa_name, revenue in results['revenues_ppa'].items():
                print(f"PPA {ppa_name} Revenue: {revenue:.2f} EUR")
            
            return results
            
        except Exception as e:
            print(f"Error in optimization: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return {}
            
    def to_dict(self) -> Dict:
        """
        Convert optimization to dictionary.
        
        Returns:
        - Dictionary representation of optimization
        """
        return {
            'horizon': self.horizon,
            'time_step': self.time_step,
            'max_iterations': self.max_iterations,
            'tolerance': self.tolerance,
            'market_operations': self.market_ops.to_dict(),
            'battery_operations': self.battery_ops.to_dict()
        }
        
    @classmethod
    def from_dict(cls, data: Dict) -> 'Optimization':
        """
        Create optimization from dictionary.
        
        Parameters:
        - data: Dictionary containing optimization parameters
        
        Returns:
        - Optimization instance
        """
        market_ops = MarketOperations.from_dict(data['market_operations'])
        battery_ops = BatteryOperations.from_dict(data['battery_operations'])
        
        return cls(
            market_operations=market_ops,
            battery_operations=battery_ops,
            horizon=data['horizon'],
            time_step=data['time_step'],
            max_iterations=data['max_iterations'],
            tolerance=data['tolerance']
        )

class BatteryOptimizer:
    """
    A class implementing the battery optimization logic.
    """
    
    def __init__(self,
                 battery_model: BatteryModel,
                 market_operations: MarketOperations,
                 look_ahead: int = 24,
                 action_horizon: int = 6):
        """
        Initialize the battery optimizer.
        
        Parameters:
        - battery_model: BatteryModel instance
        - market_operations: MarketOperations instance
        - look_ahead: Number of hours to look ahead for optimization
        - action_horizon: Number of hours to consider for action planning
        """
        self.battery_model = battery_model
        self.market_operations = market_operations
        self.look_ahead = look_ahead
        self.action_horizon = action_horizon
        
        # Initialize solver options for better performance
        self.solver_options = {
            'msg': 0,  # Suppress solver output
            'timeLimit': 10  # Limit solver time to 10 seconds
        }
        
    @lru_cache(maxsize=1000)
    def _evaluate_single_step(self, action: str, current_soc: float, price: float, 
                            battery_energy_capacity: float, max_power: float, 
                            min_soc: float, max_soc: float, ppa_power: float, ppa_price: float) -> Dict[str, float]:
        """
        Evaluate a single action step.
        
        Parameters:
        - action: Action to evaluate ('charge', 'discharge', or 'idle')
        - current_soc: Current state of charge
        - price: Current electricity price
        - battery_energy_capacity: Battery energy capacity
        - max_power: Maximum power (charging or discharging)
        - min_soc: Minimum state of charge
        - max_soc: Maximum state of charge
        - ppa_power: PPA power obligation
        - ppa_price: PPA price
        
        Returns:
        - Dictionary containing evaluation results
        """
        # Calculate battery usage cost
        battery_usage_cost = self.battery_model._calculate_battery_usage_cost()
        
        # Calculate quantity and effective quantity
        quantity, effective_quantity = self.battery_model.calculate_effective_quantities(action)
        
        # Update cycle count if action changed
        self.battery_model.update_cycle_count(action)
        
        # Calculate revenue and costs
        if action == 'charge':
            revenue = 0
            cost = quantity * price
            usage_cost = battery_usage_cost
        elif action == 'discharge':
            revenue = effective_quantity * price
            cost = 0
            usage_cost = battery_usage_cost
        else:
            revenue = 0
            cost = 0
            usage_cost = 0
        
        # Calculate PPA revenue/cost
        if ppa_power > 0:
            if action == 'charge':
                revenue += ppa_power * ppa_price
            elif action == 'discharge':
                cost += ppa_power * ppa_price
        
        # Calculate net revenue
        net_revenue = revenue - cost - usage_cost
        
        # Calculate new SOC
        new_soc = self.battery_model.calculate_new_soc(current_soc, action, quantity, effective_quantity)
        
        return {
            'revenue': revenue,
            'cost': cost,
            'usage_cost': usage_cost,
            'net_revenue': net_revenue,
            'new_soc': new_soc,
            'cycle_count': self.battery_model.cycle_count
        }
        
    @lru_cache(maxsize=1000)
    def _evaluate_action(self, action: str, current_soc: float, price_scenario_tuple: tuple) -> Dict[str, float]:
        """
        Evaluate an action over a price scenario.
        
        Parameters:
        - action: Action to evaluate
        - current_soc: Current state of charge
        - price_scenario_tuple: Tuple of (prices, ppa_powers, ppa_prices)
        
        Returns:
        - Dictionary containing evaluation results
        """
        prices, ppa_powers, ppa_prices = price_scenario_tuple
        
        # Initialize variables
        total_revenue = 0
        total_cost = 0
        total_usage_cost = 0
        soc = current_soc
        
        # Evaluate each step in the scenario
        for i in range(len(prices)):
            result = self._evaluate_single_step(
                action,
                soc,
                prices[i],
                self.battery_model.battery_energy_capacity,
                self.battery_model.max_charging if action == 'charge' else self.battery_model.max_discharging,
                self.battery_model.min_soc,
                self.battery_model.max_soc,
                ppa_powers[i],
                ppa_prices[i]
            )
            
            total_revenue += result['revenue']
            total_cost += result['cost']
            total_usage_cost += result['usage_cost']
            soc = result['new_soc']
            
            # If SOC goes out of bounds, penalize the action
            if soc < self.battery_model.min_soc or soc > self.battery_model.max_soc:
                return {
                    'revenue': -float('inf'),
                    'cost': float('inf'),
                    'usage_cost': float('inf'),
                    'net_revenue': -float('inf'),
                    'final_soc': soc,
                    'cycle_count': result['cycle_count']
                }
        
        return {
            'revenue': total_revenue,
            'cost': total_cost,
            'usage_cost': total_usage_cost,
            'net_revenue': total_revenue - total_cost - total_usage_cost,
            'final_soc': soc,
            'cycle_count': result['cycle_count']
        }
        
    def _optimize_action(self, current_soc: float, price_scenario_tuple: tuple) -> str:
        """
        Optimize the action based on the current state and price scenario.
        
        Parameters:
        - current_soc: Current state of charge
        - price_scenario_tuple: Tuple of (prices, ppa_powers, ppa_prices)
        
        Returns:
        - Optimal action ('charge', 'discharge', or 'idle')
        """
        # Evaluate all possible actions
        actions = ['charge', 'discharge', 'idle']
        results = {}
        
        for action in actions:
            results[action] = self._evaluate_action(action, current_soc, price_scenario_tuple)
        
        # Find the action with the highest net revenue
        best_action = max(actions, key=lambda a: results[a]['net_revenue'])
        
        return best_action
        
    def optimize(self, current_datetime: str, current_soc: float) -> Dict:
        """
        Optimize battery operations for the current state.
        
        Parameters:
        - current_datetime: Current datetime string
        - current_soc: Current state of charge
        
        Returns:
        - Dictionary containing optimization results
        """
        # Fetch prices for the look-ahead period
        prices, datetimes = self.market_operations._fetch_prices_from_supabase()
        
        if len(prices) == 0:
            return {
                'error': 'No price data available',
                'action': 'idle',
                'revenue': 0,
                'cost': 0,
                'usage_cost': 0,
                'net_revenue': 0,
                'new_soc': current_soc
            }
        
        # Get PPA obligations for the look-ahead period
        ppa_obligations = self.market_operations._get_ppa_obligations_for_horizon(current_datetime, self.look_ahead)
        ppa_powers = [o[0] for o in ppa_obligations]
        ppa_prices = [o[1] for o in ppa_obligations]
        
        # Create price scenario tuple
        price_scenario_tuple = (tuple(prices[:self.look_ahead]), 
                              tuple(ppa_powers[:self.look_ahead]), 
                              tuple(ppa_prices[:self.look_ahead]))
        
        # Optimize action
        best_action = self._optimize_action(current_soc, price_scenario_tuple)
        
        # Evaluate the best action
        result = self._evaluate_action(best_action, current_soc, price_scenario_tuple)
        
        return {
            'action': best_action,
            'revenue': result['revenue'],
            'cost': result['cost'],
            'usage_cost': result['usage_cost'],
            'net_revenue': result['net_revenue'],
            'new_soc': result['final_soc'],
            'cycle_count': result['cycle_count']
        }
        
    def to_dict(self) -> Dict:
        """
        Convert optimizer to dictionary.
        
        Returns:
        - Dictionary representation of the optimizer
        """
        return {
            'battery_model': self.battery_model.to_dict(),
            'market_operations': self.market_operations.to_dict(),
            'look_ahead': self.look_ahead,
            'action_horizon': self.action_horizon
        }
        
    @classmethod
    def from_dict(cls, data: Dict) -> 'BatteryOptimizer':
        """
        Create optimizer from dictionary.
        
        Parameters:
        - data: Dictionary containing optimizer parameters
        
        Returns:
        - BatteryOptimizer instance
        """
        battery_model = BatteryModel.from_dict(data['battery_model'])
        market_operations = MarketOperations.from_dict(data['market_operations'])
        
        return cls(
            battery_model=battery_model,
            market_operations=market_operations,
            look_ahead=data['look_ahead'],
            action_horizon=data['action_horizon']
        )

    def optimize(self, market_operations: MarketOperations, battery: BatteryModel, current_datetime: str) -> Dict:
        """
        Optimize battery operation for a given market and battery configuration.
        
        Args:
            market_operations: MarketOperations instance
            battery: BatteryModel instance
            current_datetime: Current datetime string
            
        Returns:
            Dictionary containing optimization results
        """
        try:
            print("\nStarting optimization...")
            
            # Initialize results dictionary
            results = {
                'datetimes': [],
                'market_actions': [],
                'soc': [],
                'fcr_bidded': [],
                'afrr_bidded': [],
                'mfrr_bidded': [],
                'fcr_won': [],
                'afrr_won': [],
                'mfrr_won': [],
                'prices': {},
                'power': {},
                'ppa_committed': {},
                'revenues_fcr': 0.0,
                'revenues_afrr': 0.0,
                'revenues_mfrr': 0.0,
                'revenues_ppa': {}
            }
            
            # Get current datetime
            current_dt = pd.Timestamp(current_datetime)
            
            # Get prices for next day
            next_day = current_dt + pd.Timedelta(days=1)
            
            # Get prices for each market
            fcr_prices, fcr_datetimes = market_operations._fetch_prices_from_csv(market='FCR', target_date=next_day)
            afrr_prices, afrr_datetimes = market_operations._fetch_prices_from_csv(market='aFRR', target_date=next_day)
            mfrr_prices, mfrr_datetimes = market_operations._fetch_prices_from_csv(market='mFRR', target_date=next_day)
            wholesale_prices, wholesale_datetimes = market_operations._fetch_prices_from_csv(market='Wholesale', target_date=next_day)
            
            # Store prices in results
            results['prices']['FCR'] = fcr_prices
            results['prices']['aFRR'] = afrr_prices
            results['prices']['mFRR'] = mfrr_prices
            results['prices']['Wholesale'] = wholesale_prices
            
            # Get PPA obligations
            ppa_obligations = market_operations.get_ppa_obligation(current_datetime)
            
            # Initialize PPA committed power
            for ppa_name in ppa_obligations.keys():
                results['ppa_committed'][ppa_name] = []
                results['revenues_ppa'][ppa_name] = 0.0
            
            # Initialize power arrays
            results['power']['FCR'] = []
            results['power']['aFRR'] = []
            results['power']['mFRR'] = []
            results['power']['Wholesale'] = []
            
            # Initialize state of charge
            soc = battery.initial_soc
            
            # Simulate for each hour of the next day
            for hour in range(24):
                # Calculate datetime for this hour
                dt = next_day + pd.Timedelta(hours=hour)
                dt_str = dt.strftime('%Y-%m-%d %H:%M:%S')
                
                # Get prices for this hour
                fcr_price = fcr_prices[hour] if hour < len(fcr_prices) else 0
                afrr_price = afrr_prices[hour] if hour < len(afrr_prices) else 0
                mfrr_price = mfrr_prices[hour] if hour < len(mfrr_prices) else 0
                wholesale_price = wholesale_prices[hour] if hour < len(wholesale_prices) else 0
                
                # Calculate available power for each market
                fcr_available = min(battery.max_discharging, battery.battery_energy_capacity * (1 - soc))
                afrr_available = min(battery.max_discharging * 0.5, battery.battery_energy_capacity * (1 - soc) * 0.5)
                mfrr_available = min(battery.max_discharging * 0.25, battery.battery_energy_capacity * (1 - soc) * 0.25)
                
                # Calculate expected revenue for each market
                fcr_revenue = fcr_available * fcr_price * market_operations.fcr_acceptance_rate
                afrr_revenue = afrr_available * afrr_price * market_operations.afrr_acceptance_rate
                mfrr_revenue = mfrr_available * mfrr_price * market_operations.mfrr_acceptance_rate
                
                # Choose market with highest revenue
                revenues = {
                    'FCR': fcr_revenue,
                    'aFRR': afrr_revenue,
                    'mFRR': mfrr_revenue,
                    'Wholesale': wholesale_price * battery.max_discharging
                }
                
                chosen_market = max(revenues, key=revenues.get)
                
                # Store bid results
                results['datetimes'].append(dt_str)
                results['market_actions'].append(chosen_market)
                results['soc'].append(soc)
                
                # Store bid amounts
                results['fcr_bidded'].append(fcr_available)
                results['afrr_bidded'].append(afrr_available)
                results['mfrr_bidded'].append(mfrr_available)
                
                # Simulate bid acceptance
                if chosen_market == 'FCR':
                    accepted = random.random() < market_operations.fcr_acceptance_rate
                    results['fcr_won'].append(fcr_available if accepted else 0)
                    results['afrr_won'].append(0)
                    results['mfrr_won'].append(0)
                    if accepted:
                        results['revenues_fcr'] += fcr_revenue
                elif chosen_market == 'aFRR':
                    accepted = random.random() < market_operations.afrr_acceptance_rate
                    results['fcr_won'].append(0)
                    results['afrr_won'].append(afrr_available if accepted else 0)
                    results['mfrr_won'].append(0)
                    if accepted:
                        results['revenues_afrr'] += afrr_revenue
                elif chosen_market == 'mFRR':
                    accepted = random.random() < market_operations.mfrr_acceptance_rate
                    results['fcr_won'].append(0)
                    results['afrr_won'].append(0)
                    results['mfrr_won'].append(mfrr_available if accepted else 0)
                    if accepted:
                        results['revenues_mfrr'] += mfrr_revenue
                else:  # Wholesale
                    results['fcr_won'].append(0)
                    results['afrr_won'].append(0)
                    results['mfrr_won'].append(0)
                
                # Store power values
                results['power']['FCR'].append(results['fcr_won'][-1])
                results['power']['aFRR'].append(results['afrr_won'][-1])
                results['power']['mFRR'].append(results['mfrr_won'][-1])
                results['power']['Wholesale'].append(battery.max_discharging if chosen_market == 'Wholesale' else 0)
                
                # Handle PPA obligations
                for ppa_name, (power, price) in ppa_obligations.items():
                    results['ppa_committed'][ppa_name].append(power)
                    results['revenues_ppa'][ppa_name] += power * price
                
                # Update state of charge
                total_power = sum([
                    results['power']['FCR'][-1],
                    results['power']['aFRR'][-1],
                    results['power']['mFRR'][-1],
                    results['power']['Wholesale'][-1]
                ])
                
                soc = max(battery.min_soc, min(battery.max_soc, soc + total_power / battery.battery_energy_capacity))
            
            return results
            
        except Exception as e:
            print(f"Error in optimization: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return {} 