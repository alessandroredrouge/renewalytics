import os
from supabase import create_client, Client
from dotenv import load_dotenv
from postgrest import APIResponse
import logging

# Load environment variables from .env file
load_dotenv()

url: str | None = os.environ.get("SUPABASE_URL")
key: str | None = os.environ.get("SUPABASE_ANON_KEY")

if not url or not key:
    raise EnvironmentError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")

logger = logging.getLogger(__name__)

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

async def fetch_project_by_id(client: Client, project_id: str) -> dict | None:
    """Fetches a single project by its ID from the Supabase 'projects' table."""
    if not project_id:
        logger.warning("fetch_project_by_id called without project_id")
        return None
    
    try:
        response: APIResponse = client.table('projects') \
                                     .select('*') \
                                     .eq('project_id', project_id) \
                                     .limit(1) \
                                     .maybe_single() \
                                     .execute()
        
        # .maybe_single() returns None if no row is found, or the single row dict
        if response.data:
            logger.info(f"Successfully fetched project with ID: {project_id}")
            return response.data
        else:
            logger.warning(f"Project with ID {project_id} not found.")
            return None 
            
    except Exception as e:
        logger.error(f"An unexpected error occurred fetching project {project_id}: {e}", exc_info=True)
        # Depending on how you want to handle errors upstream, you might raise here
        raise # Re-raise the exception to be handled by the endpoint

async def count_projects(client: Client) -> int:
    """Counts the total number of projects in the Supabase 'projects' table."""
    try:
        response = client.table('projects').select('*', count='exact').execute()
        # Log the raw response object for inspection
        logger.info(f"Raw count_projects response object: {response}")
        try:
            logger.info(f"Raw count_projects response dict: {response.__dict__}")
        except AttributeError:
             logger.info("Raw count_projects response has no __dict__")

        if hasattr(response, 'error') and response.error:
            logger.error(f"Error counting projects: {response.error}")
            raise Exception(f"Database error while counting projects: {response.error.message}")
        
        count = response.count if response.count is not None else 0
        logger.info(f"Successfully counted {count} projects.")
        return count
    except Exception as e:
        logger.error(f"An unexpected error occurred during project count: {e}", exc_info=True)
        raise # Re-raise to be handled by the caller

async def count_pipelines(client: Client) -> int:
    """Counts the total number of pipelines in the Supabase 'pipelines' table."""
    try:
        response = client.table('pipelines').select('*', count='exact').execute()
        # Log the raw response object for inspection
        logger.info(f"Raw count_pipelines response object: {response}")
        try:
             logger.info(f"Raw count_pipelines response dict: {response.__dict__}")
        except AttributeError:
             logger.info("Raw count_pipelines response has no __dict__")

        if hasattr(response, 'error') and response.error:
            logger.error(f"Error counting pipelines: {response.error}")
            raise Exception(f"Database error while counting pipelines: {response.error.message}")

        count = response.count if response.count is not None else 0
        logger.info(f"Successfully counted {count} pipelines.")
        return count
    except Exception as e:
        logger.error(f"An unexpected error occurred during pipeline count: {e}", exc_info=True)
        raise
