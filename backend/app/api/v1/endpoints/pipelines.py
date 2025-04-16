from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
import logging
from typing import List

# Import Supabase functions
from app.services.supabase_client import get_supabase_client, fetch_pipelines, insert_pipeline
# Import schemas from the dedicated file
from app.schemas.pipelines_schema import PipelineCreate, PipelineResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Pydantic Schemas --- 
# Removed from here - now in schemas/pipelines_schema.py

# --- Router --- 
router = APIRouter()

# GET all pipelines
@router.get("/", response_model=List[PipelineResponse])
async def get_all_pipelines(
    supabase_client: Client = Depends(get_supabase_client)
):
    """Endpoint to fetch all pipelines."""
    logger.info("Received request to get all pipelines")
    try:
        pipelines = await fetch_pipelines(supabase_client)
        logger.info(f"Successfully retrieved {len(pipelines)} pipelines.")
        # FastAPI will automatically validate the list against PipelineResponse
        return pipelines 
    except Exception as e:
        logger.error(f"Error fetching pipelines: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error fetching pipelines")

# POST new pipeline
@router.post("/", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
async def create_new_pipeline(
    pipeline_in: PipelineCreate, # Use imported schema
    supabase_client: Client = Depends(get_supabase_client)
):
    """Endpoint to create a new pipeline."""
    logger.info(f"Received request to create pipeline: {pipeline_in.name}")
    try:
        # Convert Pydantic model to dict for Supabase insert
        # Use model_dump() in Pydantic v2 instead of dict()
        pipeline_dict = pipeline_in.model_dump(exclude_unset=True)
        
        # Ensure 'countries' is null if empty list or None
        if pipeline_dict.get('countries') is not None and not pipeline_dict['countries']:
            pipeline_dict['countries'] = None

        created_pipeline = await insert_pipeline(supabase_client, pipeline_dict)
        logger.info(f"Successfully created pipeline with ID: {created_pipeline.get('pipeline_id')}")
        # Return the created pipeline data; FastAPI validates against PipelineResponse
        return created_pipeline
    except Exception as e:
        logger.error(f"Error creating pipeline: {e}", exc_info=True)
        # Provide a more specific error if possible (e.g., conflict if name must be unique)
        raise HTTPException(status_code=500, detail=f"Internal server error creating pipeline: {str(e)}")

# Add other pipeline-specific endpoints here in the future ...
