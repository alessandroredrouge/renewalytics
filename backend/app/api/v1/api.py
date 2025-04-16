from fastapi import APIRouter

# Import the routers from the specific endpoint files
from app.api.v1.endpoints import pipelines, projects, dashboard

# Main router for the v1 API
api_v1_router = APIRouter()

# Include the pipelines router
api_v1_router.include_router(pipelines.router, prefix="/pipelines", tags=["Pipelines"])
# Include the projects router
api_v1_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
# Include the dashboard router
api_v1_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# You can include other endpoint routers here in the future, similar to the line above
# e.g., api_v1_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
