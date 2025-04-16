from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Base model with fields common to create and response
class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, description="The name of the project")
    description: Optional[str] = Field(None, description="A description of the project")
    country: Optional[str] = Field(None, description="The country where the project is located")
    location: Optional[str] = Field(None, description="Specific location or coordinates")
    type_of_plant: Optional[List[str]] = Field(None, description="Types of plants involved (e.g., ['BESS', 'PV'])")
    technology: Optional[str] = Field(None, description="Specific technology used (e.g., Li-ion NMC)")
    hybrid: Optional[bool] = Field(None, description="Indicates if the project combines multiple types")
    
    # Technical Parameters
    nominal_power_capacity: Optional[float] = Field(None, description="Rated power capacity in MW")
    max_discharging_power: Optional[float] = Field(None, description="Maximum discharging power in MW")
    max_charging_power: Optional[float] = Field(None, description="Maximum charging power in MW (BESS)")
    nominal_energy_capacity: Optional[float] = Field(None, description="Rated energy capacity in MWh (BESS)")
    max_soc: Optional[float] = Field(None, description="Maximum State of Charge in % (BESS)")
    min_soc: Optional[float] = Field(None, description="Minimum State of Charge in % (BESS)")
    charging_efficiency: Optional[float] = Field(None, description="Charging efficiency in % (BESS)")
    discharging_efficiency: Optional[float] = Field(None, description="Discharging efficiency in %")
    calendar_lifetime: Optional[int] = Field(None, description="Expected lifetime in years")
    cycling_lifetime: Optional[int] = Field(None, description="Expected lifetime in cycles (BESS)")

    # Economic Parameters
    capex_power: Optional[float] = Field(None, description="CAPEX per unit of power ($/kW)")
    capex_energy: Optional[float] = Field(None, description="CAPEX per unit of energy ($/kWh, BESS)")
    capex_tot: Optional[float] = Field(None, description="Total Capital Expenditure ($)")
    opex_power_yr: Optional[float] = Field(None, description="OPEX per unit of power per year ($/kW/yr)")
    opex_energy_yr: Optional[float] = Field(None, description="OPEX per unit of energy per year ($/kWh/yr, BESS)")
    opex_yr: Optional[float] = Field(None, description="Total Operational Expenditure per year ($/yr)")
    revenue_streams: Optional[List[str]] = Field(None, description="List of revenue streams (e.g., ['Arbitrage'])")

# Schema for creating a new project (data received from frontend)
class ProjectCreate(ProjectBase):
    pipeline_id: str = Field(..., description="The ID of the pipeline this project belongs to")

# Schema for responding with project data (data sent to frontend)
class ProjectResponse(ProjectBase):
    project_id: str # Assuming UUID is returned as string
    pipeline_id: str
    created_at: datetime

    class Config:
        from_attributes = True # For Pydantic v2
