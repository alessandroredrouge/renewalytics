import pandas as pd
import numpy as np
from typing import Dict, Optional

class BatteryModel:
    """
    A class representing the battery model and its degradation characteristics.
    """
    
    def __init__(self,
                 initial_soc: float = 0.4,
                 battery_power_capacity: float = 10,
                 battery_energy_capacity: float = 40,
                 min_soc: float = 0.2,
                 max_soc: float = 0.8,
                 max_charging: float = 7,
                 max_discharging: float = 10,
                 charging_efficiency: float = 0.95,
                 discharging_efficiency: float = 0.95,
                 lifetime: int = 15):
        """
        Initialize the battery model with configuration parameters.
        
        Parameters:
        - initial_soc: Initial state of charge (0-1)
        - battery_power_capacity: Maximum power capacity in MW
        - battery_energy_capacity: Maximum energy capacity in MWh
        - min_soc: Minimum state of charge (0-1)
        - max_soc: Maximum state of charge (0-1)
        - max_charging: Maximum charging power in MW
        - max_discharging: Maximum discharging power in MW
        - charging_efficiency: Efficiency of charging (0-1)
        - discharging_efficiency: Efficiency of discharging (0-1)
        - lifetime: Battery lifetime in years
        """
        # Store initial parameters
        self.initial_soc = initial_soc
        self.initial_power_capacity = battery_power_capacity
        self.initial_energy_capacity = battery_energy_capacity
        self.min_soc = min_soc
        self.max_soc = max_soc
        self.initial_max_charging = max_charging
        self.initial_max_discharging = max_discharging
        self.charging_efficiency = charging_efficiency
        self.discharging_efficiency = discharging_efficiency
        self.lifetime = lifetime
        
        # Constants for battery degradation calculation
        self.K = 0.0005
        self.alpha = 0.8
        self.beta = 0.8
        self.R = 25000  # Cost coefficient for battery usage
        
        # Initialize degradation parameters
        self.dod = max_soc - min_soc
        self.cycle_count = 0
        self.degradation_factor_energy = 1.0
        self.degradation_factor_power = 1.0
        self.battery_degradation = self._calculate_battery_degradation()
        
        # Apply initial degradation
        self.degradation_factor_energy -= self.battery_degradation
        self.degradation_factor_power -= self.battery_degradation / 2
        
        # Initialize current capacities
        self._update_capacities()
        
        # Calculate hourly SOC changes
        self.hourly_soc_charge = self.max_charging / self.battery_energy_capacity
        self.hourly_soc_discharge = self.max_discharging / self.battery_energy_capacity
        
        # Track previous action for cycle counting
        self.previous_action = None
        
    def _calculate_battery_degradation(self) -> float:
        """
        Calculate battery degradation based on DOD and cycle count.
        
        Returns:
        - Battery degradation rate
        """
        return self.K * (self.dod ** self.alpha) * (self.cycle_count ** self.beta)
        
    def _update_degradation_factors(self) -> None:
        """
        Update degradation factors based on current cycle count and battery degradation.
        """
        # Calculate new battery degradation
        self.battery_degradation = self._calculate_battery_degradation()
        
        # Update degradation factors
        self.degradation_factor_energy -= self.battery_degradation
        self.degradation_factor_power -= self.battery_degradation / 2
        
        # Ensure degradation factors don't go below 0
        self.degradation_factor_energy = max(0, self.degradation_factor_energy)
        self.degradation_factor_power = max(0, self.degradation_factor_power)
        
        # Update capacities
        self._update_capacities()
        
    def _update_capacities(self) -> None:
        """
        Update all battery capacities based on current degradation factors.
        """
        self.battery_power_capacity = self.initial_power_capacity * self.degradation_factor_power
        self.battery_energy_capacity = self.initial_energy_capacity * self.degradation_factor_energy
        self.max_charging = self.initial_max_charging * self.degradation_factor_power
        self.max_discharging = self.initial_max_discharging * self.degradation_factor_power
        
    def _calculate_battery_usage_cost(self) -> float:
        """
        Calculate the cost of battery usage for a single cycle.
        
        Returns:
        - Cost of battery usage in EUR
        """
        # Calculate degradation for a single cycle (N=1)
        single_cycle_degradation = self.K * (self.dod ** self.alpha) * (1 ** self.beta)
        return single_cycle_degradation * self.lifetime * self.battery_energy_capacity * self.R
        
    def update_cycle_count(self, current_action: str) -> None:
        """
        Update cycle count based on action changes.
        
        Parameters:
        - current_action: Current action ('charge', 'discharge', or 'idle')
        """
        if self.previous_action is not None and current_action != 'idle' and self.previous_action != current_action:
            self.cycle_count += 1
            self._update_degradation_factors()
        
        self.previous_action = current_action
        
    def calculate_effective_quantities(self, action: str) -> tuple:
        """
        Calculate effective quantities for an action.
        
        Parameters:
        - action: Action to calculate quantities for
        
        Returns:
        - Tuple of (quantity, effective_quantity)
        """
        if action == 'charge':
            quantity = self.max_charging
            effective_quantity = quantity * self.charging_efficiency
        elif action == 'discharge':
            quantity = self.max_discharging
            effective_quantity = quantity * self.discharging_efficiency
        else:
            quantity = 0
            effective_quantity = 0
            
        return quantity, effective_quantity
        
    def calculate_new_soc(self, current_soc: float, action: str, quantity: float, effective_quantity: float) -> float:
        """
        Calculate new state of charge after an action.
        
        Parameters:
        - current_soc: Current state of charge
        - action: Action performed
        - quantity: Raw quantity of energy
        - effective_quantity: Effective quantity after efficiency
        
        Returns:
        - New state of charge
        """
        if action == 'charge':
            return min(self.max_soc, current_soc + effective_quantity / self.battery_energy_capacity)
        elif action == 'discharge':
            return max(self.min_soc, current_soc - quantity / self.battery_energy_capacity)
        else:
            return current_soc
            
    def to_dict(self) -> Dict:
        """
        Convert battery model to dictionary.
        
        Returns:
        - Dictionary representation of the battery model
        """
        return {
            'initial_soc': self.initial_soc,
            'battery_power_capacity': self.battery_power_capacity,
            'battery_energy_capacity': self.battery_energy_capacity,
            'min_soc': self.min_soc,
            'max_soc': self.max_soc,
            'max_charging': self.max_charging,
            'max_discharging': self.max_discharging,
            'charging_efficiency': self.charging_efficiency,
            'discharging_efficiency': self.discharging_efficiency,
            'lifetime': self.lifetime,
            'cycle_count': self.cycle_count,
            'degradation_factor_energy': self.degradation_factor_energy,
            'degradation_factor_power': self.degradation_factor_power,
            'battery_degradation': self.battery_degradation
        }
        
    @classmethod
    def from_dict(cls, data: Dict) -> 'BatteryModel':
        """
        Create battery model from dictionary.
        
        Parameters:
        - data: Dictionary containing battery model parameters
        
        Returns:
        - BatteryModel instance
        """
        model = cls(
            initial_soc=data['initial_soc'],
            battery_power_capacity=data['battery_power_capacity'],
            battery_energy_capacity=data['battery_energy_capacity'],
            min_soc=data['min_soc'],
            max_soc=data['max_soc'],
            max_charging=data['max_charging'],
            max_discharging=data['max_discharging'],
            charging_efficiency=data['charging_efficiency'],
            discharging_efficiency=data['discharging_efficiency'],
            lifetime=data['lifetime']
        )
        
        # Update cycle count and degradation
        model.cycle_count = data['cycle_count']
        model.degradation_factor_energy = data['degradation_factor_energy']
        model.degradation_factor_power = data['degradation_factor_power']
        model.battery_degradation = data['battery_degradation']
        model._update_capacities()
        
        return model 