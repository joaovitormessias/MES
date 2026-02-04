---
name: digital-twin-mes-integration
description: |
  Provides everything an agent needs to integrate the digital‑twin simulator with the MES backend. Use this skill whenever a user asks to merge, wire up or otherwise connect the digital‑twin project (Python simulator publishing MQTT telemetry) to the MES project (TypeScript/Node API). The skill supplies a high‑level workflow, a reference mapping from digital‑twin telemetry fields to MES API events, and a ready‑to‑use bridging script that listens to MQTT messages and forwards them to MES endpoints. It is appropriate for both initial setup and ongoing maintenance of the integration.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Digital‑Twin ↔ MES Integration Skill

This skill equips an agent to connect the digital‑twin simulator of a wood‑saw to the MES backend. It includes procedural guidance, a reference mapping of telemetry fields to MES events, and a Python bridging script that subscribes to MQTT telemetry and pushes the corresponding events into the MES REST API. Use this skill whenever you need to set up, modify or troubleshoot the integration between the two projects.

## When to use this skill

Invoke this skill when a user requests to **merge**, **integrate**, **wire up** or **connect** the digital‑twin simulator with the MES backend. It is designed to:

1. **Set up the integration**: prepare environment variables, start services, and run the bridging script to forward digital‑twin telemetry into MES.
2. **Map telemetry to MES events**: understand how to translate fields like status and woodCount into MES API calls such as start step, count pieces and complete step.
3. **Maintain or modify the integration**: adjust environment variables, extend the mapping for new telemetry fields, or redeploy the bridging service.

Avoid using this skill for tasks unrelated to the digital‑twin/MES integration, such as general code editing or unrelated API usage.

## Skill contents

This skill contains the following resources:

| Resource | Purpose | When to use |
| :---- | :---- | :---- |
| scripts/bridge_service.py | Python service that subscribes to MQTT telemetry, detects state transitions and piece counts, and calls MES REST endpoints accordingly | Use to run the actual bridge between the digital‑twin and MES projects |
| references/mapping.md | Reference table mapping telemetry fields to MES domain events and example payloads | Read when you need to understand or modify the mapping logic |

## Workflow overview

1. **Review and configure environment**
   - Ensure that the digital‑twin simulator is running and publishing telemetry over MQTT (typically on v1/devices/me/telemetry) and that the MES backend is running on its default port (http://localhost:3000 or as configured).
   - Copy the .env.example for the bridge (see below) into a .env file and fill in the required variables such as MQTT_HOST, MQTT_PORT, MES_BASE_URL, MES_TOKEN, MES_OP_ID, and MES_STEP_ID.
   - Install dependencies for the bridging script: paho-mqtt, requests and python-dotenv. You can run pip install -r requirements.txt if you create a requirements file, or install manually.

2. **Start the bridging service**
   - Launch the service with:
     ```bash
     python scripts/bridge_service.py
     ```
   - The script will connect to the MQTT broker, subscribe to telemetry messages, and begin sending MES API requests when it detects relevant events. The service logs its actions to stdout.

3. **Monitor and adjust**
   - Use the MES API or dashboards to verify that events are being recorded correctly. For example, check that piece counts increase when woodCount increases and that steps start/complete when the saw transitions between running and idle.
   - Adjust the mapping logic if new telemetry fields are added or if the business rules change. Refer to references/mapping.md for guidance.

4. **Extend functionality**
   - To handle quality events or anomalies, extend the process_message function in scripts/bridge_service.py to call POST /ops/:id/steps/:stepId/quality when certain thresholds are crossed (e.g., excessive vibration). Add your own logic as necessary.
   - If you need to support multiple saws, instantiate multiple bridge instances with different MES_OP_ID and MES_STEP_ID values or enhance the script to handle multiple devices.

## Configuration (.env example)

Create a .env file in the same directory as bridge_service.py with the following variables:

```env
# MQTT connection settings
MQTT_HOST=localhost
MQTT_PORT=1885
MQTT_USERNAME=c3m0aqy9yj7b1cgtd3x9  # if using access tokens
MQTT_PASSWORD=

# MQTT topic to subscribe to (digital‑twin publishes here)
MQTT_TOPIC=v1/devices/me/telemetry

# MES API settings
MES_BASE_URL=http://localhost:3000/api/v1
MES_TOKEN=your-jwt-token-here

# MES identifiers
MES_OP_ID=1234
MES_STEP_ID=5678

# Optional thresholds for quality/anomaly detection
TEMPERATURE_THRESHOLD=80
VIBRATION_THRESHOLD=10
```

You can add additional variables as needed. The bridging script uses python-dotenv to load these values automatically.

## Reference mapping

See references/mapping.md for a detailed table of telemetry fields and the corresponding MES events. In summary:

- **status transitions**: When status changes from anything else to running, call the MES endpoint `POST /ops/{MES_OP_ID}/steps/{MES_STEP_ID}/start`. When status changes from running to another state (e.g., idle), call `POST /ops/{MES_OP_ID}/steps/{MES_STEP\_ID}/complete`.
- **woodCount increments**: Calculate the difference between the current and the last woodCount value. If positive, call `POST /ops/{MES_OP_ID}/steps/{MES_STEP_ID}/count` with JSON body `{ "count": <difference> }`.
- **Anomalies**: If temperature exceeds TEMPERATURE_THRESHOLD or vibration exceeds VIBRATION_THRESHOLD, optionally call `POST /ops/{MES_OP_ID}/steps/{MES_STEP_ID}/quality` with a reason code and description. This part of the logic is left for customization.

## Adding or modifying mappings

To support new telemetry fields or adjust existing thresholds:

1. Update the .env file with new threshold values or additional variables.
2. Edit `scripts/bridge_service.py`, specifically the `process_message` function, to add the new mapping logic.
3. Update `references/mapping.md` to document the new rules and inform future agents.

## Bundled resources

The scripts and references folders contain all the code and reference material needed by this skill. No external dependencies are bundled; installation of Python packages is required at runtime. Keep this file and the resources together when packaging the skill.
