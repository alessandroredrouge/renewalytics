import os
import sys
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

from app.logic.market_operations import MarketOperations
from app.logic.battery_operations import BatteryOperations
from app.logic.optimization import Optimization

def main():
    """
    Main function to run the optimization.
    """
    try:
        # Initialize market operations
        print("\nInitializing market operations...")
        market_ops = MarketOperations(
            country="Germany",
            market="Wholesale",
            fcr_acceptance_rate=0.35,
            afrr_acceptance_rate=0.5,
            mfrr_acceptance_rate=0.2
        )
        
        # Initialize battery operations
        print("\nInitializing battery operations...")
        battery_ops = BatteryOperations(
            capacity=100,  # MWh
            max_power=25,  # MW
            efficiency=0.95,
            min_soc=0.1,
            max_soc=0.9,
            initial_soc=0.5
        )
        
        # Initialize optimization
        print("\nInitializing optimization...")
        optimization = Optimization(
            market_operations=market_ops,
            battery_operations=battery_ops,
            horizon=48,  # 48 hours to match the data period
            time_step=1,  # hour
            max_iterations=1000,
            tolerance=1e-6
        )
        
        # Run optimization
        print("\nRunning optimization...")
        results = optimization.optimize()
        
        # Display and save results
        if results:
            print("\nOptimization Results:")
            print("=" * 50)
            
            # Create a DataFrame for better display
            if not results['datetimes']:
                print("No optimization results available")
                return
            
            df = pd.DataFrame({
                'Datetime': results['datetimes'],
                'Market': results['market_actions'],
                'SOC': results['soc'],
                'FCR Bidded (MW)': results['fcr_bidded'][:len(results['datetimes'])],
                'aFRR Bidded (MW)': results['afrr_bidded'][:len(results['datetimes'])],
                'mFRR Bidded (MW)': results['mfrr_bidded'][:len(results['datetimes'])],
                'FCR Won (MW)': results['fcr_won'][:len(results['datetimes'])],
                'aFRR Won (MW)': results['afrr_won'][:len(results['datetimes'])],
                'mFRR Won (MW)': results['mfrr_won'][:len(results['datetimes'])]
            })
            
            # Add wholesale market data if available
            if 'Wholesale' in results['prices'] and 'Wholesale' in results['power']:
                df['Wholesale Price (EUR/MWh)'] = results['prices']['Wholesale'][:len(results['datetimes'])]
                df['Wholesale Power (MW)'] = results['power']['Wholesale'][:len(results['datetimes'])]
            
            # Add PPA data if available
            for ppa_name, ppa_power in results['ppa_committed'].items():
                df[f'PPA {ppa_name} Committed (MW)'] = ppa_power[:len(results['datetimes'])]
            
            # Calculate revenues
            df['FCR Revenue (EUR)'] = df['FCR Won (MW)'] * df['FCR Bidded (MW)'] * results['revenues_fcr']
            df['aFRR Revenue (EUR)'] = df['aFRR Won (MW)'] * df['aFRR Bidded (MW)'] * results['revenues_afrr']
            df['mFRR Revenue (EUR)'] = df['mFRR Won (MW)'] * df['mFRR Bidded (MW)'] * results['revenues_mfrr']
            
            if 'Wholesale' in results['prices'] and 'Wholesale' in results['power']:
                df['Wholesale Revenue (EUR)'] = -df['Wholesale Power (MW)'] * df['Wholesale Price (EUR/MWh)']
            
            # Add PPA revenues
            for ppa_name, revenue in results['revenues_ppa'].items():
                df[f'PPA {ppa_name} Revenue (EUR)'] = df[f'PPA {ppa_name} Committed (MW)'] * revenue / len(df)
            
            # Calculate cumulative revenues
            df['Cumulative FCR Revenue (EUR)'] = df['FCR Revenue (EUR)'].cumsum()
            df['Cumulative aFRR Revenue (EUR)'] = df['aFRR Revenue (EUR)'].cumsum()
            df['Cumulative mFRR Revenue (EUR)'] = df['mFRR Revenue (EUR)'].cumsum()
            
            if 'Wholesale' in results['prices'] and 'Wholesale' in results['power']:
                df['Cumulative Wholesale Revenue (EUR)'] = df['Wholesale Revenue (EUR)'].cumsum()
            
            # Add cumulative PPA revenues
            for ppa_name in results['revenues_ppa'].keys():
                df[f'Cumulative PPA {ppa_name} Revenue (EUR)'] = df[f'PPA {ppa_name} Revenue (EUR)'].cumsum()
            
            # Calculate total revenue
            total_revenue_columns = ['Cumulative FCR Revenue (EUR)', 
                                   'Cumulative aFRR Revenue (EUR)',
                                   'Cumulative mFRR Revenue (EUR)']
            
            if 'Wholesale' in results['prices'] and 'Wholesale' in results['power']:
                total_revenue_columns.append('Cumulative Wholesale Revenue (EUR)')
            
            total_revenue_columns.extend([f'Cumulative PPA {ppa_name} Revenue (EUR)' 
                                        for ppa_name in results['revenues_ppa'].keys()])
            
            df['Total Revenue (EUR)'] = df[total_revenue_columns].sum(axis=1)
            
            # Display the DataFrame
            print("\nDetailed Results:")
            print(df)
            
            print("\nSummary:")
            print(f"Total Revenue: {df['Total Revenue (EUR)'].iloc[-1]:.2f} EUR")
            print(f"FCR Revenue: {df['Cumulative FCR Revenue (EUR)'].iloc[-1]:.2f} EUR")
            print(f"aFRR Revenue: {df['Cumulative aFRR Revenue (EUR)'].iloc[-1]:.2f} EUR")
            print(f"mFRR Revenue: {df['Cumulative mFRR Revenue (EUR)'].iloc[-1]:.2f} EUR")
            if 'Wholesale' in results['prices'] and 'Wholesale' in results['power']:
                print(f"Wholesale Revenue: {df['Cumulative Wholesale Revenue (EUR)'].iloc[-1]:.2f} EUR")
            for ppa_name in results['revenues_ppa'].keys():
                print(f"PPA {ppa_name} Revenue: {df[f'Cumulative PPA {ppa_name} Revenue (EUR)'].iloc[-1]:.2f} EUR")
            print(f"Average SOC: {df['SOC'].mean():.2f}")
            print(f"Final SOC: {df['SOC'].iloc[-1]:.2f}")
            
            # Market participation summary
            print("\nMarket Participation:")
            market_counts = df['Market'].value_counts()
            for market, count in market_counts.items():
                print(f"{market}: {count} time steps")
            
            # Save results to CSV
            output_dir = os.path.join(os.path.dirname(__file__), 'output')
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, 'revenue_streams.csv')
            
            df.to_csv(output_file, index=False)
            print(f"\nResults saved to: {output_file}")
            
        else:
            print("\nNo results available")
        
    except Exception as e:
        print(f"\nError in main: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    main() 