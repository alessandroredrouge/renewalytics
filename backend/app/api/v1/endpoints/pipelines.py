from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
import logging # Import logging

from app.services.supabase_client import get_supabase_client, fetch_pipelines

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=list[dict]) # Changed path from /pipelines/ to /
async def get_all_pipelines(
    supabase_client: Client = Depends(get_supabase_client)
):
    """Endpoint to fetch all pipelines."""
    logger.info("Received request to get all pipelines") # Updated log message
    try:
        pipelines = await fetch_pipelines(supabase_client)
        logger.info(f"Successfully retrieved {len(pipelines)} pipelines.") # Added logging
        return pipelines
    except Exception as e:
        logger.error(f"Error fetching pipelines: {e}", exc_info=True) # Added logging with traceback
        # Re-raise a generic HTTP exception for the client
        raise HTTPException(status_code=500, detail="Internal server error fetching pipelines")

# If you have other routers, make sure this one is included in your main app
