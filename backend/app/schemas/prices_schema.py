from pydantic import BaseModel
from datetime import datetime
from typing import List

class PriceDataPoint(BaseModel):
    """Schema for a single price data point."""
    datetime: datetime
    price: float # Use float for numeric price data

    class Config:
        orm_mode = True # Enable ORM mode for potential future use

class PriceDataResponse(BaseModel):
    """Schema for the response containing a list of price data points."""
    data: List[PriceDataPoint]
