import pandas as pd
import os

def process_energy_data():
    """
    Process the manually downloaded energy price CSV files and combine them into a single dataframe
    """
    # List of files to process
    files = [
        'data/energy-charts_Electricity_production_and_spot_prices_in_Germany_in_2023.csv',
        'data/energy-charts_Electricity_production_and_spot_prices_in_Germany_in_2024.csv'
    ]
    
    # Initialize an empty list to store dataframes
    dfs = []
    
    for file in files:
        # Read the CSV file, skipping the second row (Price (EUR/MWh, EUR/tCO2))
        df = pd.read_csv(file, skiprows=[1])
        
        # Rename columns for clarity
        df = df.rename(columns={
            'Date (GMT+1)': 'datetime',
            'Day Ahead Auction (DE-LU)': 'price_eur_mwh'
        })
        
        # Convert datetime string to datetime object, handling the timezone
        df['datetime'] = pd.to_datetime(df['datetime'], utc=True).dt.tz_convert('Europe/Berlin').dt.tz_localize(None)
        
        # Append to the list of dataframes
        dfs.append(df)
    
    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Sort by datetime
    combined_df = combined_df.sort_values('datetime')
    
    # Save the combined dataframe to a new CSV file
    output_file = 'data/combined_energy_prices.csv'
    combined_df.to_csv(output_file, index=False)
    print(f"Combined data saved to {output_file}")
    
    # Display some basic information about the data
    print("\nData Summary:")
    print(f"Total number of records: {len(combined_df)}")
    print(f"Date range: from {combined_df['datetime'].min()} to {combined_df['datetime'].max()}")
    print(f"Price range: from {combined_df['price_eur_mwh'].min()} to {combined_df['price_eur_mwh'].max()} EUR/MWh")

if __name__ == "__main__":
    process_energy_data() 