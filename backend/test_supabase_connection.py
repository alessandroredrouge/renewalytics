import os
from dotenv import load_dotenv
from supabase import create_client, Client
import pandas as pd

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def test_supabase_connection(country="Germany", market="Wholesale"):
    """
    Test the connection to Supabase and retrieve energy price data.
    
    Parameters:
    - country: Country to filter by (default: "Germany")
    - market: Market type to filter by (default: "Wholesale")
    """
    try:
        # Initialize variables for pagination
        all_data = []
        page_size = 1000
        offset = 0
        has_more = True
        
        # Fetch data in batches until no more data is available
        while has_more:
            # Query the energy_prices table with filters and pagination
            response = supabase.table('energy_prices').select('*').eq('country', country).eq('market', market).range(offset, offset + page_size - 1).execute()
            
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
            print(f"No data found for country={country} and market={market}")
            return False
        
        # Display basic information
        print(f"Successfully connected to Supabase!")
        print(f"Retrieved {len(df)} rows from the energy_prices table for {country} - {market}")
        print("\nFirst 5 rows:")
        print(df.head())
        
        # Display data types
        print("\nData types:")
        print(df.dtypes)
        
        # Display basic statistics
        print("\nBasic statistics for price:")
        print(df['price'].describe())
        
        # Display unique countries and markets
        print("\nAvailable countries:")
        print(df['country'].unique())
        print("\nAvailable markets:")
        print(df['market'].unique())
        
        # Display date range
        if 'datetime' in df.columns:
            df['datetime'] = pd.to_datetime(df['datetime'])
            print("\nDate range:")
            print(f"From: {df['datetime'].min()}")
            print(f"To: {df['datetime'].max()}")
        
        return True
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        return False

if __name__ == "__main__":
    # Test with default parameters
    test_supabase_connection()
    