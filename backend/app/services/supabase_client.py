import os
from supabase import create_client, Client
from dotenv import load_dotenv
from postgrest import APIResponse

# Load environment variables from .env file
load_dotenv()

url: str | None = os.environ.get("SUPABASE_URL")
key: str | None = os.environ.get("SUPABASE_ANON_KEY")

if not url or not key:
    raise EnvironmentError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")

def get_supabase_client() -> Client:
    """Creates and returns a Supabase client instance."""
    try:
        client: Client = create_client(url, key)
        return client
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        raise

async def fetch_pipelines(client: Client) -> list[dict]:
    """Fetches all pipelines from the Supabase 'pipelines' table."""
    try:
        response: APIResponse = client.table('pipelines').select('*').execute()
        # Check for Postgrest errors
        if not response.data:
             # Handle cases where data might be empty vs actual error if needed
            if hasattr(response, 'error') and response.error:
                 print(f"Error fetching pipelines: {response.error}")
                 return [] # Or raise an exception
            return [] # No error, just no data

        print(f"Successfully fetched {len(response.data)} pipelines.") # Added logging
        return response.data
    except Exception as e:
        print(f"An unexpected error occurred during pipeline fetch: {e}")
        # Depending on requirements, you might want to raise the exception
        # or return an empty list/handle it differently.
        return []

async def insert_pipeline(client: Client, pipeline_data: dict) -> dict:
    """Inserts a new pipeline into the Supabase 'pipelines' table."""
    try:
        response: APIResponse = client.table('pipelines').insert(pipeline_data).execute()
        # Check for Postgrest errors
        if not response.data:
            if hasattr(response, 'error') and response.error:
                 print(f"Error inserting pipeline: {response.error}")
                 # Rethrow or raise a custom exception based on error handling strategy
                 raise Exception(f"Database error: {response.error.message}")
            # Handle unexpected cases where data is empty without an error
            raise Exception("No data returned after insert, although no explicit error was reported.")

        print(f"Successfully inserted pipeline: {response.data[0]}")
        # Supabase insert typically returns a list containing the inserted record
        return response.data[0]
    except Exception as e:
        print(f"An unexpected error occurred during pipeline insert: {e}")
        # Re-raise the exception to be handled by the API endpoint
        raise
