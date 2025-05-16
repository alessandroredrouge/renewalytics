from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
from .battery_model import BatteryModel
from .market_operations import MarketOperations
from .optimization import BatteryOptimizer

app = FastAPI()

class BatteryConfig(BaseModel):
    initial_soc: float = 0.4
    battery_power_capacity: float = 10
    battery_energy_capacity: float = 40
    min_soc: float = 0.2
    max_soc: float = 0.8
    max_charging: float = 7
    max_discharging: float = 10
    country: str = "Germany"
    market: str = "Wholesale"
    charging_efficiency: float = 0.95
    discharging_efficiency: float = 0.95
    lifetime: int = 15
    simulation_year: int = 0
    fcr_acceptance_rate: float = 0.35
    afrr_acceptance_rate: float = 0.5
    mfrr_acceptance_rate: float = 0.2
    ppa_profile_path: Optional[str] = None
    look_ahead: int = 24
    action_horizon: int = 6

class OptimizationRequest(BaseModel):
    current_datetime: str
    current_soc: float
    config: BatteryConfig

class OptimizationResponse(BaseModel):
    action: str
    revenue: float
    cost: float
    usage_cost: float
    net_revenue: float
    new_soc: float
    cycle_count: int

# Store optimizer instances
optimizers: Dict[str, BatteryOptimizer] = {}

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize(request: OptimizationRequest):
    """
    Optimize battery operations for the current state.
    
    Parameters:
    - request: OptimizationRequest containing current state and configuration
    
    Returns:
    - OptimizationResponse with optimization results
    """
    try:
        # Create a unique key for this configuration
        config_key = f"{request.config.country}_{request.config.market}_{request.config.simulation_year}"
        
        # Create or get optimizer instance
        if config_key not in optimizers:
            battery_model = BatteryModel(
                initial_soc=request.config.initial_soc,
                battery_power_capacity=request.config.battery_power_capacity,
                battery_energy_capacity=request.config.battery_energy_capacity,
                min_soc=request.config.min_soc,
                max_soc=request.config.max_soc,
                max_charging=request.config.max_charging,
                max_discharging=request.config.max_discharging,
                charging_efficiency=request.config.charging_efficiency,
                discharging_efficiency=request.config.discharging_efficiency,
                lifetime=request.config.lifetime
            )
            
            market_operations = MarketOperations(
                country=request.config.country,
                market=request.config.market,
                fcr_acceptance_rate=request.config.fcr_acceptance_rate,
                afrr_acceptance_rate=request.config.afrr_acceptance_rate,
                mfrr_acceptance_rate=request.config.mfrr_acceptance_rate,
                ppa_profile_path=request.config.ppa_profile_path
            )
            
            optimizers[config_key] = BatteryOptimizer(
                battery_model=battery_model,
                market_operations=market_operations,
                look_ahead=request.config.look_ahead,
                action_horizon=request.config.action_horizon
            )
        
        # Get optimizer instance
        optimizer = optimizers[config_key]
        
        # Run optimization
        result = optimizer.optimize(request.current_datetime, request.current_soc)
        
        # Return results
        return OptimizationResponse(
            action=result['action'],
            revenue=result['revenue'],
            cost=result['cost'],
            usage_cost=result['usage_cost'],
            net_revenue=result['net_revenue'],
            new_soc=result['new_soc'],
            cycle_count=result['cycle_count']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
    - Dictionary with health status
    """
    return {"status": "healthy"} 