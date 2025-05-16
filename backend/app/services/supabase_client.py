import os
from supabase import create_client, Client
from dotenv import load_dotenv
from postgrest import APIResponse
import logging
from datetime import datetime, timedelta, timezone

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

async def update_project_in_db(client: Client, project_id: str, project_data: dict) -> dict | None:
    """Updates an existing project in the Supabase 'projects' table.

    Args:
        client: The Supabase client instance.
        project_id: The UUID of the project to update.
        project_data: A dictionary containing the fields to update.

    Returns:
        The updated project data as a dictionary, or None if not found.
    
    Raises:
        Exception: If the update operation fails.
    """
    if not project_id:
        logger.warning("update_project_in_db called without project_id")
        return None
    if not project_data:
        logger.warning("update_project_in_db called without project_data")
        return None # Or perhaps fetch the existing data?

    try:
        # Ensure pipeline_id is not accidentally removed if present
        # Supabase update only modifies provided fields
        response: APIResponse = client.table('projects') \
                                     .update(project_data) \
                                     .eq('project_id', project_id) \
                                     .execute()

        # Check if the update was successful and affected rows
        if response.data: 
            logger.info(f"Successfully updated project with ID: {project_id}")
            # The update response usually contains the updated record(s)
            return response.data[0] # Return the first (and should be only) updated record
        elif hasattr(response, 'error') and response.error:
            logger.error(f"Error updating project {project_id}: {response.error}")
            raise Exception(f"Database error during update: {response.error.message}")
        else:
            # This might mean the project_id didn't exist, though eq() usually handles this.
            # Depending on exact Supabase client behavior, maybe return None or raise not found.
            logger.warning(f"Update operation for project {project_id} returned no data and no error. Project might not exist.")
            return None # Indicate project not found or update had no effect

    except Exception as e:
        logger.error(f"An unexpected error occurred updating project {project_id}: {e}", exc_info=True)
        raise # Re-raise the exception

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

async def fetch_weekly_price_data(
    client: Client,
    country: str,
    market: str,
    year: int,
    week: int
) -> list[dict]:
    """Fetches price data for a specific country, market, year, and ISO week."""
    if not all([country, market, year, week]):
        logger.warning("fetch_weekly_price_data called with missing parameters.")
        return []

    try:
        # Calculate start and end date of the ISO week
        # ISO weeks start on Monday. isocalendar() returns (year, week, weekday)
        # Find the first day of the given year
        first_day_of_year = datetime(year, 1, 1, tzinfo=timezone.utc)
        
        # Calculate the date of the Monday of week 1
        if first_day_of_year.isocalendar()[2] > 4: # If Jan 1st is Fri, Sat, Sun, week 1 starts later
            first_monday_of_year = first_day_of_year + timedelta(days=(8 - first_day_of_year.isocalendar()[2]))
        else:
            first_monday_of_year = first_day_of_year - timedelta(days=(first_day_of_year.isocalendar()[2] - 1))
            
        # Calculate the start date (Monday of the target week)
        start_date = first_monday_of_year + timedelta(weeks=week - 1)
        end_date = start_date + timedelta(days=7) # End date is exclusive in range query

        start_date_str = start_date.strftime('%Y-%m-%d %H:%M:%S%z')
        end_date_str = end_date.strftime('%Y-%m-%d %H:%M:%S%z')
        
        logger.info(f"Querying prices for {country}/{market}, Year: {year}, Week: {week} ({start_date_str} to {end_date_str})")

        response: APIResponse = client.table('energy_prices') \
                                     .select('datetime, price') \
                                     .eq('country', country) \
                                     .eq('market', market) \
                                     .gte('datetime', start_date_str) \
                                     .lt('datetime', end_date_str) \
                                     .order('datetime', desc=False) \
                                     .execute()

        if not response.data:
            if hasattr(response, 'error') and response.error:
                 logger.error(f"Error fetching price data for {country}/{market} week {year}-{week}: {response.error}")
                 return []
            logger.info(f"No price data found for {country}/{market} week {year}-{week}.")
            return [] # No data found

        logger.info(f"Successfully fetched {len(response.data)} price points for {country}/{market} week {year}-{week}.")
        return response.data
    except Exception as e:
        logger.error(f"An unexpected error occurred fetching price data: {e}", exc_info=True)
        # Depending on requirements, might want to raise or return empty
        raise # Re-raise for the endpoint to handle
