from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime # Import datetime for created_at typing

# --- Pydantic Schemas --- 
class PipelineBase(BaseModel):
    name: str = Field(..., min_length=1, description="The name of the pipeline")
    description: Optional[str] = Field(None, description="A description of the pipeline")
    countries: Optional[List[str]] = Field(None, description="List of countries associated with the pipeline")

class PipelineCreate(PipelineBase):
    pass # No extra fields needed for creation

class PipelineResponse(PipelineBase):
    pipeline_id: str # Assuming UUID is returned as string
    created_at: datetime # Use datetime for better type hinting

    class Config:
        from_attributes = True # Replaces orm_mode in Pydantic v2
