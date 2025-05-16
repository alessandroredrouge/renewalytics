# Battery Storage Optimization

This project implements a two-stage optimization for battery storage systems participating in electricity markets:

1. Day-ahead bidding for capacity markets (FCR, aFRR, mFRR)
2. Intraday optimization for wholesale market with remaining capacity

## Features

- Day-ahead bidding optimization for capacity markets
- Intraday optimization for wholesale market
- Battery state of charge management
- Revenue maximization across multiple markets
- Detailed results visualization and analysis

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/battery-storage-optimization.git
cd battery-storage-optimization
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

## Usage

1. Run the optimization:
```bash
python -m app.main
```

2. View results:
- Results are saved in `backend/app/output/revenue_streams.csv`
- The console output shows detailed optimization results

## Project Structure

```
backend/
├── app/
│   ├── logic/
│   │   ├── battery_operations.py  # Battery state management
│   │   ├── market_operations.py   # Market data and operations
│   │   └── optimization.py        # Optimization algorithms
│   ├── main.py                    # Main entry point
│   └── output/                    # Results directory
├── requirements.txt               # Python dependencies
└── README.md                     # This file
```

## Market Participation

The optimization considers participation in the following markets:

1. Frequency Containment Reserve (FCR)
   - Requires 100% availability
   - Day-ahead bidding
   - High acceptance rate

2. Automatic Frequency Restoration Reserve (aFRR)
   - Requires 50% availability
   - Day-ahead bidding
   - Medium acceptance rate

3. Manual Frequency Restoration Reserve (mFRR)
   - Requires 25% availability
   - Day-ahead bidding
   - Low acceptance rate

4. Wholesale Market
   - Intraday optimization
   - Uses remaining capacity after capacity market commitments

## License

This project is licensed under the MIT License - see the LICENSE file for details. 