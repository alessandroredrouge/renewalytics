import asyncio
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from pydantic import BaseModel
import logging

from app.services.supabase_client import get_supabase_client, count_projects, count_pipelines

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class DashboardSummaryResponse(BaseModel):
    project_count: int
    pipeline_count: int

@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    supabase: Client = Depends(get_supabase_client)
):
    """Endpoint to fetch summary data for the dashboard."""
    try:
        # Fetch counts concurrently
        project_count, pipeline_count = await asyncio.gather(
            count_projects(supabase),
            count_pipelines(supabase)
        )
        logger.info(f"Successfully fetched dashboard summary: Projects={project_count}, Pipelines={pipeline_count}")
        return DashboardSummaryResponse(project_count=project_count, pipeline_count=pipeline_count)
    except Exception as e:
        # Log the full error details server-side for better debugging
        logger.error(f"Error fetching dashboard summary: {e.__class__.__name__} - {e}", exc_info=True)
        # Return a generic error to the client
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard summary data.")
