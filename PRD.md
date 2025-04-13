# Product Requirements Document (PRD)

## 1. Overview

### 1.1 Purpose

Renewalytics is a revenue forecasting tool designed specifically for renewable energy plants. Initially, it will focus on a standalone Battery Energy Storage System (BESS) with plans to extend to photovoltaic (PV) systems, a combination of PV+BESS, and eventually other renewable asset types. The tool is targeted at project developers, independent power producers, utilities, and EPCs to support investment decisions by delivering techno-economic feasibility studies based on key technical and market data.

### 1.2 Scope

- **Initial Release (MVP):**
    - **Focus:** Standalone BESS simulation.
    - **Core Functionality:** Simulating techno-economic feasibility through adjustable inputs and displaying key performance indicators such as IRR, NPV, and PBT.
    - **Exclusions:** Multi-user roles, detailed advanced technical parameters, and regulatory differences are not in scope for the MVP.
- **Future Iterations:**
    - Addition of PV, combined PV+BESS, and other renewable assets.
    - Enhanced multi-user capabilities, API integrations, and advanced data inputs.

### 1.3 Intended Audience

- Project Developers
- Independent Power Producers
- Utilities
- EPCs (Engineering, Procurement, and Construction firms)

---

## 2. Product Description

### 2.1 High-Level Functionality

Renewalytics provides a series of integrated modules that allow users to:

- Enter project input data (techno-economic parameters, market data, etc.) via an Excel-like interface.
- Define dispatch logic for BESS operations using flexible (and later optimizable) strategies.
- Configure revenue streams by manipulating market and operational data.
- Input financial details such as capital costs, operational costs, and taxation models.
- Compare different dispatch and market scenarios (e.g., high, medium, low) to assess the impact on revenue and financial feasibility.
- Visualize simulation outputs with dynamic charts and summarized key performance metrics over the plant’s lifetime.

### 2.2 Use Cases

- **Investment Analysis:** A player evaluating a 1 GW portfolio pipeline of solar & storage projects uses the tool to simulate each project's business case.
- **Feasibility Studies:** An EPC or utility tests different scenarios (e.g., varying market conditions) to determine the optimal asset configurations.
- **Decision Support:** A project developer leverages visualized outputs (charts showing battery behavior over time, key financial ratios) to support investment decisions.

---

## 3. Feature Breakdown

### 3.1 Project Input Data Page

- **Functionality:**
    - Input technical data for renewable energy assets (e.g., nominal power, energy capacity, round-trip efficiency, capital costs, operational costs).
    - Capture market data such as hourly wholesale price forecasts and revenue stream pricing parameters.
    - General layout supporting an Excel-like data entry process.
- **Future Enhancements:**
    - Transition to a SQL database and API integrations for automated data feeds.

### 3.2 Dispatch Logic

- **Functionality:**
    - Set up the rules for BESS dispatch decisions on an hourly timestep.
    - Employ backend simulations using reinforcement learning (RL) models (to be detailed in later specifications).
    - Allow user tweaks to the default logic.
- **Notes:**
    - Strategies regarding revenue maximization, battery degradation, and other considerations will be refined in future iterations with further input.

### 3.3 Revenue Streams

- **Functionality:**
    - Provide detailed configuration for each revenue stream.
    - Enable users to manipulate and forecast revenue components.
- **Scope:**
    - Currently focused solely on standalone BESS revenue streams; will expand to include PV and other renewable sources in future releases.

### 3.4 Financials

- **Functionality:**
    - Input and simulate project financing details, including taxes, capital structure, and operating expenditures.
    - Calculations for IRR, NPV, and PBT based on input data and simulated operational metrics.
- **Scope:**
    - Kept general for the MVP; more detailed financial models may be integrated later.

### 3.5 Scenarios

- **Functionality:**
    - Enable users to create different “what-if” scenarios.
    - Compare baseline, high, medium, and low projections for market conditions and dispatch logic.
- **Future Enhancements:**
    - Extend capabilities for more granular scenario analysis, particularly as additional asset types and data inputs are added.

### 3.6 Results Page

