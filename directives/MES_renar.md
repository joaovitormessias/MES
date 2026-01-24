Based on the provided documents, below is the complete transcription of the information about the **MES RENAR** system:

## Information and Assumptions

The document begins with the presentation of **MES RENAR Information**, establishing the system’s assumptions. The agenda of topics includes: **1. Overview, 2. Objectives, 3. MES Flow, 4. Structure, 5. OEE, 6. Traceability, 7. Quality, 8. Indicators, and 9. Roadmap**.

## 1. Overview

The system focuses on **real-time control** and **integration with the company’s ERP**, which is open and internally developed. It provides **real-time productivity and adherence information**, ensures **full batch traceability**, and monitors critical indicators simultaneously with production.

## 2. Strategic Objectives

The main objectives are:

- Increase **operational efficiency**.  
- Reduce time losses in processes.  
- Synchronize processes and ensure **industrial governance**.  
- Achieve **information accuracy**.

## 3. MES Macro Flow

The flow follows this order: the ERP releases the Production Order (PO), the MES receives it, and processes are executed according to routing. The system analyzes the executed PO quantity versus standard time, automatically generating a **replenishment PO** when necessary, in addition to analyzing downtime and quality.

## 4. Operational Routing and Processes

The operational routing consists of: **Wood Optimization, Pre-cut, CNC/Machining, Finishing and Brushing, Assembly, Painting, and Packaging**.

- **Optimizer:** Performs batch/PO reading via barcode, validates quantity and raw material (RM) availability. The challenge is controlling release as material exits the cutting process, retrieving information directly from the machine’s database.  

- **Pre-cut:** Validates the PO and RM availability from the previous process. Challenges include resource occupancy (presses and conveyors) and cross-process checks in the drawer molding cell. Quality analysis is divided into **scrap and rework**.  

- **CNC:** Includes automatic piece counting per cycle. As in pre-cut, PO validation and quality analysis between scrap and rework are performed.  

- **Sanding and Brushing:** Validates the PO and faces the challenge of brush conveyor resource occupancy, in addition to piece counting and quality analysis.  

- **Assembly:** Since it involves subassemblies, assembly is only released if **all component items are available**. If items are missing, the system releases only the possible quantity and generates replenishment or discrepancies for analysis. Conveyor counting is automatic.  

- **Painting:** Follows the composition logic; release depends on the availability of all items in the set, considering subassemblies or parts from previous processes. Counting of items passing through the conveyor is automatic.  

- **Packaging:** Validates the PO and the availability of all final product items. Performs **automatic box counting** and generates final product labels according to the scanned PO.

## 5. OEE (Overall Equipment Effectiveness)

The OEE concept is based on **Availability, Performance, and Quality**, resulting in an overall consolidation.

- **Metric example:** Availability (88%) × Performance (93%) × Quality (97%) = **Total OEE of 79%**.  

- **Availability Rules:** Considers the registered working hours of the department. Overtime or operation during lunch hours depends on approval from PCP management or the factory. If equipment is not used according to sequencing, it will be marked as unavailable in the MES, requiring justification for reactivation.

## 6. Dashboards and Screens

**Dashboards** should generate information on: pieces per shift (planned vs. actual), micro-stoppages, scrap reasons, maintenance information (MTTR and MTBF), and percentage utilization of tables/presses.

System screens include:

- **PO Selection:** Search by number or batch, status (closed, in progress, partially open), and indicators of deadline and volume compliance.  
- **Execution:** Displays standard versus actual times, effectiveness percentage, and comparison between planned and executed production.  
- **Quality:** Classifies scrap (with or without rework), generated replenishments, and main issues.  
- **Traceability:** Presents the timeline, responsible operator, and completed processes.

## 7. Strategic Indicators

Indicators monitor in real time **efficiency by department**, losses by product family, sequencing bottlenecks, and adherence to the planned schedule.

## 8. Implementation Roadmap

The implementation is structured in five stages:

1. **ERP Integration**  
2. **Traceability**  
3. **MES Screens**  
4. **Dashboards**  
5. **OEE**

The document concludes by defining **MES RENAR** as a **robust, scalable, and data-driven system**.
