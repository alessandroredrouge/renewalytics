# Renewalytics

## Overview

Renewalytics is a specialized revenue forecasting tool designed for renewable energy projects, starting with standalone Battery Energy Storage Systems (BESS). Its primary goal is to support investment decisions for project developers, independent power producers, utilities, and EPCs by providing techno-economic feasibility studies based on key technical and market data.

## Product Description

Renewalytics offers a suite of integrated modules enabling users to:

- **Input Project Data:** Enter techno-economic parameters and market data through an intuitive interface.
- **Define Dispatch Logic:** Configure BESS operational strategies (initially rule-based, later optimizable).
- **Configure Revenue Streams:** Model and forecast various revenue components based on market and operational data.
- **Input Financial Details:** Include capital costs, operational costs, and taxation models to simulate project financials.
- **Run Scenario Analysis:** Compare different dispatch and market scenarios (e.g., high, medium, low) to evaluate impacts on revenue and financial viability (IRR, NPV, PBT).
- **Visualize Results:** View simulation outputs via dynamic charts and summary tables, illustrating key performance metrics over the project's lifetime.

## Technology Stack

- **Frontend:** React with TypeScript, Vite.js
- **Backend:** Python with FastAPI
- **Data Management:** Initial Excel-like interface, planned transition to SQL database and API integrations.

## Roadmap

- **MVP:** Focus on standalone BESS simulation.
- **Future Iterations:** Expand to include PV, PV+BESS systems, enhanced multi-user features, API integrations, advanced data inputs, and support for diverse regulatory environments.

This project aims to provide a modern, professional, and extensible platform for renewable energy project analysis.
