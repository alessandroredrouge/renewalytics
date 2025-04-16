from fastapi import APIRouter

# Import the router from the specific endpoint file
from app.api.v1.endpoints import pipelines

# Main router for the v1 API
api_v1_router = APIRouter()

# Include the pipelines router with a specific prefix and tags
api_v1_router.include_router(pipelines.router, prefix="/pipelines", tags=["Pipelines"])

# You can include other endpoint routers here in the future, similar to the line above
# e.g., api_v1_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
