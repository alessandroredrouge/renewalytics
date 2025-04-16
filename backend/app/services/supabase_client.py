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

async def fetch_projects_for_pipeline(client: Client, pipeline_id: str) -> list[dict]:
    """Fetches all projects for a specific pipeline_id from the Supabase 'projects' table."""
    if not pipeline_id:
        print("No pipeline_id provided, cannot fetch projects.")
        return []
    
    try:
        response: APIResponse = client.table('projects')\
                                     .select('*')\
                                     .eq('pipeline_id', pipeline_id)\
                                     .execute()

        if not response.data:
            if hasattr(response, 'error') and response.error:
                 print(f"Error fetching projects for pipeline {pipeline_id}: {response.error}")
                 return []
            return [] # No projects found for this pipeline

        print(f"Successfully fetched {len(response.data)} projects for pipeline {pipeline_id}.")
        return response.data
    except Exception as e:
        print(f"An unexpected error occurred fetching projects for pipeline {pipeline_id}: {e}")
        return []

async def insert_project(client: Client, project_data: dict) -> dict:
    """Inserts a new project into the Supabase 'projects' table."""
    try:
        # We expect project_data to be a dict based on ProjectCreate schema
        response: APIResponse = client.table('projects').insert(project_data).execute()
        
        if not response.data:
            if hasattr(response, 'error') and response.error:
                 print(f"Error inserting project: {response.error}")
                 raise Exception(f"Database error: {response.error.message}")
            raise Exception("No data returned after project insert, although no explicit error was reported.")

        print(f"Successfully inserted project: {response.data[0].get('name')}") 
        return response.data[0]
    except Exception as e:
        print(f"An unexpected error occurred during project insert: {e}")
        raise
