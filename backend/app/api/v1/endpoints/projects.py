from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
import logging
from typing import List

# Import Supabase functions and client getter
from app.services.supabase_client import get_supabase_client, insert_project 
# Import schemas
from app.schemas.projects_schema import ProjectCreate, ProjectResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    project_in: ProjectCreate,
    supabase_client: Client = Depends(get_supabase_client)
):
    """Endpoint to create a new project associated with a pipeline."""
    logger.info(f"Received request to create project: {project_in.name} for pipeline {project_in.pipeline_id}")
    try:
        # Convert Pydantic model to dict for Supabase insert
        project_dict = project_in.model_dump(exclude_unset=True) 
        
        # Potentially add validation here (e.g., check if pipeline_id exists)
        
        created_project = await insert_project(supabase_client, project_dict)
        logger.info(f"Successfully created project with ID: {created_project.get('project_id')}")
        return created_project
    except Exception as e:
        logger.error(f"Error creating project: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error creating project: {str(e)}")

# TODO: Add GET endpoints later
# e.g., GET /?pipeline_id={pipeline_id} to get projects for a specific pipeline
# e.g., GET /{project_id} to get a specific project
