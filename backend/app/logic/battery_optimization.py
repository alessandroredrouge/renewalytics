import pandas as pd
import numpy as np
import os
from itertools import product
import json
from typing import Dict, List, Union, Any, Optional

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
                 max_discharging: float = 10):
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
        """
        self.initial_soc = initial_soc
        self.battery_power_capacity = battery_power_capacity
        self.battery_energy_capacity = battery_energy_capacity
        self.min_soc = min_soc
        self.max_soc = max_soc
        self.max_charging = max_charging
        self.max_discharging = max_discharging
        
        # Internal parameters (not configurable from frontend)
        self.look_ahead = 24
        self.action_horizon = 6
        
        # Calculate hourly SOC changes
        self.hourly_soc_charge = max_charging / battery_energy_capacity
        self.hourly_soc_discharge = max_discharging / battery_energy_capacity
    
    def optimize(self, prices: Optional[List[float]] = None, datetimes: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Run the battery optimization algorithm on the provided price data.
        If prices are not provided, they will be fetched from the default CSV file.
        
        Parameters:
        - prices: Optional list of hourly electricity prices
        - datetimes: Optional list of datetime strings corresponding to the prices
        
        Returns:
        - Dictionary containing optimization results and summary statistics
        """
        # If prices are not provided, fetch them from the CSV file
        if prices is None:
            prices, datetimes = self._fetch_prices_from_csv()
        
        # Convert prices to numpy array
        prices_array = np.array(prices)
        
        # Initialize variables
        soc = self.initial_soc
        results = []
        
        # Process each hour
        for i in range(len(prices_array)):
            current_price = prices_array[i]
            
            # Get future prices (up to look_ahead hours)
            future_prices = prices_array[i+1:i+1+self.look_ahead]
            
            # Handle the case when we're at the end of the price data
            if len(future_prices) == 0:
                # If no future prices, use the current price
                future_prices = np.array([current_price])
            
            # Get the price scenario for the action horizon
            price_scenario = self._get_price_scenario(future_prices, self.action_horizon)
            
            # Evaluate potential actions
            charge_revenue = self._evaluate_action('charge', soc, price_scenario, current_price, 
                                                self.battery_energy_capacity, self.max_charging, 
                                                self.min_soc, self.max_soc)
            
            discharge_revenue = self._evaluate_action('discharge', soc, price_scenario, current_price, 
                                                   self.battery_energy_capacity, self.max_discharging, 
                                                   self.min_soc, self.max_soc)
            
            hold_revenue = self._evaluate_action('hold', soc, price_scenario, current_price, 
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
            
            if best_action == 'charge' and soc < self.max_soc:
                quantity = min(self.max_charging, (self.max_soc - soc) * self.battery_energy_capacity)
                soc += quantity / self.battery_energy_capacity
                revenue = -quantity * current_price
            elif best_action == 'discharge' and soc > self.min_soc:
                quantity = min(self.max_discharging, (soc - self.min_soc) * self.battery_energy_capacity)
                soc -= quantity / self.battery_energy_capacity
                revenue = quantity * current_price
            
            # Store results
            result = {
                'hour': i,
                'price': float(current_price),
                'action': best_action,
                'quantity': float(quantity),
                'revenue': float(revenue),
                'expected_revenue': float(best_revenue),
                'soc': float(soc),
                'charge_revenue': float(charge_revenue),
                'discharge_revenue': float(discharge_revenue),
                'hold_revenue': float(hold_revenue)
            }
            
            # Add datetime if provided
            if datetimes is not None and i < len(datetimes):
                result['datetime'] = datetimes[i]
                
            results.append(result)
        
        # Calculate cumulative revenue
        cumulative_revenue = 0
        for result in results:
            cumulative_revenue += result['revenue']
            result['cumulative_revenue'] = float(cumulative_revenue)
        
        # Calculate summary statistics
        total_revenue = sum(result['revenue'] for result in results)
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
                    'max_discharging': self.max_discharging
                }
            }
        }
        
        return response
    
    def _fetch_prices_from_csv(self) -> tuple:
        """
        Fetch price data from the default CSV file.
        
        Returns:
        - Tuple of (prices, datetimes)
        """
        # Load from the wholesale file
        df = pd.read_csv('data/wholesale_energy_prices.csv')
        
        df['datetime'] = pd.to_datetime(df['datetime'])
        
        # Filter for 2024 data if available
        if '2024' in df['datetime'].dt.year.astype(str).values:
            df = df[df['datetime'].dt.year == 2024].copy()
        
        prices = df['price_eur_mwh'].values
        datetimes = df['datetime'].dt.strftime('%Y-%m-%d %H:%M:%S').values
        
        return prices, datetimes
    
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
    
    def _evaluate_action(self, action: str, current_soc: float, price_scenario: np.ndarray, 
                        current_price: float, battery_energy_capacity: float, max_power: float, 
                        min_soc: float, max_soc: float) -> float:
        """
        Evaluate the expected revenue of an action based on the price scenario.
        
        Parameters:
        - action: 'charge', 'discharge', or 'hold'
        - current_soc: Current state of charge
        - price_scenario: Array of future prices
        - current_price: Current electricity price
        - battery_energy_capacity: Battery energy capacity in MWh
        - max_power: Maximum power for the action (charging or discharging)
        - min_soc: Minimum state of charge
        - max_soc: Maximum state of charge
        
        Returns:
        - Expected revenue for the action
        """
        horizon = len(price_scenario)
        
        # Calculate the immediate revenue from the action
        immediate_revenue = 0
        next_soc = current_soc
        
        if action == 'charge' and current_soc < max_soc:
            quantity = min(max_power, (max_soc - current_soc) * battery_energy_capacity)
            next_soc = current_soc + quantity / battery_energy_capacity
            immediate_revenue = -quantity * current_price
        elif action == 'discharge' and current_soc > min_soc:
            quantity = min(max_power, (current_soc - min_soc) * battery_energy_capacity)
            next_soc = current_soc - quantity / battery_energy_capacity
            immediate_revenue = quantity * current_price
        
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
    
    def _evaluate_single_step(self, action: str, current_soc: float, price: float, 
                            battery_energy_capacity: float, max_power: float, 
                            min_soc: float, max_soc: float) -> Dict[str, float]:
        """
        Evaluate a single action for a given price and SOC.
        
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
            next_soc = current_soc + quantity / battery_energy_capacity
            revenue = -quantity * price
        elif action == 'discharge' and current_soc > min_soc:
            quantity = min(max_power, (current_soc - min_soc) * battery_energy_capacity)
            next_soc = current_soc - quantity / battery_energy_capacity
            revenue = quantity * price
        
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
            'max_discharging': self.max_discharging
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
    optimizer = BatteryOptimizer()
    
    # Run optimization with default price data (fetched from CSV)
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