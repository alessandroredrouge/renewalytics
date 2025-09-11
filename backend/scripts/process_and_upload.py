import os
import sys
import logging
from app.logic.data_preprocessing import process_all_market_data
from app.logic.upload_to_supabase import upload_energy_prices_to_supabase

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("process_and_upload.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def main():
    """
    Main function to process market data and upload to Supabase
    """
    try:
        # Get country name from command line arguments or use default
        country_name = sys.argv[1] if len(sys.argv) > 1 else "Germany"
        
        # Process market data
        logger.info(f"Processing market data for {country_name}")
        process_all_market_data(country_name)
        
        # Path to the CSV file
        csv_file_path = os.path.join('data', 'energy_prices.csv')
        
        # Check if the file exists
        if not os.path.exists(csv_file_path):
            logger.error(f"File not found: {csv_file_path}")
            return
        
        # Upload data to Supabase
        logger.info("Uploading data to Supabase")
        total_uploaded = upload_energy_prices_to_supabase(csv_file_path)
        
        logger.info(f"Process and upload completed successfully. Total records uploaded: {total_uploaded}")
    
    except Exception as e:
        logger.error(f"Error in main function: {e}")

if __name__ == "__main__":
    main() 