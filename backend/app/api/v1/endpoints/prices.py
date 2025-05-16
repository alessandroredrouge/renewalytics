from fastapi import APIRouter, Depends, HTTPException, Query, status
from supabase import Client
import logging
from typing import List

from app.services.supabase_client import get_supabase_client, fetch_weekly_price_data
from app.schemas.prices_schema import PriceDataPoint # Import the single point schema

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/weekly", response_model=List[PriceDataPoint]) # Respond with a list of points
async def get_weekly_prices(
    country: str = Query(..., description="Country name"),
    market: str = Query(..., description="Market/Revenue Stream name"),
    year: int = Query(..., description="Year (e.g., 2024)", ge=2000, le=2100), # Basic validation
    week: int = Query(..., description="ISO week number (1-53)", ge=1, le=53),   # Basic validation
    supabase_client: Client = Depends(get_supabase_client)
):
    """Endpoint to fetch weekly price data for a specific country, market, year, and week."""
    logger.info(f"Received request for weekly prices: {country=}, {market=}, {year=}, {week=}")
    try:
        price_data = await fetch_weekly_price_data(
            client=supabase_client,
            country=country,
            market=market,
            year=year,
            week=week
        )
        # FastAPI will automatically validate the list items against PriceDataPoint
        return price_data
    except Exception as e:
        logger.error(f"Error processing request for weekly prices: {e}", exc_info=True)
        # Consider more specific error codes if possible (e.g., 404 if country/market invalid)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error fetching weekly price data: {str(e)}"
        )
