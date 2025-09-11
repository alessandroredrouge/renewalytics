import pandas as pd
import os
import re
import glob

def extract_country_from_path(file_path):
    """
    Extract the country name from the file path.
    Expected format: data/CountryName/filename.csv
    """
    # Normalize path separators to forward slashes
    normalized_path = file_path.replace('\\', '/')
    
    # Extract the country name from the path
    match = re.search(r'data/([^/]+)/', normalized_path)
    if match:
        return match.group(1)
    else:
        raise ValueError(f"Could not extract country name from path: {file_path}")

def process_energy_data(file_paths):
    """
    Process the manually downloaded energy price CSV files and combine them into a single dataframe
    
    Args:
        file_paths: List of file paths to process
        
    Returns:
        DataFrame with the processed data
    """
    # Extract country name from the first file path
    country = extract_country_from_path(file_paths[0])
    
    # Initialize an empty list to store dataframes
    dfs = []
    
    for file_path in file_paths:
        # Read the CSV file, skipping the second row (Price (EUR/MWh, EUR/tCO2))
        df = pd.read_csv(file_path, skiprows=[1])
        
        # Rename columns for clarity
        df = df.rename(columns={
            'Date (GMT+1)': 'datetime',
            'Day Ahead Auction (DE-LU)': 'price'
        })
        
        # Convert datetime string to datetime object, handling the timezone
        df['datetime'] = pd.to_datetime(df['datetime'], utc=True).dt.tz_convert('Europe/Berlin').dt.tz_localize(None)
        
        # Add the required columns
        df['country'] = country
        df['market'] = 'Wholesale'
        df['price_type'] = '-'
        
        # Select and reorder columns
        df = df[['country', 'market', 'price_type', 'datetime', 'price']]
        
        # Append to the list of dataframes
        dfs.append(df)
    
    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Sort by country, market, price_type, datetime
    combined_df = combined_df.sort_values(['country', 'market', 'price_type', 'datetime'])
    
    return combined_df

def process_capacity_market_data(country_name):
    """
    Process capacity market data from Excel files
    
    Args:
        country_name: Name of the country to process data for
        
    Returns:
        DataFrame with the processed capacity market data
    """
    # Define the pattern for capacity market files
    pattern = os.path.join('data', country_name, 'RESULT_OVERVIEW_CAPACITY_MARKET_FCR_*.xlsx')
    
    # Find all matching files
    capacity_files = glob.glob(pattern)
    
    if not capacity_files:
        print(f"No capacity market files found for {country_name}")
        return None
    
    # Initialize an empty list to store dataframes
    dfs = []
    
    for file_path in capacity_files:
        # Read the Excel file
        df = pd.read_excel(file_path)
        
        # Extract date and time information
        df['date'] = pd.to_datetime(df['DATE_FROM'])
        
        # Process each row to extract hour information and create hourly entries
        hourly_entries = []
        
        for _, row in df.iterrows():
            # Extract hour from PRODUCTNAME (format: NEGPOS_HH1_HH2)
            product_name = row['PRODUCTNAME']
            hour_match = re.search(r'NEGPOS_(\d+)_\d+', product_name)
            
            if hour_match:
                start_hour = int(hour_match.group(1))
                price = row['GERMANY_SETTLEMENTCAPACITY_PRICE_[EUR/MW]']
                
                # Create entries for 4 consecutive hours
                for hour_offset in range(4):
                    hour = start_hour + hour_offset
                    if hour >= 24:  # Handle day rollover
                        hour = hour - 24
                        # Create a new datetime for the next day
                        entry_date = row['date'] + pd.Timedelta(days=1)
                    else:
                        entry_date = row['date']
                    
                    # Create datetime by combining date and hour
                    entry_datetime = entry_date.replace(hour=hour)
                    
                    # Create entry
                    entry = {
                        'country': country_name,
                        'market': 'FCR',
                        'price_type': '-',
                        'datetime': entry_datetime,
                        'price': 0.0 if price == '-' else (float(price) if pd.notna(price) else 0.0)  # Handle dash character
                    }
                    
                    hourly_entries.append(entry)
        
        # Convert hourly entries to DataFrame
        if hourly_entries:
            hourly_df = pd.DataFrame(hourly_entries)
            dfs.append(hourly_df)
    
    if not dfs:
        print(f"No valid capacity market data found for {country_name}")
        return None
    
    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Sort by country, market, price_type, datetime
    combined_df = combined_df.sort_values(['country', 'market', 'price_type', 'datetime'])
    
    # Ensure price column is numeric
    combined_df['price'] = pd.to_numeric(combined_df['price'], errors='coerce').fillna(0.0)
    
    # Remove duplicate entries with price = 0 (only for Capacity market data)
    # First, identify rows with the same key columns but different prices
    key_columns = ['country', 'market', 'price_type', 'datetime']
    
    # Create a mask for rows to keep
    # We'll keep the row with the highest price when there are duplicates
    keep_mask = combined_df.groupby(key_columns)['price'].transform('max') == combined_df['price']
    
    # Apply the mask to filter the dataframe
    combined_df = combined_df[keep_mask]
    
    return combined_df

