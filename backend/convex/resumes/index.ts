// Candidate resume as a markdown string. Stored as a TS constant (not a loose
// .md file) so it is bundled and available to the Convex Node action at runtime.

const GENERAL_RESUME = `# Justin Mak

Email: j29mak@uwaterloo.ca · 9058651230 · GitHub: JPCodes44 · LinkedIn: Justin Mak

## Education

**University of Waterloo** — Waterloo, ON
BASc. Nanotechnology Engineering, Combinatorics & Optimization Minor — Expected Sep 2027

## Work Experience

### Software Engineer — DiaMonTech AG, Berlin, Germany
May 2025 – Aug 2025

- Shipped a production signal-acquisition panel (React/TypeScript) for DAQ/QCL/PWM with frequency + stop-criteria controls and a sweep filter on laser signal data, integrated with a Node/Express backend API, cutting acquisition iteration time by 25%.
- Built Jest-based component tests for DAQ controls and experiment-management workflows, mocking API and experiment-state hooks to verify start/stop payloads, error handling, filtering, renaming, lazy detail loading, and delete-confirmation behavior, reducing regressions in lab measurement tooling.
- Extended a Plotly sweep viewer with a custom modebar button + React callback to open a low-pass filter modal (start/stop criteria + trigger thresholds) and apply filtering in-place while preserving zoom/pan via uirevision, reducing manual replot steps by about 50%.

### Embedded Systems / R&D Engineer — AeroCardia Inc., Montreal, QC
Jan 2025 – Apr 2025

- Built AeroCardia's first portable respiratory monitoring prototype by integrating CO2, O2, PPG/SpO2, and pressure sensors over Bluetooth, enabling real-time wireless streaming of cardiopulmonary data from a handheld device.
- Programmed 4 custom Arduino/C++ sensor drivers across I2C, SPI, UART, and analog interfaces to configure mixed-signal hardware, parse device outputs, and support reliable acquisition from embedded digital and analog sensors.
- Engineered and calibrated an air mass-flow meter using Venturi-effect pressure measurements, achieving 0.01 g/s resolution and 5.6% calibration error through a 72-test validation setup with a custom 8 L syringe and analysis of 468,000 recorded data points.
- Iterated the prototype's breathing-interface design by evaluating mouthpiece geometries, minimum tube-width constraints, and sensor-placement tradeoffs, supporting a compact handheld airflow path for comfortable breathing and repeatable respiratory measurements.

### Field Engineering & Data Analyst — Purolator Inc., Mississauga, ON
Sep 2023 – Apr 2024

- Directed peak-period route planning for 30+ delivery drivers using Geotab and Area Planner, optimizing routes against traffic conditions, package density, stop sequencing, and operational constraints to improve daily delivery efficiency.
- Collaborated with field and facility staff to resolve urgent routing and execution issues in real time, using operational data and on-the-ground context to adapt plans quickly and support smooth day-to-day delivery performance.
- Supported daily field operations by troubleshooting driver-facing issues such as route misconfigurations, scanner malfunctions, and conveyor belt stoppages, working closely with coworkers to resolve problems quickly and reduce delivery disruptions.

## Projects

### Olevius — Wearable Blood Pressure monitor (paper in progress), Waterloo, ON
Jan 2026 – Current

- Built a wrist-worn continuous blood-pressure prototype when vascular monitoring needed cleaner longitudinal data, using optical-fiber sensing, PDMS pressure coupling, signal processing, and ML models to estimate systolic and diastolic trends.

## Skills

- **Software:** TypeScript, React, Node/Express, REST APIs, Python, SQL, Plotly, Git
- **Data:** Diagnostic workflows, healthcare data systems, signal acquisition, sensor pipelines, Excel VBA
- **Testing:** Jest, API mocking, component tests, validation protocols, regression checks
- **Clinical:** Biomedical sensors, CO2/O2/SpO2, respiratory monitoring, calibration, DAQ, QCL
- **Tools:** Arduino, Bluetooth, I2C, SPI, UART, PWM, Geotab, PowerPoint
`;

/** The candidate's general resume, injected into prompts as the source of truth. */
export const CANDIDATE_RESUMES = GENERAL_RESUME;
