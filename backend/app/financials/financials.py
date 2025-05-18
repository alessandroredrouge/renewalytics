"""
Calculates project financials based on various inputs.
"""

import pandas as pd
import numpy as np
import numpy_financial as npf
from typing import Dict, Any, List

def calculate_project_financials(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates the yearly cash flows and key financial metrics for a renewable energy project.

    Args:
        inputs: A flat dictionary containing all necessary financial parameters.
                Expected keys include:
                - project_lifetime_years (int)
                - initial_capex (float)
                - opex_fixed_yearly (float) (Year 1 fixed OPEX)
                - yearly_revenue (List[float], revenue for years 1 to N)
                - wacc (float, discount rate, e.g., 0.08 for 8%)
                - salvage_value_perc (float, e.g., 0.05 for 5% of initial_capex)
                - debt_percentage (float, e.g., 0.70 for 70%)
                - interest_rate (float, e.g., 0.06 for 6%)
                - debt_term_years (int)
                - debt_up_front_fee_perc_of_debt (float, e.g., 0.01 for 1% of initial_debt)
                - tax_rate (float, e.g., 0.25 for 25%)
                - depreciation_years (int, for straight-line)
                - opex_fixed_escalation_rate (float, e.g., 0.025 for 2.5%)
                - additional_capex_schedule (dict, optional, e.g., {10: 1000000})
                # - opex_variable_per_mwh (float, optional)
                # - yearly_mwh_throughput (List[float], optional, if variable OPEX used)

    Returns:
        A dictionary containing:
        - 'cash_flow_df': pandas DataFrame with detailed yearly financial calculations.
        - 'npv': Net Present Value.
        - 'irr': Internal Rate of Return.
        - 'dpbt': Discounted Payback Time in years.
        - 'summary_metrics': Dict with key yearly metrics totals (EBITDA, EBIT, Net Income etc.)
    """

    # --- 1. Extract and Validate Inputs ---
    project_lifetime = inputs.get('project_lifetime_years', 20)
    initial_capex = inputs.get('initial_capex', 0.0)
    opex_fixed_yearly_y1 = inputs.get('opex_fixed_yearly', 0.0)
    yearly_revenue = inputs.get('yearly_revenue', [0.0] * project_lifetime)
    if len(yearly_revenue) != project_lifetime:
        raise ValueError(f"Length of yearly_revenue ({len(yearly_revenue)}) must match project_lifetime_years ({project_lifetime}).")

    wacc = inputs.get('wacc', 0.08)
    salvage_value_perc = inputs.get('salvage_value_perc', 0.0)

    debt_percentage = inputs.get('debt_percentage', 0.0)
    interest_rate = inputs.get('interest_rate', 0.0)
    debt_term_years = inputs.get('debt_term_years', project_lifetime) # Default to project life if not specified
    debt_up_front_fee_perc_of_debt = inputs.get('debt_up_front_fee_perc_of_debt', 0.0)

    tax_rate = inputs.get('tax_rate', 0.0)
    depreciation_years = inputs.get('depreciation_years', project_lifetime) # Default to project life
    opex_fixed_escalation_rate = inputs.get('opex_fixed_escalation_rate', 0.0)
    additional_capex_schedule = inputs.get('additional_capex_schedule', {}) # Optional

    # --- 2. Initial Setup ---
    years = np.arange(project_lifetime + 1) # Include year 0 for initial investment
    df = pd.DataFrame(index=years)

    # Calculate derived initial values
    initial_debt = initial_capex * debt_percentage
    # initial_equity = initial_capex * (1 - debt_percentage) # Not directly used in FCFF model but good to know
    debt_fee = initial_debt * debt_up_front_fee_perc_of_debt
    total_initial_investment_outflow = initial_capex + debt_fee # Full funding requirement at T0

    # --- 3. Initialize DataFrame Columns ---
    df['Revenue'] = 0.0
    df['OPEX Fixed'] = 0.0
    # df['OPEX Variable'] = 0.0 # For future use
    df['Total OPEX'] = 0.0
    df['EBITDA'] = 0.0
    df['Depreciation'] = 0.0
    df['EBIT'] = 0.0
    df['Interest Expense'] = 0.0
    df['EBT'] = 0.0
    df['Taxes'] = 0.0
    df['Net Income'] = 0.0
    df['Debt Service Coverage Ratio (DSCR)'] = np.nan # Placeholder for potential future metric

    df['Debt Outstanding (Start)'] = 0.0
    df['Debt Principal Repayment'] = 0.0
    df['Debt Outstanding (End)'] = 0.0

    df['Initial CAPEX'] = 0.0
    df['Additional CAPEX'] = 0.0
    df['Salvage Value'] = 0.0
    df['Total CAPEX Year'] = 0.0 # Sum of initial, additional, less salvage

    df['Free Cash Flow (FCFF)'] = 0.0
    df['Cumulative FCFF'] = 0.0

    # --- 4. Year 0 Calculations ---
    df.loc[0, 'Initial CAPEX'] = initial_capex
    df.loc[0, 'Debt Outstanding (End)'] = initial_debt # Debt is drawn at T0
    # FCFF for Year 0 is the total initial investment (outflow)
    # Note: Debt fee is part of the project cost here, reducing initial FCFF.
    # Alternatively, it can be a financing cash flow not in project FCFF.
    # For project IRR, including it makes sense if it's a required project setup cost.
    df.loc[0, 'Free Cash Flow (FCFF)'] = -total_initial_investment_outflow
    df.loc[0, 'Total CAPEX Year'] = total_initial_investment_outflow # Simplified for T0

    # --- 5. Yearly Calculations (Year 1 to project_lifetime) ---
    annual_depreciation_amount = initial_capex / depreciation_years if depreciation_years > 0 else 0

    df['Discount Factor'] = 0.0 # New column for discount factor
    df['Discounted FCFF'] = 0.0 # New column for discounted FCFF

    # Set discount factor for year 0
    df.loc[0, 'Discount Factor'] = 1 / ((1 + wacc) ** 0)
    df.loc[0, 'Discounted FCFF'] = df.loc[0, 'Free Cash Flow (FCFF)'] * df.loc[0, 'Discount Factor']

    for year in range(1, project_lifetime + 1):
        # Revenue
        df.loc[year, 'Revenue'] = yearly_revenue[year-1] if year-1 < len(yearly_revenue) else 0

        # OPEX
        df.loc[year, 'OPEX Fixed'] = opex_fixed_yearly_y1 * ((1 + opex_fixed_escalation_rate) ** (year - 1))
        # df.loc[year, 'OPEX Variable'] = ... # If mwh throughput and variable rate are provided
        df.loc[year, 'Total OPEX'] = df.loc[year, 'OPEX Fixed'] # + df.loc[year, 'OPEX Variable']

        # EBITDA
        df.loc[year, 'EBITDA'] = df.loc[year, 'Revenue'] - df.loc[year, 'Total OPEX']

        # Depreciation
        if year <= depreciation_years:
            df.loc[year, 'Depreciation'] = annual_depreciation_amount
        else:
            df.loc[year, 'Depreciation'] = 0.0

        # EBIT
        df.loc[year, 'EBIT'] = df.loc[year, 'EBITDA'] - df.loc[year, 'Depreciation']

        # Debt Calculations
        df.loc[year, 'Debt Outstanding (Start)'] = df.loc[year-1, 'Debt Outstanding (End)']

        if df.loc[year, 'Debt Outstanding (Start)'] > 0 and year <= debt_term_years:
            # Using numpy_financial for pmt, ipmt, ppmt assumes a loan taken at T0 and first payment at T1
            # The period for npf functions is 1-indexed for the payment number
            current_payment_period = year
            # Ensure we don't calculate interest/principal beyond the debt term or if debt is paid off
            if current_payment_period <= debt_term_years:
                interest_payment = -npf.ipmt(interest_rate, current_payment_period, debt_term_years, initial_debt)
                principal_payment = -npf.ppmt(interest_rate, current_payment_period, debt_term_years, initial_debt)

                # Ensure payments don't exceed outstanding balance
                if interest_payment > df.loc[year, 'Debt Outstanding (Start)'] * interest_rate: # Should be approx equal
                    interest_payment = df.loc[year, 'Debt Outstanding (Start)'] * interest_rate

                actual_principal_repayment = min(principal_payment, df.loc[year, 'Debt Outstanding (Start)'])
                # If outstanding is less than calculated principal, pay only outstanding.
                # This also handles the case where the sum of ppmt over the term might slightly differ from initial_debt due to float precision.

                df.loc[year, 'Interest Expense'] = interest_payment if actual_principal_repayment > 0 or interest_payment > 0 else 0
                df.loc[year, 'Debt Principal Repayment'] = actual_principal_repayment
            else:
                df.loc[year, 'Interest Expense'] = 0.0
                df.loc[year, 'Debt Principal Repayment'] = 0.0
        else:
            df.loc[year, 'Interest Expense'] = 0.0
            df.loc[year, 'Debt Principal Repayment'] = 0.0

        df.loc[year, 'Debt Outstanding (End)'] = df.loc[year, 'Debt Outstanding (Start)'] - df.loc[year, 'Debt Principal Repayment']
        # Ensure debt outstanding does not go negative
        df.loc[year, 'Debt Outstanding (End)'] = max(0, df.loc[year, 'Debt Outstanding (End)'])

        # EBT (Earnings Before Tax)
        df.loc[year, 'EBT'] = df.loc[year, 'EBIT'] - df.loc[year, 'Interest Expense']

        # Taxes
        if df.loc[year, 'EBT'] > 0:
            df.loc[year, 'Taxes'] = df.loc[year, 'EBT'] * tax_rate
        else:
            df.loc[year, 'Taxes'] = 0.0 # No tax loss carry-forward in this simple model

        # Net Income
        df.loc[year, 'Net Income'] = df.loc[year, 'EBT'] - df.loc[year, 'Taxes']
        
        # DSCR Calculation (example)
        current_interest_expense = df.loc[year, 'Interest Expense']
        current_principal_repayment = df.loc[year, 'Debt Principal Repayment']
        total_debt_service = current_interest_expense + current_principal_repayment
        if total_debt_service > 0:
            # Using EBITDA as cash flow available for debt service (CFADS proxy)
            # More complex models might use a more specific CFADS calculation
            df.loc[year, 'Debt Service Coverage Ratio (DSCR)'] = df.loc[year, 'EBITDA'] / total_debt_service
        else:
            df.loc[year, 'Debt Service Coverage Ratio (DSCR)'] = np.nan # Or 0 or None, depending on desired representation

        # Additional CAPEX (Outflow)
        current_additional_capex = additional_capex_schedule.get(year, 0.0)
        df.loc[year, 'Additional CAPEX'] = current_additional_capex

        # Salvage Value (Inflow in the last year)
        current_salvage_value = 0.0
        if year == project_lifetime:
            current_salvage_value = initial_capex * salvage_value_perc
            df.loc[year, 'Salvage Value'] = current_salvage_value

        df.loc[year, 'Total CAPEX Year'] = current_additional_capex - current_salvage_value # Net CAPEX for the year

        # Free Cash Flow to Firm (FCFF)
        # FCFF = EBIT * (1 - Tax Rate) + Depreciation - Capital Expenditures (net of salvage) - Change in NWC (ignore NWC for simple model)
        fcff_this_year = (df.loc[year, 'EBIT'] * (1 - tax_rate)) + \
                         df.loc[year, 'Depreciation'] - \
                         current_additional_capex + \
                         current_salvage_value # Salvage is an inflow
        df.loc[year, 'Free Cash Flow (FCFF)'] = fcff_this_year

        # Discounting for DPBT
        df.loc[year, 'Discount Factor'] = 1 / ((1 + wacc) ** year)
        df.loc[year, 'Discounted FCFF'] = df.loc[year, 'Free Cash Flow (FCFF)'] * df.loc[year, 'Discount Factor']

    # --- 6. Calculate Final Metrics ---
    df['Cumulative FCFF'] = df['Free Cash Flow (FCFF)'].cumsum()
    df['Cumulative Discounted FCFF'] = df['Discounted FCFF'].cumsum() # For DPBT

    # NPV
    cash_flows_for_npv = df['Free Cash Flow (FCFF)'].values
    npv_value = npf.npv(wacc, cash_flows_for_npv) if wacc > -1 else float('-inf')

    # IRR
    try:
        irr_value = npf.irr(cash_flows_for_npv)
        if np.isnan(irr_value) or np.isinf(irr_value):
            irr_value = None
    except Exception:
        irr_value = None

    # Discounted Payback Time (DPBT)
    dpbt_years = None
    # Initial investment is df.loc[0, 'Discounted FCFF'] which is negative
    if df.loc[0, 'Cumulative Discounted FCFF'] < 0:
        cumulative_discounted_positive = df[df['Cumulative Discounted FCFF'] > 0]
        if not cumulative_discounted_positive.empty:
            first_positive_year_dpbt = cumulative_discounted_positive.index[0]
            if first_positive_year_dpbt > 0:
                # Interpolate for DPBT
                cumulative_dfcff_before_positive = df.loc[first_positive_year_dpbt - 1, 'Cumulative Discounted FCFF']
                dfcff_of_positive_year = df.loc[first_positive_year_dpbt, 'Discounted FCFF']
                if dfcff_of_positive_year > 0: # Avoid division by zero or negative if DFCFF is not positive
                    dpbt_years = first_positive_year_dpbt - 1 + (-cumulative_dfcff_before_positive / dfcff_of_positive_year)
            elif first_positive_year_dpbt == 0 and df.loc[0, 'Cumulative Discounted FCFF'] > 0:
                 # This case is highly unlikely if Year 0 is a significant outflow
                dpbt_years = 0
    
    # Summary Metrics (Example: Totals over project lifetime)
    summary_metrics = {
        'total_revenue': df['Revenue'].sum(),
        'total_opex': df['Total OPEX'].sum(),
        'total_ebitda': df['EBITDA'].sum(),
        'total_net_income': df['Net Income'].sum(),
        # Use the full column name and handle potential all-NaN case for mean if no debt service
        'debt_service_coverage_ratio_avg': df[df['Debt Service Coverage Ratio (DSCR)'].notna()]['Debt Service Coverage Ratio (DSCR)'].mean()
    }

    # Clean up NaN/Inf in DataFrame for JSON serialization if needed
    # Ensure DSCR NaNs are handled if they are to be kept as null in JSON, or fill with 0/None
    df_cleaned = df.replace([np.inf, -np.inf], None) # Keep NaNs for now, or df.fillna(0) to fill all
    # For specific columns like DSCR, if you want null instead of NaN for JSON:
    if 'Debt Service Coverage Ratio (DSCR)' in df_cleaned.columns:
        df_cleaned['Debt Service Coverage Ratio (DSCR)'] = df_cleaned['Debt Service Coverage Ratio (DSCR)'].apply(lambda x: None if pd.isna(x) else x)

    results = {
        'cash_flow_df': df_cleaned.to_dict(orient='list'),
        'npv': npv_value if npv_value is not None and not (np.isnan(npv_value) or np.isinf(npv_value)) else None,
        'irr': irr_value if irr_value is not None else None,
        'dpbt': dpbt_years if dpbt_years is not None and not (np.isnan(dpbt_years) or np.isinf(dpbt_years)) else None,
        'summary_metrics': summary_metrics
    }

    return results

# === Example Usage (for testing - this would be built by the API endpoint) ===
if __name__ == "__main__":
    example_inputs = {
        'project_lifetime_years': 20,
        'initial_capex': 10000000,       # 10M
        'opex_fixed_yearly': 200000,     # 200k for Year 1
        'yearly_revenue': np.linspace(1700000, 1200000, 20).tolist(), # Example: 1.5M down to 1.2M over 20 years
        'wacc': 0.08,                    # 8% Discount Rate
        'salvage_value_perc': 0.05,      # 5% of initial_capex
        'debt_percentage': 0.70,         # 70% Debt
        'interest_rate': 0.06,           # 6%
        'debt_term_years': 15,
        'debt_up_front_fee_perc_of_debt': 0.01, # 1% of initial_debt (70k if initial_debt is 7M)
        'tax_rate': 0.25,                # 25% Tax Rate
        'depreciation_years': 15,
        'opex_fixed_escalation_rate': 0.02, # 2% opex escalation
        'additional_capex_schedule': {10: 1000000} # Optional: 1M in year 10
    }

    financial_results = calculate_project_financials(example_inputs)

    print("--- Financial Results ---")
    # pd.set_option('display.max_rows', None)
    # pd.set_option('display.max_columns', None)
    # pd.set_option('display.width', None)
    result_df = pd.DataFrame(financial_results['cash_flow_df'])
    print(result_df)
    print(f"\nNPV (@{example_inputs['wacc']*100}%): {financial_results['npv']:,.2f}")
    print(f"IRR: {financial_results['irr']*100 if financial_results['irr'] is not None else 'N/A':.2f}%")
    
    # Corrected DPBT print formatting
    dpbt_display = f"{financial_results['dpbt']:.2f}" if financial_results['dpbt'] is not None else "N/A"
    print(f"Discounted Payback Time: {dpbt_display} years")

    print(f"\nSummary Metrics: {financial_results['summary_metrics']}")