def process_afrr_market_data(country_name):
    """
    Process aFRR market data from Excel files
    
    Args:
        country_name: Name of the country to process data for
        
    Returns:
        DataFrame with the processed aFRR market data
    """
    # Define the pattern for aFRR market files
    pattern = os.path.join('data', country_name, 'RESULT_OVERVIEW_CAPACITY_MARKET_aFRR_*.xlsx')
    
    # Find all matching files
    afrr_files = glob.glob(pattern)
    
    if not afrr_files:
        print(f"No aFRR market files found for {country_name}")
        return None
    
    # Initialize an empty list to store dataframes
    dfs = []
    
    for file_path in afrr_files:
        # Read the Excel file
        df = pd.read_excel(file_path)
        
        # Extract date and time information
        df['date'] = pd.to_datetime(df['DATE_FROM'])
        
        # Process each row to extract hour information and create hourly entries
        hourly_entries = []
        
        for _, row in df.iterrows():
            # Extract hour and direction from PRODUCT (format: POS_HH1_HH2 or NEG_HH1_HH2)
            product = row['PRODUCT']
            product_match = re.search(r'(POS|NEG)_(\d+)_\d+', product)
            
            if product_match:
                direction = product_match.group(1)
                start_hour = int(product_match.group(2))
                price = row['GERMANY_AVERAGE_CAPACITY_PRICE_[(EUR/MW)/h]']
                
                # Set price_type based on direction
                price_type = 'Positive' if direction == 'POS' else 'Negative'
                
                # Create entries for 4 consecutive hours
                for hour_offset in range(4):
                    hour = start_hour + hour_offset
                    if hour >= 24:  # Handle day rollover
                        hour = hour - 24
                        # Create a new datetime for the next day
                        entry_date = row['date'] + pd.Timedelta(days=1)
                    else:
                        entry_date = row['date']
                    
                    # Create datetime by combining date and hour
                    entry_datetime = entry_date.replace(hour=hour)
                    
                    # Create entry
                    entry = {
                        'country': country_name,
                        'market': 'aFRR',
                        'price_type': price_type,
                        'datetime': entry_datetime,
                        'price': 0.0 if price == '-' else (float(price) if pd.notna(price) else 0.0)  # Handle dash character
                    }
                    
                    hourly_entries.append(entry)
        
        # Convert hourly entries to DataFrame
        if hourly_entries:
            hourly_df = pd.DataFrame(hourly_entries)
            dfs.append(hourly_df)
    
    if not dfs:
        print(f"No valid aFRR market data found for {country_name}")
        return None
    
    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Sort by country, market, price_type, datetime
    combined_df = combined_df.sort_values(['country', 'market', 'price_type', 'datetime'])
    
    # Ensure price column is numeric
    combined_df['price'] = pd.to_numeric(combined_df['price'], errors='coerce').fillna(0.0)
    
    # Remove duplicate entries with price = 0
    key_columns = ['country', 'market', 'price_type', 'datetime']
    keep_mask = combined_df.groupby(key_columns)['price'].transform('max') == combined_df['price']
    combined_df = combined_df[keep_mask]
    
    return combined_df

