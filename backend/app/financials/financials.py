"""
Calculates project financials based on various inputs.
"""

import pandas as pd
import numpy as np
import numpy_financial as npf
from typing import Dict, Any

def calculate_project_financials(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates the yearly cash flows and key financial metrics for a renewable energy project.

    Args:
        inputs: A dictionary containing all necessary financial parameters.
                Expected keys include:
                - project_lifetime_years (int)
                - initial_capex (float)
                - additional_capex (dict, e.g., {year: amount})
                - debt_up_front_fee_perc (float, percentage of initial capex)
                - salvage_value_perc (float, percentage of initial capex)
                - opex_fixed_yearly (float)
                - opex_variable_per_mwh (float, assuming revenue is linked to MWh)
                - yearly_revenue (list or np.array, revenue for years 1 to N)
                - debt_percentage (float, percentage of initial capex financed by debt)
                - interest_rate (float)
                - debt_term_years (int)
                - wacc (float, discount rate)
                - tax_rate (float)
                - depreciation_years (int)
                # Simplified NWC for now

    Returns:
        A dictionary containing:
        - 'cash_flow_df': pandas DataFrame with detailed yearly financial calculations.
        - 'npv': Net Present Value.
        - 'irr': Internal Rate of Return.
        - 'pbt': Simple Payback Time in years.
        - 'summary_metrics': Dict with key yearly metrics (EBITDA, EBIT, Net Income etc.)
    """

    # --- 1. Extract and Validate Inputs (Basic) ---
    project_lifetime = inputs.get('project_lifetime_years', 20)
    initial_capex = inputs.get('initial_capex', 10000000) # e.g., 10M
    additional_capex_schedule = inputs.get('additional_capex', {10: 1000000}) # e.g., 1M in year 10
    debt_up_front_fee_perc = inputs.get('debt_up_front_fee_perc', 0.01) # 1%
    salvage_value_perc = inputs.get('salvage_value_perc', 0.05) # 5%
    opex_fixed_yearly = inputs.get('opex_fixed_yearly', 200000) # 200k
    # opex_variable_per_mwh = inputs.get('opex_variable_per_mwh', 5) # Placeholder, link later
    # For now, use a simplified total yearly OPEX or placeholder revenues directly
    # Placeholder yearly revenue (Needs connection to optimizer output later)
    _revenue = inputs.get('yearly_revenue', np.linspace(1500000, 1200000, project_lifetime)) # Example decreasing revenue

    debt_percentage = inputs.get('debt_percentage', 0.70) # 70% Debt
    interest_rate = inputs.get('interest_rate', 0.06) # 6%
    debt_term_years = inputs.get('debt_term_years', 15)
    wacc = inputs.get('wacc', 0.08) # 8% Discount Rate
    tax_rate = inputs.get('tax_rate', 0.25) # 25% Tax Rate
    depreciation_years = inputs.get('depreciation_years', 15)

    # --- 2. Initial Setup --- 
    years = np.arange(project_lifetime + 1) # Include year 0 for initial investment
    df = pd.DataFrame(index=years)

    # Calculate derived initial values
    initial_debt = initial_capex * debt_percentage
    initial_equity = initial_capex * (1 - debt_percentage)
    debt_fee = initial_capex * debt_up_front_fee_perc # Often paid upfront from debt/equity
    total_initial_investment = initial_capex + debt_fee # Full funding requirement

    # --- 3. Initialize DataFrame Columns ---
    df['Revenue'] = 0.0
    df['OPEX Fixed'] = 0.0
    # df['OPEX Variable'] = 0.0 # Add later if needed
    df['Total OPEX'] = 0.0
    df['EBITDA'] = 0.0
    df['Depreciation'] = 0.0
    df['EBIT'] = 0.0
    df['Interest Expense'] = 0.0
    df['EBT'] = 0.0
    df['Taxes'] = 0.0
    df['Net Income'] = 0.0
    df['Debt Principal Repayment'] = 0.0
    df['Debt Outstanding (Start)'] = 0.0
    df['Debt Outstanding (End)'] = 0.0
    df['Additional CAPEX'] = 0.0
    df['Salvage Value'] = 0.0
    df['Free Cash Flow (FCFF)'] = 0.0
    df['Cumulative FCFF'] = 0.0

    # --- Placeholder for future logic ---
    # TODO: Implement Year 0 calculations
    # TODO: Implement yearly calculations (Year 1 to N)
    # TODO: Calculate final metrics (NPV, IRR, PBT)
    # TODO: Structure and return results

    # --- Example Return (Structure) ---
    results = {
        'cash_flow_df': df.to_dict(orient='list'), # Example: Return as dict
        'npv': 0.0, # Placeholder
        'irr': 0.0, # Placeholder
        'pbt': 0.0, # Placeholder
        'summary_metrics': {} # Placeholder
    }

    return results

# === Example Usage (for testing) ===
if __name__ == "__main__":
    # Use placeholder inputs defined within the function for now
    example_inputs = {
        'project_lifetime_years': 20,
        'initial_capex': 10000000, # 10M
        'additional_capex': {10: 1000000, 15: 500000}, # 1M in year 10, 0.5M in year 15
        'debt_up_front_fee_perc': 0.01,
        'salvage_value_perc': 0.05,
        'opex_fixed_yearly': 200000,
        # 'opex_variable_per_mwh': 5,
        'yearly_revenue': np.linspace(1500000, 1200000, 20), # Example: 1.5M down to 1.2M over 20 years
        'debt_percentage': 0.70,
        'interest_rate': 0.06,
        'debt_term_years': 15,
        'wacc': 0.08,
        'tax_rate': 0.25,
        'depreciation_years': 15
    }

    financial_results = calculate_project_financials(example_inputs)

    # Print basic output for verification (will be more detailed later)
    print("Financial Calculation Structure Initialized.")
    # print(pd.DataFrame(financial_results['cash_flow_df'])) # Uncomment to see initial DF
    print(f"NPV: {financial_results['npv']}")
    print(f"IRR: {financial_results['irr']}")
    print(f"PBT: {financial_results['pbt']}")
