import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
import os
import json
from datetime import datetime, timedelta

class PPAProfileGenerator:
    """
    A class for generating Power Purchase Agreement (PPA) profiles.
    Generates hourly profiles for a full year (8760 hours) with power and price data.
    """
    
    def __init__(self, 
                 profile_type: str = "flat",
                 base_power: float = 2.0,
                 base_price: float = 50.0,
                 seasonal_variation: float = 0.2,
                 daily_variation: float = 0.1,
                 price_escalation: float = 0.02,
                 start_date: str = "2024-01-01",
                 duration_years: int = 1):
        """
        Initialize the PPA profile generator with configuration parameters.
        
        Parameters:
        - profile_type: Type of profile to generate ('flat', 'solar', 'wind', 'custom')
        - base_power: Base power in MW
        - base_price: Base price in EUR/MWh
        - seasonal_variation: Seasonal variation factor (0-1)
        - daily_variation: Daily variation factor (0-1)
        - price_escalation: Annual price escalation factor (0-1)
        - start_date: Start date in YYYY-MM-DD format
        - duration_years: Duration of the PPA in years
        """
        self.profile_type = profile_type
        self.base_power = base_power
        self.base_price = base_price
        self.seasonal_variation = seasonal_variation
        self.daily_variation = daily_variation
        self.price_escalation = price_escalation
        self.start_date = start_date
        self.duration_years = duration_years
        
        # Validate inputs
        self._validate_inputs()
    
    def _validate_inputs(self):
        """Validate input parameters."""
        if self.profile_type not in ['flat', 'solar', 'wind', 'custom']:
            raise ValueError(f"Invalid profile_type: {self.profile_type}. Must be one of ['flat', 'solar', 'wind', 'custom']")
        
        if self.base_power <= 0:
            raise ValueError(f"base_power must be positive, got {self.base_power}")
        
        if self.base_price <= 0:
            raise ValueError(f"base_price must be positive, got {self.base_price}")
        
        if not 0 <= self.seasonal_variation <= 1:
            raise ValueError(f"seasonal_variation must be between 0 and 1, got {self.seasonal_variation}")
        
        if not 0 <= self.daily_variation <= 1:
            raise ValueError(f"daily_variation must be between 0 and 1, got {self.daily_variation}")
        
        if not 0 <= self.price_escalation <= 1:
            raise ValueError(f"price_escalation must be between 0 and 1, got {self.price_escalation}")
        
        try:
            datetime.strptime(self.start_date, '%Y-%m-%d')
        except ValueError:
            raise ValueError(f"start_date must be in YYYY-MM-DD format, got {self.start_date}")
        
        if self.duration_years <= 0:
            raise ValueError(f"duration_years must be positive, got {self.duration_years}")
    
    def generate_profile(self) -> pd.DataFrame:
        """
        Generate a PPA profile based on the specified parameters.
        
        Returns:
        - DataFrame with columns: datetime, power_mw, price_eur_mwh
        """
        # Create date range for the entire duration
        start_dt = datetime.strptime(self.start_date, '%Y-%m-%d')
        end_dt = start_dt + timedelta(days=365 * self.duration_years)
        date_range = pd.date_range(start=start_dt, end=end_dt, freq='H')
        
        # Initialize DataFrame
        df = pd.DataFrame(index=date_range)
        df.index.name = 'datetime'
        
        # Generate power profile based on profile type
        if self.profile_type == 'flat':
            df['power_mw'] = self.base_power
        elif self.profile_type == 'solar':
            df['power_mw'] = self._generate_solar_profile()
        elif self.profile_type == 'wind':
            df['power_mw'] = self._generate_wind_profile()
        else:  # custom
            df['power_mw'] = self._generate_custom_profile()
        
        # Generate price profile
        df['price_eur_mwh'] = self._generate_price_profile()
        
        # Reset index to make datetime a column
        df = df.reset_index()
        
        return df
    
    def _generate_solar_profile(self) -> pd.Series:
        """Generate a solar-like profile with seasonal and daily variations."""
        # Create a base profile with seasonal and daily variations
        hours = np.arange(len(self._get_date_range()))
        
        # Seasonal variation (sine wave with period of 365 days)
        seasonal_factor = 1 + self.seasonal_variation * np.sin(2 * np.pi * hours / (24 * 365))
        
        # Daily variation (sine wave with period of 24 hours)
        daily_factor = 1 + self.daily_variation * np.sin(2 * np.pi * hours / 24)
        
        # Combine factors
        combined_factor = seasonal_factor * daily_factor
        
        # Ensure minimum power is 0
        power = np.maximum(0, self.base_power * combined_factor)
        
        return pd.Series(power, index=self._get_date_range())
    
    def _generate_wind_profile(self) -> pd.Series:
        """Generate a wind-like profile with seasonal and random variations."""
        # Create a base profile with seasonal and random variations
        hours = np.arange(len(self._get_date_range()))
        
        # Seasonal variation (sine wave with period of 365 days)
        seasonal_factor = 1 + self.seasonal_variation * np.sin(2 * np.pi * hours / (24 * 365))
        
        # Random variation (noise)
        np.random.seed(42)  # For reproducibility
        random_factor = 1 + self.daily_variation * np.random.normal(0, 1, len(hours))
        
        # Combine factors
        combined_factor = seasonal_factor * random_factor
        
        # Ensure minimum power is 0
        power = np.maximum(0, self.base_power * combined_factor)
        
        return pd.Series(power, index=self._get_date_range())
    
    def _generate_custom_profile(self) -> pd.Series:
        """Generate a custom profile with user-defined parameters."""
        # For now, just return a flat profile
        # This can be extended with more complex logic
        return pd.Series(self.base_power, index=self._get_date_range())
    
    def _generate_price_profile(self) -> pd.Series:
        """Generate a price profile with escalation over time."""
        # Create a base price profile
        hours = np.arange(len(self._get_date_range()))
        
        # Calculate years from start for each hour
        years_from_start = hours / (24 * 365)
        
        # Apply price escalation
        price = self.base_price * (1 + self.price_escalation) ** years_from_start
        
        return pd.Series(price, index=self._get_date_range())
    
    def _get_date_range(self) -> pd.DatetimeIndex:
        """Get the date range for the profile."""
        start_dt = datetime.strptime(self.start_date, '%Y-%m-%d')
        end_dt = start_dt + timedelta(days=365 * self.duration_years)
        return pd.date_range(start=start_dt, end=end_dt, freq='H')
    
    def save_profile(self, filepath: str) -> None:
        """
        Generate and save the PPA profile to a CSV file.
        
        Parameters:
        - filepath: Path to save the CSV file
        """
        # Generate the profile
        df = self.generate_profile()
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        # Save to CSV
        df.to_csv(filepath, index=False)
        print(f"PPA profile saved to {filepath}")
    
    def to_json(self) -> str:
        """
        Convert the generator configuration to a JSON string.
        
        Returns:
        - JSON string representation of the generator configuration
        """
        config = {
            'profile_type': self.profile_type,
            'base_power': self.base_power,
            'base_price': self.base_price,
            'seasonal_variation': self.seasonal_variation,
            'daily_variation': self.daily_variation,
            'price_escalation': self.price_escalation,
            'start_date': self.start_date,
            'duration_years': self.duration_years
        }
        return json.dumps(config)
    
    @classmethod
    def from_json(cls, json_str: str) -> 'PPAProfileGenerator':
        """
        Create a PPAProfileGenerator instance from a JSON string.
        
        Parameters:
        - json_str: JSON string representation of the generator configuration
        
        Returns:
        - PPAProfileGenerator instance
        """
        config = json.loads(json_str)
        return cls(**config)


def generate_default_profile(output_file: str = "data/ppa_profiles/default_ppa.csv") -> None:
    """
    Generate a default PPA profile and save it to a file.
    
    Parameters:
    - output_file: Path to save the CSV file
    """
    generator = PPAProfileGenerator()
    generator.save_profile(output_file)


if __name__ == "__main__":
    # Example usage
    generator = PPAProfileGenerator(
        profile_type="solar",
        base_power=5.0,
        base_price=50.0,
        seasonal_variation=0.3,
        daily_variation=0.5,
        price_escalation=0.02,
        start_date="2024-01-01",
        duration_years=1
    )
    
    # Generate and save the profile
    generator.save_profile("data/ppa_profiles/solar_ppa_2024.csv")
    
    # Example of serializing to JSON
    config_json = generator.to_json()
    print(f"Generator configuration as JSON: {config_json}")
    
    # Example of creating from JSON
    new_generator = PPAProfileGenerator.from_json(config_json)
    print(f"Created new generator with same configuration") 