def process_mfrr_market_data(country_name):
    """
    Process mFRR market data from Excel files
    
    Args:
        country_name: Name of the country to process data for
        
    Returns:
        DataFrame with the processed mFRR market data
    """
    # Define the pattern for mFRR market files
    pattern = os.path.join('data', country_name, 'RESULT_OVERVIEW_CAPACITY_MARKET_mFRR_*.xlsx')
    
    # Find all matching files
    mfrr_files = glob.glob(pattern)
    
    if not mfrr_files:
        print(f"No mFRR market files found for {country_name}")
        return None
    
    # Initialize an empty list to store dataframes
    dfs = []
    
    for file_path in mfrr_files:
        # Read the Excel file
        df = pd.read_excel(file_path)
        
        # Extract date and time information
        df['date'] = pd.to_datetime(df['DATE_FROM'])
        
        # Process each row to extract hour information and create hourly entries
        hourly_entries = []
        
        for _, row in df.iterrows():
            # Extract hour and direction from PRODUCT (format: POS_HH1_HH2 or NEG_HH1_HH2)
            product = row['PRODUCT']
            product_match = re.search(r'(POS|NEG)_(\d+)_\d+', product)
            
            if product_match:
                direction = product_match.group(1)
                start_hour = int(product_match.group(2))
                price = row['GERMANY_AVERAGE_CAPACITY_PRICE_[(EUR/MW)/h]']
                
                # Set price_type based on direction
                price_type = 'Positive' if direction == 'POS' else 'Negative'
                
                # Create entries for 4 consecutive hours
                for hour_offset in range(4):
                    hour = start_hour + hour_offset
                    if hour >= 24:  # Handle day rollover
                        hour = hour - 24
                        # Create a new datetime for the next day
                        entry_date = row['date'] + pd.Timedelta(days=1)
                    else:
                        entry_date = row['date']
                    
                    # Create datetime by combining date and hour
                    entry_datetime = entry_date.replace(hour=hour)
                    
                    # Create entry
                    entry = {
                        'country': country_name,
                        'market': 'mFRR',
                        'price_type': price_type,
                        'datetime': entry_datetime,
                        'price': 0.0 if price == '-' else (float(price) if pd.notna(price) else 0.0)  # Handle dash character
                    }
                    
                    hourly_entries.append(entry)
        
        # Convert hourly entries to DataFrame
        if hourly_entries:
            hourly_df = pd.DataFrame(hourly_entries)
            dfs.append(hourly_df)
    
    if not dfs:
        print(f"No valid mFRR market data found for {country_name}")
        return None
    
    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Sort by country, market, price_type, datetime
    combined_df = combined_df.sort_values(['country', 'market', 'price_type', 'datetime'])
    
    # Ensure price column is numeric
    combined_df['price'] = pd.to_numeric(combined_df['price'], errors='coerce').fillna(0.0)
    
    # Remove duplicate entries with price = 0
    key_columns = ['country', 'market', 'price_type', 'datetime']
    keep_mask = combined_df.groupby(key_columns)['price'].transform('max') == combined_df['price']
    combined_df = combined_df[keep_mask]
    
    return combined_df