- **Functionality:**
    - Visual display of simulation outputs, including:
        - Dynamic charts: X-axis representing elapsed time (e.g., battery performance over the plant's lifetime), and Y-axis adjustable for metrics such as State of Charge or hourly revenues.
        - Tables with key metrics (IRR, NPV, PBT).
    - Interactive and intuitive data visualization to assist in investment decision-making.
- **Scope:**
    - Initial focus on BESS outcomes; design extensible for future renewable asset types.

---

## 4. User Interface (UI) & User Experience (UX)

### 4.1 Design Principles

- **Modern & Professional:**
    - A sleek, modern interface tailored for energy market professionals.
    - Original design touches to reflect the innovative nature of renewable energy.
- **Responsiveness:**
    - Optimized primarily for desktop use but fully usable on mobile and tablet devices.
- **Visual Style:**
    - **Color Palette:** Propose using a mix of professional, trust-building colors (e.g., deep blues and greens) paired with accent colors that evoke energy and innovation (e.g., solar yellow or a vibrant teal).
    - **Fonts:** Consider modern sans-serif typefaces like Roboto, Open Sans, or Montserrat for readability and professional appeal.

### 4.2 Navigation & Layout

- **Navigation:**
    - A clear top or side navigation bar guiding users through each module (Input Data, Dispatch Logic, Revenue Streams, Financials, Scenarios, Results).
- **Layout:**
    - Clean interface with intuitive control panels.
    - Data input areas designed like Excel spreadsheets for ease of use.
    - Interactive charts and graphs with tooltips and hover-over details.

---

## 5. Technical Architecture

### 5.1 Frontend

- **Technology:**
    - **Framework:** React with TypeScript.
    - **Builder:** Vite.js with Lovable for UI components.
- **Functionality:**
    - Handles all UI interactions.
    - Communicates with the backend via RESTful APIs.
- **Design Considerations:**
    - Emphasis on modular components that allow for easy extension as new features are added.

### 5.2 Backend

- **Technology:**
    - **Language:** Python.
    - **Framework:** FastAPI built on Cursor.
- **Functionality:**
    - Core simulation logic including the RL-based dispatch logic.
    - ML models for forecasting (price forecasts, etc.).
    - Handling of SQL database connections and future API integrations.
- **Performance:**
    - General performance targets will be defined later; initial emphasis on modularity and scalability.

### 5.3 Data Management

- **Current Approach:**
    - An Excel-like interface for initial data input.
- **Future Enhancements:**
    - Transition to structured SQL database (database system remains flexible at this stage).
    - Integration with external APIs for real-time market and weather data.

---

## 6. Future Roadmap & Extensibility

### 6.1 Short-Term Roadmap (Post-MVP)

- Extend functionalities to include:
    - PV system simulations.
    - Combined PV+BESS simulations.
- Implement additional financial and technical detail modules as the product matures.

### 6.2 Long-Term Roadmap

- **New Revenue Streams:**
    - Modular architecture to integrate new revenue models and renewable asset types.
- **Regulatory and Regional Variability:**
    - Adaptability to incorporate diverse regulatory frameworks and regional market dynamics.
- **Multi-user and Collaboration:**
    - Expanding the tool to support differentiated user roles and collaborative functionalities.
- **Data Integrations:**
    - Enhanced real-time data integrations and API support for market data, weather forecasts, etc.

---

## 7. Assumptions & Constraints

### 7.1 Assumptions

- The initial release will focus solely on the BESS simulation; detailed technical parameters will be iterated on later.
- Users will be comfortable inputting data via an Excel-like interface, with more automated data retrieval (e.g., APIs) added in subsequent versions.

### 7.2 Constraints

- Detailed technical aspects of the RL model and the ML price forecasts are kept general and will be further defined in collaboration with additional teams.
- Financial modules and market data inputs are initially designed at a general level, subject to further detailed specifications.

---

## 8. Design Considerations & Aesthetics

### 8.1 Proposed Visual Identity

- **Color Palette:**
    - **Primary Colors:** Deep blue and green to evoke trust, stability, and sustainability.
    - **Accent Colors:** Vibrant hues such as solar yellow or teal to represent innovation and energy.
- **Typography:**
    - Modern sans-serif fonts (e.g., Roboto, Open Sans, Montserrat) for clean, professional presentation.
- **UI Style:**
    - Clean, intuitive, and organized interfaces with a balance between data density and user friendliness.
    - Original touches in visual elements to differentiate Renewalytics from existing solutions.

### 8.2 User Interaction Design

- Prioritize ease-of-use with straightforward data entry and visualization.
- Ensure responsive design that functions seamlessly across desktop and mobile, with desktop-optimized layouts as the core design benchmark.

---

## 9. Conclusion

This PRD outlines the vision, scope, and initial functionalities for Renewalytics, establishing a strong foundation for a modern, professional, and extensible revenue forecasting tool tailored to renewable energy projects. The MVP focuses on standalone BESS simulation with clear plans to progressively incorporate more asset types and advanced features in later iterations.

Further refinement—especially in the technical details for the dispatch logic, reinforcement learning strategies, and the specific techno-economic parameters—will be addressed collaboratively as inputs from additional AI assistants and subject matter experts become available.