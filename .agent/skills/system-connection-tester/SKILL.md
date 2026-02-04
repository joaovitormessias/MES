---
name: system-connection-tester
description: |
  Provides tools to verify connectivity and route health for the MES system. Use this skill when troubleshooting connection issues, verifying deployment status, or checking if services (Postgres, Redis, MQTT, APIs) are reachable.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# System Connection Tester Skill

This skill provides a Python-based utility to verify that all critical components of the MES and Digital Twin infrastructure are reachable and responding correctly. It checks connections to databases, message brokers, and API endpoints.

## When to use this skill

Invoke this skill when:
1.  **Troubleshooting**: Investigating why parts of the system are not communicating.
2.  **Post-Deployment Verification**: Confirming that a new deployment (local or remote) is fully operational.
3.  **Health Checks**: Periodically checking the status of the integrated environment.

## Skill contents

| Resource | Purpose |
| :---- | :---- |
| scripts/check_connections.py | Python script that attempts to connect to Postgres, Redis, MQTT, and HTTP endpoints |
| scripts/requirements.txt | Dependencies for the testing script |

## Usage

### 1. Requirements
Ensure you have Python installed. Install dependencies:
```bash
pip install -r scripts/requirements.txt
```

### 2. Configuration
The script looks for environment variables to know where to connect. It can load from a `.env` file if present, or use defaults suitable for the docker-compose environment.
Crucially, if running from *outside* docker (e.g. your local terminal), ensure mapped ports match.

Defaults used if vars not set:
- **MES Backend**: http://localhost:3000
- **Postgres**: localhost:5433 (MES), localhost:5432 (DT)
- **Redis**: localhost:6379
- **MQTT**: localhost:1884 (Mosquitto), localhost:1885 (ThingsBoard)

### 3. Running the check
Execute the script:
```bash
python scripts/check_connections.py
```
Or with specific env vars:
```bash
MES_BASE_URL=http://myapp.local python scripts/check_connections.py
```

## Output
The script prints a report of PASS/FAIL status for each component:
```
[PASS] MES Postgres Connection (localhost:5433)
[PASS] MES Redis Connection (localhost:6379)
[FAIL] MQTT Broker (localhost:1884) - Connection Refused
...
```