def process_energy_afrr_market_data(country_name):
    """
    Process energy aFRR market data from Excel files
    
    Args:
        country_name: Name of the country to process data for
        
    Returns:
        DataFrame with the processed energy aFRR market data
    """
    # Define the pattern for energy aFRR market files
    pattern = os.path.join('data', country_name, 'RESULT_OVERVIEW_ENERGY_MARKET_aFRR_*.xlsx')
    
    # Find all matching files
    energy_afrr_files = glob.glob(pattern)
    
    if not energy_afrr_files:
        print(f"No energy aFRR market files found for {country_name}")
        return None
    
    # Initialize an empty list to store dataframes
    dfs = []
    
    for file_path in energy_afrr_files:
        # Read the Excel file
        df = pd.read_excel(file_path)
        
        # Extract date information
        df['date'] = pd.to_datetime(df['DELIVERY_DATE'])
        
        # Process each row to extract hour information and create hourly entries
        hourly_entries = []
        
        # First, extract the direction and hour information from each row
        for _, row in df.iterrows():
            product = row['PRODUCT']
            product_match = re.search(r'(POS|NEG)_(\d+)', product)
            
            if product_match:
                direction = product_match.group(1)
                quarter_hour_index = int(product_match.group(2))
                
                # Calculate hour from quarter_hour_index (HH1/4 - 1)
                # Ensure hour is within valid range (0-23)
                hour = (quarter_hour_index // 4) % 24
                
                # Set price_type based on direction
                price_type = 'Positive' if direction == 'POS' else 'Negative'
                
                # Get the price value
                price = row['GERMANY_AVERAGE_ENERGY_PRICE_[EUR/MWh]']
                price_value = 0.0 if price == '-' else (float(price) if pd.notna(price) else 0.0)
                
                # Create datetime by combining date and hour
                entry_datetime = row['date'].replace(hour=hour)
                
                # Create entry
                entry = {
                    'country': country_name,
                    'market': 'eaFRR',
                    'price_type': price_type,
                    'datetime': entry_datetime,
                    'price': price_value
                }
                
                hourly_entries.append(entry)
        
        # Convert hourly entries to DataFrame
        if hourly_entries:
            hourly_df = pd.DataFrame(hourly_entries)
            
            # Group by datetime and price_type to calculate hourly averages
            grouped_df = hourly_df.groupby(['datetime', 'price_type'])['price'].mean().reset_index()
            
            # Add country and market columns
            grouped_df['country'] = country_name
            grouped_df['market'] = 'eaFRR'
            
            # Reorder columns
            grouped_df = grouped_df[['country', 'market', 'price_type', 'datetime', 'price']]
            
            dfs.append(grouped_df)
    
    if not dfs:
        print(f"No valid energy aFRR market data found for {country_name}")
        return None
    
    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Sort by country, market, price_type, datetime
    combined_df = combined_df.sort_values(['country', 'market', 'price_type', 'datetime'])
    
    # Ensure price column is numeric
    combined_df['price'] = pd.to_numeric(combined_df['price'], errors='coerce').fillna(0.0)
    
    # Remove duplicate entries with price = 0
    key_columns = ['country', 'market', 'price_type', 'datetime']
    keep_mask = combined_df.groupby(key_columns)['price'].transform('max') == combined_df['price']
    combined_df = combined_df[keep_mask]
    
    return combined_df

def process_energy_mfrr_market_data(country_name):
    """
    Process energy mFRR market data from Excel files
    
    Args:
        country_name: Name of the country to process data for
        
    Returns:
        DataFrame with the processed energy mFRR market data
    """
    # Define the pattern for energy mFRR market files
    pattern = os.path.join('data', country_name, 'RESULT_OVERVIEW_ENERGY_MARKET_mFRR_*.xlsx')
    
    # Find all matching files
    energy_mfrr_files = glob.glob(pattern)
    
    if not energy_mfrr_files:
        print(f"No energy mFRR market files found for {country_name}")
        return None
    
    # Initialize an empty list to store dataframes
    dfs = []
    
    for file_path in energy_mfrr_files:
        # Read the Excel file
        df = pd.read_excel(file_path)
        
        # Extract date information
        df['date'] = pd.to_datetime(df['DELIVERY_DATE'])
        
        # Process each row to extract hour information and create hourly entries
        hourly_entries = []
        
        # First, extract the direction and hour information from each row
        for _, row in df.iterrows():
            product = row['PRODUCT']
            product_match = re.search(r'(POS|NEG)_(\d+)', product)
            
            if product_match:
                direction = product_match.group(1)
                quarter_hour_index = int(product_match.group(2))
                
                # Calculate hour from quarter_hour_index (HH1/4 - 1)
                # Ensure hour is within valid range (0-23)
                hour = (quarter_hour_index // 4) % 24
                
                # Set price_type based on direction
                price_type = 'Positive' if direction == 'POS' else 'Negative'
                
                # Get the price value
                price = row['GERMANY_AVERAGE_ENERGY_PRICE_[EUR/MWh]']
                price_value = 0.0 if price == '-' else (float(price) if pd.notna(price) else 0.0)
                
                # Create datetime by combining date and hour
                entry_datetime = row['date'].replace(hour=hour)
                
                # Create entry
                entry = {
                    'country': country_name,
                    'market': 'emFRR',
                    'price_type': price_type,
                    'datetime': entry_datetime,
                    'price': price_value
                }
                
                hourly_entries.append(entry)
        
        # Convert hourly entries to DataFrame
        if hourly_entries:
            hourly_df = pd.DataFrame(hourly_entries)
            
            # Group by datetime and price_type to calculate hourly averages
            grouped_df = hourly_df.groupby(['datetime', 'price_type'])['price'].mean().reset_index()
            
            # Add country and market columns
            grouped_df['country'] = country_name
            grouped_df['market'] = 'emFRR'
            
            # Reorder columns
            grouped_df = grouped_df[['country', 'market', 'price_type', 'datetime', 'price']]
            
            dfs.append(grouped_df)
    
    if not dfs:
        print(f"No valid energy mFRR market data found for {country_name}")
        return None
    
    # Combine all dataframes
    combined_df = pd.concat(dfs, ignore_index=True)
    
    # Sort by country, market, price_type, datetime
    combined_df = combined_df.sort_values(['country', 'market', 'price_type', 'datetime'])
    
    # Ensure price column is numeric
    combined_df['price'] = pd.to_numeric(combined_df['price'], errors='coerce').fillna(0.0)
    
    # Remove duplicate entries with price = 0
    key_columns = ['country', 'market', 'price_type', 'datetime']
    keep_mask = combined_df.groupby(key_columns)['price'].transform('max') == combined_df['price']
    combined_df = combined_df[keep_mask]
    
    return combined_df

def process_all_market_data(country_name):
    """
    Process energy, FCR, aFRR, mFRR, energy aFRR, and energy mFRR market data for a country and merge them into a single output file
    
    Args:
        country_name: Name of the country to process data for
        
    Returns:
        DataFrame with all market data
    """
    # Process energy market data
    energy_files = [
        os.path.join('data', country_name, 'energy-charts_Electricity_production_and_spot_prices_in_Germany_in_2023.csv'),
        os.path.join('data', country_name, 'energy-charts_Electricity_production_and_spot_prices_in_Germany_in_2024.csv')
    ]
    
    # Check if files exist
    energy_files = [f for f in energy_files if os.path.exists(f)]
    
    if energy_files:
        energy_df = process_energy_data(energy_files)
    else:
        print(f"No energy market files found for {country_name}")
        energy_df = None
    
    # Process FCR market data
    fcr_df = process_capacity_market_data(country_name)
    
    # Process aFRR market data
    afrr_df = process_afrr_market_data(country_name)
    
    # Process mFRR market data
    mfrr_df = process_mfrr_market_data(country_name)
    
    # Process energy aFRR market data
    energy_afrr_df = process_energy_afrr_market_data(country_name)
    
    # Process energy mFRR market data
    energy_mfrr_df = process_energy_mfrr_market_data(country_name)
    
    # Merge all dataframes
    dfs_to_combine = []
    
    if energy_df is not None:
        dfs_to_combine.append(energy_df)
    
    if fcr_df is not None:
        dfs_to_combine.append(fcr_df)
    
    if afrr_df is not None:
        dfs_to_combine.append(afrr_df)
    
    if mfrr_df is not None:
        dfs_to_combine.append(mfrr_df)
    
    if energy_afrr_df is not None:
        dfs_to_combine.append(energy_afrr_df)
    
    if energy_mfrr_df is not None:
        dfs_to_combine.append(energy_mfrr_df)
    
    if not dfs_to_combine:
        print(f"No market data found for {country_name}")
        return None
    
    # Combine all dataframes
    combined_df = pd.concat(dfs_to_combine, ignore_index=True)
    
    # Sort by country, market, price_type, datetime
    combined_df = combined_df.sort_values(['country', 'market', 'price_type', 'datetime'])
    
    # Save the combined dataframe to a new CSV file
    output_dir = os.path.join('data')
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, 'energy_prices.csv')
    combined_df.to_csv(output_file, index=False)
    print(f"Combined market data saved to {output_file}")
    
    # Display some basic information about the combined data
    print("\nCombined Market Data Summary:")
    print(f"Total number of records: {len(combined_df)}")
    print(f"Countries: {', '.join(combined_df['country'].unique())}")
    print(f"Markets: {', '.join(combined_df['market'].unique())}")
    print(f"Price Types: {', '.join(combined_df['price_type'].unique())}")
    print(f"Date range: from {combined_df['datetime'].min()} to {combined_df['datetime'].max()}")
    print(f"Price range: from {combined_df['price'].min()} to {combined_df['price'].max()}")
    
    return combined_df

if __name__ == "__main__":
    # Example usage
    country = "Germany"
    all_market_data = process_all_market_data(country) 