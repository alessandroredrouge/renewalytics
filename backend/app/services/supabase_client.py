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
        response: APIResponse = client.table('pipelines').select('pipeline_id, name, description, countries').execute()
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
