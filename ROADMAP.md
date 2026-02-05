# MES RENAR - System Roadmap & Functional Specification

## 1. Project Overview & Connectivity
MES RENAR is a Real-Time Manufacturing Execution System designed to bridge the gap between the corporate **ERP** and the factory floor. It operates on a data-driven integration model:

- **Input**: Production Orders (PO) released by the ERP.
- **Process**: MES executes routing, validates resources, tracks time, and monitors quality.
- **Output**: Real-time performance indicators (KPIs), automatic replenishment requests, and traceability logs.
- **Goal**: Transform a "push" system into a controlled, data-rich environment ensuring industrial governance.

---

## 2. Strategic Objectives
The system is built to solve specific operational pain points:
1.  **Increase Operational Efficiency**: Reduce downtime and optimize resource usage.
2.  **Process Synchronization**: Ensure subassemblies and components arrive together (Just-in-Time logic).
3.  **Industrial Governance**: Enforce rules (e.g., "no production without valid PO").
4.  **Information Accuracy**: Eliminate manual data entry errors via automatic counting and barcoding.

---

## 3. System Macro Flow
The data flow dictates the system's operation lifecycle:
1.  **ERP Release**: ERP generates a Production Order (PO).
2.  **MES Reception**: MES receives the PO and schedules it based on routing.
3.  **Execution & Validation**: Operators/Machines execute tasks. MES validates inputs (Raw Material) and capacity.
4.  **Analysis Loop**:
    *   *Standard vs. Actual Time* -> Efficiency Metrics.
    *   *Quality Check* -> Scrap/Rework categorization.
    *   *Discrepancy?* -> Automatic Replenishment PO generation.

---

## 4. Operational Roadmap & Functionalities
Each stage of production has specific functional requirements, connectivity needs, and identified challenges.

### Phase A: Setup & Cutting
#### 1. Optimizer (Otimizadora)
*   **Functionality**: Reads PO/Batch barcodes. Validates quantity and Raw Material (RM) verification.
*   **Connectivity**: Direct integration with machine database for output data.
*   **Challenge/Problem**: Controlling the exact release moment as material leaves the cutting process (synchronization).

#### 2. Pre-cut (Pré-corte)
*   **Functionality**: Validates PO receipt from Optimizer. Checks RM availability.
*   **Quality Control**: Differentiates between **Scrap** (lost) and **Rework** (recoverable).
*   **Connectivity**: Upstream link to Optimizer; Downstream link to CNC/Molding.
*   **Challenge/Problem**: Managing resource occupancy (presses/conveyors) and cross-process validation in the drawer molding cell.

### Phase B: Machining & Processing
#### 3. CNC
*   **Functionality**: Automatic piece counting per cycle. Validates PO and enforces quality checks.
*   **Connectivity**: Machine PLC/Controller for cycle counting.
*   **Challenge/Problem**: Ensuring 100% accurate automatic counting and scrap reporting.

#### 4. Finishing & Brushing (Lixamento/Escovação)
*   **Functionality**: Validates PO and counts throughput.
*   **Connectivity**: Conveyor sensor integration.
*   **Challenge/Problem**: Handling "buffer" capacity and occupancy on the brush conveyor to prevent bottlenecks.

### Phase C: Assembly & Shipping
#### 5. Assembly (Montagem)
*   **Functionality**: **Conditional Release Logic**. Operation is *only* allowed if all required components (BOM) are available.
*   **Exception Handling**: If items are missing, releases partial quantity and triggers replenishment/discrepancy alert.
*   **Connectivity**: Inter-process inventory check.
*   **Challenge/Problem**: Complex dependency logic (Subassemblies + Components).

#### 6. Painting (Pintura)
*   **Functionality**: Similar to Assembly, enforces "Set Availability" logic. All parts of a set must be ready.
*   **Connectivity**: Tracking individual parts vs. whole sets.
*   **Challenge/Problem**: Sequencing paint jobs to match assembly set requirements.

#### 7. Packaging (Embalagem)
*   **Functionality**: Final validation of product completeness. Automatic box counting. Generates Final Product Label.
*   **Connectivity**: Label printer integration and ERP notification of "Finished Good".
*   **Challenge/Problem**: Ensuring the physical box count matches the logical order completion.

---

## 5. Technical Modules & Features

### OEE Engine (Overall Equipment Effectiveness)
Calculates effectiveness based on three pillars:
1.  **Availability**: (Working Hours - Downtime) / Working Hours.
    *   *Rule*: Unscheduled downtime requires mandatory justification.
2.  **Performance**: Actual Output / Standard Target.
3.  **Quality**: Good Parts / Total Parts.
*   *Integration*: Real-time calculation displayed on dashboards.

### Dashboards (Visualization)
Centralized view for management:
*   **Real-time**: Pieces/Shift (Planned vs Actual).
*   **Maintenance**: MTTR (Mean Time To Repair) and MTBF (Mean Time Between Failures).
*   **Utilization**: Capacity usage of Presses/Tables.
*   **Quality**: Pareto charts of scrap reasons.

### Traceability Module
*   **Timeline View**: Full history of a specific Batch/PO.
*   **Data Points**: Who (Operator), When (Timestamp), Where (Machine), What (Process Parameters).

---

## 6. Implementation Rollout Plan
The deployment follows a logical dependency chain:

1.  **ERP Integration**: Establish the data bridge (PO Import / RM Validation). *Foundational Step.*
2.  **Traceability**: Enable tracking of items through the flow.
3.  **MES Screens**: Deploy Operator Interfaces (UI) for execution and validation.
4.  **Dashboards**: Build management views on top of the collected data.
5.  **OEE**: Activate advanced performance metrics once data is stable.
