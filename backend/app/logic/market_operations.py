import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
import os
import random
import gurobipy as gp
from gurobipy import GRB

class MarketOperations:
    """
    A class handling market operations including price fetching and bidding.
    """
    
    def __init__(self,
                 country: str = "Germany",
                 market: str = "Wholesale",
                 fcr_acceptance_rate: float = 0.35,
                 afrr_acceptance_rate: float = 0.5,
                 mfrr_acceptance_rate: float = 0.2):
        """
        Initialize market operations with configuration parameters.
        
        Parameters:
        - country: Country for which to fetch price data
        - market: Market type for which to fetch price data
        - fcr_acceptance_rate: Acceptance rate for FCR bids
        - afrr_acceptance_rate: Acceptance rate for aFRR bids
        - mfrr_acceptance_rate: Acceptance rate for mFRR bids
        """
        self.country = country
        self.market = market
        self.fcr_acceptance_rate = fcr_acceptance_rate
        self.afrr_acceptance_rate = afrr_acceptance_rate
        self.mfrr_acceptance_rate = mfrr_acceptance_rate
        
        # Time blocks for capacity markets (4-hour blocks)
        self.time_blocks = [
            (0, 4),   # 00:00-04:00
            (4, 8),   # 04:00-08:00
            (8, 12),  # 08:00-12:00
            (12, 16), # 12:00-16:00
            (16, 20), # 16:00-20:00
            (20, 24)  # 20:00-24:00
        ]
        
        # Initialize bidding results
        self.fcr_bids = {}
        self.afrr_bids = {}
        self.mfrr_bids = {}
        self.bid_results = {}
        
        # Load price data
        self._load_price_data()
            
    def _load_price_data(self) -> None:
        """
        Load price data from the CSV files.
        """
        try:
            print("\nLoading price data from CSV files...")
            
            # Load market prices
            price_file = os.path.join(os.path.dirname(__file__), 'data', 'energy_prices.csv')
            if os.path.exists(price_file):
                self.price_data = pd.read_csv(price_file)
                print(f"Successfully loaded price data with {len(self.price_data)} records")
                print(f"Columns: {self.price_data.columns.tolist()}")
            else:
                print(f"Price file not found: {price_file}")
                self.price_data = pd.DataFrame()
            
            # Load PPA data from all files in the ppa_profiles directory
            ppa_dir = os.path.join(os.path.dirname(__file__), 'data', 'ppa_profiles')
            self.ppa_data = pd.DataFrame()
            
            if os.path.exists(ppa_dir):
                for filename in os.listdir(ppa_dir):
                    if filename.endswith('.csv'):
                        file_path = os.path.join(ppa_dir, filename)
                        print(f"\nLoading PPA profile: {filename}")
                        
                        # Read the CSV file
                        ppa_df = pd.read_csv(file_path)
                        ppa_df['datetime'] = pd.to_datetime(ppa_df['datetime'])
                        
                        # Add filename as a column to identify the PPA
                        ppa_df['ppa_name'] = os.path.splitext(filename)[0]
                        
                        # Append to the main PPA dataframe
                        self.ppa_data = pd.concat([self.ppa_data, ppa_df], ignore_index=True)
                
                if not self.ppa_data.empty:
                    # Sort by datetime
                    self.ppa_data = self.ppa_data.sort_values('datetime')
                    print(f"Successfully loaded {len(self.ppa_data)} PPA records from {len(os.listdir(ppa_dir))} files")
                else:
                    print("No PPA profiles found in the directory")
            else:
                print("PPA profiles directory not found")
            
        except Exception as e:
            print(f"Error loading price data: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            self.price_data = pd.DataFrame()
            self.ppa_data = pd.DataFrame()

    def get_ppa_obligation(self, datetime: str) -> Dict[str, Tuple[float, float]]:
        """
        Get PPA obligations for a specific datetime from all PPA profiles.
        
        Args:
        - datetime: Datetime string
        
        Returns:
        - Dictionary with PPA name as key and tuple of (power_obligation, price) as value
        """
        try:
            if self.ppa_data.empty:
                return {}
                
            dt = pd.Timestamp(datetime)
            matching_rows = self.ppa_data[self.ppa_data['datetime'] == dt]
            
            if matching_rows.empty:
                return {}
                
            # Create dictionary with PPA name as key and (power, price) as value
            ppa_obligations = {}
            for _, row in matching_rows.iterrows():
                ppa_obligations[row['ppa_name']] = (row['power'], row['price'])
                
            return ppa_obligations
            
        except Exception as e:
            print(f"Error getting PPA obligations: {str(e)}")
            return {}

    def optimize_day_ahead_bids(
            self,
            battery_capacity: float,
            max_power: float,
            current_soc: float,
            current_datetime: str
        ) -> Dict:
        """
        Optimize day-ahead bids for capacity markets (FCR, aFRR, mFRR).
        
        Args:
        - battery_capacity: Total battery capacity in MWh
        - max_power: Maximum power in MW
        - current_soc: Current state of charge (0-1)
        - current_datetime: Current datetime string
        
        Returns:
        - Dictionary containing bid results for each market
        """
        try:
            print("\nOptimizing day-ahead bids...")
            
            # Initialize results
            results = {
                'FCR': {},
                'aFRR': {},
                'mFRR': {}
            }
            
            # Get current datetime
            current_dt = pd.Timestamp(current_datetime)
            
            # Define bidding blocks (4-hour blocks)
            blocks = [(0, 4), (4, 8), (8, 12), (12, 16), (16, 20), (20, 24)]
            
            # Get prices for next day
            next_day = current_dt + pd.Timedelta(days=1)
            
            # Get prices for each market
            fcr_prices, _ = self._fetch_prices_from_csv(market='FCR', target_date=next_day)
            afrr_prices, _ = self._fetch_prices_from_csv(market='aFRR', target_date=next_day)
            mfrr_prices, _ = self._fetch_prices_from_csv(market='mFRR', target_date=next_day)
            
            # Calculate available power for each market
            # FCR requires 100% availability
            fcr_available = min(max_power, battery_capacity * (1 - current_soc))
            
            # aFRR requires 50% availability
            afrr_available = min(max_power * 0.5, battery_capacity * (1 - current_soc) * 0.5)
            
            # mFRR requires 25% availability
            mfrr_available = min(max_power * 0.25, battery_capacity * (1 - current_soc) * 0.25)
            
            # Optimize bids for each block
            for block in blocks:
                start_hour, end_hour = block
                
                # Get average prices for the block
                fcr_block_price = np.mean(fcr_prices[start_hour:end_hour]) if len(fcr_prices) > end_hour else 0
                afrr_block_price = np.mean(afrr_prices[start_hour:end_hour]) if len(afrr_prices) > end_hour else 0
                mfrr_block_price = np.mean(mfrr_prices[start_hour:end_hour]) if len(mfrr_prices) > end_hour else 0
                
                # Calculate expected revenue for each market
                fcr_revenue = fcr_available * fcr_block_price * self.fcr_acceptance_rate
                afrr_revenue = afrr_available * afrr_block_price * self.afrr_acceptance_rate
                mfrr_revenue = mfrr_available * mfrr_block_price * self.mfrr_acceptance_rate
                
                # Store bid results
                results['FCR'][block] = {
                    'power': fcr_available,
                    'price': fcr_block_price,
                    'revenue': fcr_revenue,
                    'accepted': np.random.random() < self.fcr_acceptance_rate
                }
                
                results['aFRR'][block] = {
                    'power': afrr_available,
                    'price': afrr_block_price,
                    'revenue': afrr_revenue,
                    'accepted': np.random.random() < self.afrr_acceptance_rate
                }
                
                results['mFRR'][block] = {
                    'power': mfrr_available,
                    'price': mfrr_block_price,
                    'revenue': mfrr_revenue,
                    'accepted': np.random.random() < self.mfrr_acceptance_rate
                }
                
                print(f"\nBlock {start_hour}-{end_hour}:")
                print(f"FCR: {fcr_available:.2f} MW @ {fcr_block_price:.2f} EUR/MW/h")
                print(f"aFRR: {afrr_available:.2f} MW @ {afrr_block_price:.2f} EUR/MW/h")
                print(f"mFRR: {mfrr_available:.2f} MW @ {mfrr_block_price:.2f} EUR/MW/h")
            
            return results
            
        except Exception as e:
            print(f"Error in optimize_day_ahead_bids: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return {}
            
    def _fetch_prices_from_csv(self, market: str, target_date: Optional[pd.Timestamp] = None) -> Tuple[List[float], List[str]]:
        """
        Fetch price data from CSV files for a specific market and date.
        
        Args:
            market: Market name (FCR, aFRR, mFRR, Wholesale)
            target_date: Optional target date to filter prices
            
        Returns:
            Tuple of (prices, datetimes)
        """
        try:
            print(f"\nFetching {market} prices for {self.country}...")
            
            if self.price_data.empty:
                print("No price data available")
                return [], []
            
            # Filter by country and market
            df = self.price_data[
                (self.price_data['country'] == self.country) & 
                (self.price_data['market'] == market)
            ]
            
            # Filter by price_type for aFRR and mFRR
            if market in ['aFRR', 'mFRR']:
                df = df[df['price_type'] == 'Positive']
            
            if df.empty:
                print(f"No price data available for country: {self.country} and market: {market}")
                return [], []
            
            # Get prices and datetimes
            prices = df['price'].values
            datetimes = df['datetime'].values
            
            # Convert to lists
            prices = prices.tolist()
            datetimes = datetimes.tolist()
            
            # Filter by date if specified
            if target_date is not None:
                target_date_str = target_date.strftime('%Y-%m-%d')
                filtered_prices = []
                filtered_datetimes = []
                for price, dt in zip(prices, datetimes):
                    if dt.startswith(target_date_str):
                        filtered_prices.append(price)
                        filtered_datetimes.append(dt)
                return filtered_prices, filtered_datetimes
            
            return prices, datetimes
            
        except Exception as e:
            print(f"Error in _fetch_prices_from_csv: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return [], []
            
    def to_dict(self) -> Dict:
        """
        Convert market operations to dictionary.
        
        Returns:
        - Dictionary representation of market operations
        """
        return {
            'country': self.country,
            'market': self.market,
            'fcr_acceptance_rate': self.fcr_acceptance_rate,
            'afrr_acceptance_rate': self.afrr_acceptance_rate,
            'mfrr_acceptance_rate': self.mfrr_acceptance_rate,
            'fcr_bids': self.fcr_bids,
            'afrr_bids': self.afrr_bids,
            'mfrr_bids': self.mfrr_bids,
            'bid_results': self.bid_results
        }
        
    @classmethod
    def from_dict(cls, data: Dict) -> 'MarketOperations':
        """
        Create market operations from dictionary.
        
        Parameters:
        - data: Dictionary containing market operations parameters
        
        Returns:
        - MarketOperations instance
        """
        operations = cls(
            country=data['country'],
            market=data['market'],
            fcr_acceptance_rate=data['fcr_acceptance_rate'],
            afrr_acceptance_rate=data['afrr_acceptance_rate'],
            mfrr_acceptance_rate=data['mfrr_acceptance_rate']
        )
        
        # Restore bidding results
        operations.fcr_bids = data['fcr_bids']
        operations.afrr_bids = data['afrr_bids']
        operations.mfrr_bids = data['mfrr_bids']
        operations.bid_results = data['bid_results']
        
        return operations 