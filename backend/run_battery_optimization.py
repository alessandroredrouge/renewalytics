import os
import sys
import pandas as pd
import json
from dotenv import load_dotenv

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Import the BatteryOptimizer class
from logic.battery_optimization import BatteryOptimizer

# Load environment variables
load_dotenv()

def run_optimization(country="Germany", market="Wholesale", output_file=None, 
                    round_trip_efficiency=0.95, lifetime=0, battery_degradation=0.024,
                    fcr_acceptance_rate=0.35, afrr_acceptance_rate=0.5, mfrr_acceptance_rate=0.2):
    """
    Run the battery optimization with the specified parameters.
    
    Parameters:
    - country: Country to use for price data (default: "Germany")
    - market: Market type to use for price data (default: "Wholesale")
    - output_file: Path to save the results (default: None)
    - round_trip_efficiency: Round-trip efficiency of the battery (default: 0.95)
    - lifetime: Battery lifetime in years (default: 15)
    - battery_degradation: Annual battery degradation rate (default: 0.024)
    - fcr_acceptance_rate: Acceptance rate for FCR bids (default: 0.35)
    - afrr_acceptance_rate: Acceptance rate for aFRR bids (default: 0.5)
    - mfrr_acceptance_rate: Acceptance rate for mFRR bids (default: 0.2)
    """
    print(f"Running battery optimization for {country} - {market} using 2024 price data...")
    
    # Calculate simulation years (0, 5, 10, ..., lifetime)
    simulation_years = list(range(0, lifetime + 1, 5))
    if simulation_years[-1] != lifetime:
        simulation_years.append(lifetime)
    
    print(f"Simulation years: {simulation_years}")
    
    # Initialize results list
    all_results = []
    
    # Run optimization for each simulation year
    for year in simulation_years:
        print(f"\nRunning simulation for year {year} (calendar year {2025 + year})...")
        
        # Create optimizer with specified parameters
        optimizer = BatteryOptimizer(
            initial_soc=0.4,
            battery_power_capacity=10,
            battery_energy_capacity=40,
            min_soc=0.2,
            max_soc=0.8,
            max_charging=7,
            max_discharging=10,
            country=country,
            market=market,
            round_trip_efficiency=round_trip_efficiency,
            lifetime=lifetime,
            battery_degradation=battery_degradation,
            simulation_year=year,
            fcr_acceptance_rate=fcr_acceptance_rate,
            afrr_acceptance_rate=afrr_acceptance_rate,
            mfrr_acceptance_rate=mfrr_acceptance_rate
        )
        
        # Run optimization
        results = optimizer.optimize()
        
        # Print summary
        print(f"Year {year} (Calendar year {2025 + year}) Results:")
        print(f"Total revenue: {results['summary']['total_revenue']:.2f} EUR")
        print(f"Action Statistics: {results['summary']['action_counts']}")
        print(f"Final SOC: {results['summary']['final_soc']:.2f}")
        
        # Add results to the list
        all_results.extend(results['results'])
    
    # Combine all results into a single DataFrame
    results_df = pd.DataFrame(all_results)
    
    # Save results to CSV if output file is specified
    if output_file:
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        results_df.to_csv(output_file, index=False)
        print(f"\nResults saved to {output_file}")
    
    # Calculate and print total revenue across all years
    total_revenue = results_df['total_revenue'].sum()
    print(f"\nTotal revenue across all years: {total_revenue:.2f} EUR")
    
    # Print configuration
    config = {
        'initial_soc': 0.4,
        'battery_power_capacity': 10,
        'battery_energy_capacity': 40,
        'min_soc': 0.2,
        'max_soc': 0.8,
        'max_charging': 7,
        'max_discharging': 10,
        'country': country,
        'market': market,
        'round_trip_efficiency': round_trip_efficiency,
        'lifetime': lifetime,
        'battery_degradation': battery_degradation,
        'simulation_years': simulation_years,
        'fcr_acceptance_rate': fcr_acceptance_rate,
        'afrr_acceptance_rate': afrr_acceptance_rate,
        'mfrr_acceptance_rate': mfrr_acceptance_rate
    }
    print(f"\nOptimizer configuration: {json.dumps(config, indent=2)}")
    
    return results_df

if __name__ == "__main__":
    # Run optimization with default parameters
    results = run_optimization(output_file="app/output/revenue_streams.csv")
    
    # Example of running with different parameters
    # results = run_optimization(country="France", market="Wholesale", output_file="output/revenue_streams_france.csv") 