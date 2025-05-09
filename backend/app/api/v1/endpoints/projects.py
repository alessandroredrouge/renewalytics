from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
import logging
from typing import List

# Import Supabase functions and client getter
from app.services.supabase_client import (
    get_supabase_client, 
    insert_project, 
    fetch_projects_for_pipeline,
    fetch_project_by_id
)
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

@router.get("/", response_model=List[ProjectResponse])
async def get_projects(
    pipeline_id: str = Query(..., description="The ID of the pipeline to fetch projects for"),
    supabase_client: Client = Depends(get_supabase_client)
):
    """Endpoint to fetch projects filtered by pipeline_id."""
    logger.info(f"Received request to get projects for pipeline_id: {pipeline_id}")
    try:
        projects = await fetch_projects_for_pipeline(supabase_client, pipeline_id)
        # FastAPI will validate the list against ProjectResponse
        return projects
    except Exception as e:
        logger.error(f"Error fetching projects for pipeline {pipeline_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error fetching projects")

# GET endpoint for a single project by ID
@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project_details(
    project_id: str,
    supabase_client: Client = Depends(get_supabase_client)
):
    """Endpoint to fetch details for a specific project by its ID."""
    logger.info(f"Received request to get details for project_id: {project_id}")
    try:
        project = await fetch_project_by_id(supabase_client, project_id)
        if project is None:
            logger.warning(f"Project {project_id} not found in database.")
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
        # FastAPI will validate the dict against ProjectResponse
        return project
    except HTTPException as http_exc: # Re-raise HTTP exceptions explicitly
        raise http_exc
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error fetching project details")
