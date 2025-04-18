import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("supabase_upload.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

def check_table_exists():
    """
    Check if the energy_prices table exists in Supabase
    
    Returns:
        bool: True if the table exists, False otherwise
    """
    try:
        # Try to query the table to see if it exists
        supabase.table('energy_prices').select('*').limit(1).execute()
        logger.info("Table 'energy_prices' exists")
        return True
    except Exception as e:
        logger.warning(f"Table 'energy_prices' does not exist: {e}")
        return False

def print_table_creation_instructions():
    """
    Print instructions for manually creating the energy_prices table in Supabase
    """
    print("\n" + "="*80)
    print("TABLE CREATION INSTRUCTIONS")
    print("="*80)
    print("The 'energy_prices' table does not exist in your Supabase database.")
    print("Please create it manually using the following SQL in the Supabase SQL Editor:")
    print("\nCREATE TABLE IF NOT EXISTS public.energy_prices (")
    print("    id SERIAL PRIMARY KEY,")
    print("    country TEXT NOT NULL,")
    print("    market TEXT NOT NULL,")
    print("    price_type TEXT NOT NULL,")
    print("    datetime TIMESTAMP WITH TIME ZONE NOT NULL,")
    print("    price NUMERIC NOT NULL,")
    print("    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
    print(");")
    print("\nAfter creating the table, run this script again.")
    print("="*80 + "\n")

def upload_energy_prices_to_supabase(csv_file_path):
    """
    Upload energy price data from CSV to Supabase
    
    Args:
        csv_file_path: Path to the CSV file containing energy price data
        
    Returns:
        Number of records uploaded
    """
    try:
        # Read the CSV file
        logger.info(f"Reading data from {csv_file_path}")
        df = pd.read_csv(csv_file_path)
        
        # Convert datetime column to ISO format for Supabase
        df['datetime'] = pd.to_datetime(df['datetime']).dt.strftime('%Y-%m-%dT%H:%M:%S')
        
        # Convert DataFrame to list of dictionaries for Supabase
        records = df.to_dict(orient='records')
        
        # Upload data to Supabase
        logger.info(f"Uploading {len(records)} records to Supabase")
        
        # Check if the table exists
        if not check_table_exists():
            print_table_creation_instructions()
            return 0
        
        # Upload data in batches to avoid hitting size limits
        batch_size = 1000
        total_uploaded = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i+batch_size]
            result = supabase.table('energy_prices').insert(batch).execute()
            total_uploaded += len(batch)
            logger.info(f"Uploaded batch {i//batch_size + 1}, total records: {total_uploaded}")
        
        logger.info(f"Successfully uploaded {total_uploaded} records to Supabase")
        return total_uploaded
    
    except Exception as e:
        logger.error(f"Error uploading data to Supabase: {e}")
        raise

def main():
    """
    Main function to upload energy price data to Supabase
    """
    try:
        # Path to the CSV file
        csv_file_path = os.path.join('data', 'energy_prices.csv')
        
        # Check if the file exists
        if not os.path.exists(csv_file_path):
            logger.error(f"File not found: {csv_file_path}")
            return
        
        # Upload data to Supabase
        total_uploaded = upload_energy_prices_to_supabase(csv_file_path)
        
        logger.info(f"Upload completed successfully. Total records uploaded: {total_uploaded}")
    
    except Exception as e:
        logger.error(f"Error in main function: {e}")

if __name__ == "__main__":
    main() 