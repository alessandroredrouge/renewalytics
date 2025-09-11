import numpy as np
from typing import Dict, List, Optional, Tuple

class BatteryOperations:
    """
    A class handling battery operations including state of charge (SOC) management.
    """
    
    def __init__(self,
                 capacity: float = 100,  # MWh
                 max_power: float = 25,  # MW
                 efficiency: float = 0.95,
                 min_soc: float = 0.1,
                 max_soc: float = 0.9,
                 initial_soc: float = 0.5):
        """
        Initialize battery operations with configuration parameters.
        
        Parameters:
        - capacity: Battery capacity in MWh
        - max_power: Maximum power in MW
        - efficiency: Round-trip efficiency (0-1)
        - min_soc: Minimum state of charge (0-1)
        - max_soc: Maximum state of charge (0-1)
        - initial_soc: Initial state of charge (0-1)
        """
        self.capacity = capacity
        self.max_power = max_power
        self.efficiency = efficiency
        self.min_soc = min_soc
        self.max_soc = max_soc
        self.initial_soc = initial_soc
        
        # Initialize state of charge
        self.current_soc = initial_soc
        
        # Initialize operation history
        self.operation_history = []
        
    def update_soc(self, power: float, time_step: float) -> float:
        """
        Update the state of charge based on power input/output.
        
        Args:
        - power: Power in MW (positive for charging, negative for discharging)
        - time_step: Time step in hours
        
        Returns:
        - New state of charge
        """
        try:
            # Calculate energy change
            energy_change = power * time_step * self.efficiency if power > 0 else power * time_step / self.efficiency
            
            # Update SOC
            new_soc = self.current_soc + energy_change / self.capacity
            
            # Ensure SOC stays within bounds
            new_soc = max(self.min_soc, min(self.max_soc, new_soc))
            
            # Update current SOC
            self.current_soc = new_soc
            
            # Record operation
            self.operation_history.append({
                'power': power,
                'duration': time_step,
                'soc': new_soc
            })
            
            return new_soc
        except Exception as e:
            print(f"Error in update_soc: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return self.current_soc
        
    def get_available_power(self, direction: str) -> float:
        """
        Get available power for a given direction, considering capacity market commitments.
        
        Args:
        - direction: 'charge' or 'discharge'
        
        Returns:
        - Available power in MW
        """
        try:
            if direction == 'charge':
                # For charging, we need to consider:
                # 1. Maximum power limit
                # 2. Available energy capacity
                # 3. Current SOC
                max_charge_power = min(
                    self.max_power,
                    (self.max_soc - self.current_soc) * self.capacity / self.time_step
                )
                return max_charge_power
            elif direction == 'discharge':
                # For discharging, we need to consider:
                # 1. Maximum power limit
                # 2. Available energy
                # 3. Current SOC
                # 4. Capacity market commitments
                max_discharge_power = min(
                    self.max_power,
                    (self.current_soc - self.min_soc) * self.capacity / self.time_step
                )
                return max_discharge_power
            else:
                raise ValueError(f"Invalid direction: {direction}. Must be 'charge' or 'discharge'")
        except Exception as e:
            print(f"Error in get_available_power: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return 0.0
            
    def get_soc(self) -> float:
        """
        Get the current state of charge.
        
        Returns:
        - Current state of charge (0-1)
        """
        return self.current_soc
        
    def reset(self) -> None:
        """
        Reset the battery to its initial state.
        """
        self.current_soc = self.initial_soc
        self.operation_history = []
        
    def to_dict(self) -> Dict:
        """
        Convert battery operations to dictionary.
        
        Returns:
        - Dictionary representation of battery operations
        """
        return {
            'capacity': self.capacity,
            'max_power': self.max_power,
            'efficiency': self.efficiency,
            'min_soc': self.min_soc,
            'max_soc': self.max_soc,
            'initial_soc': self.initial_soc,
            'current_soc': self.current_soc,
            'operation_history': self.operation_history
        }
        
    @classmethod
    def from_dict(cls, data: Dict) -> 'BatteryOperations':
        """
        Create battery operations from dictionary.
        
        Parameters:
        - data: Dictionary containing battery operations parameters
        
        Returns:
        - BatteryOperations instance
        """
        battery = cls(
            capacity=data['capacity'],
            max_power=data['max_power'],
            efficiency=data['efficiency'],
            min_soc=data['min_soc'],
            max_soc=data['max_soc'],
            initial_soc=data['initial_soc']
        )
        
        # Restore current SOC and operation history
        battery.current_soc = data['current_soc']
        battery.operation_history = data['operation_history']
        
        return battery 