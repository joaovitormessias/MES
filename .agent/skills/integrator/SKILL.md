---
name: integrator
description: Expert system for integrating external tools, services, and dashboards into applications. Use this skill for tasks like "embed Grafana", "connect to Salesforce", "integrate Stripe", or "sync data with ERP".
---

# Integrator Skill

## Overview

The `integrator` skill provides a structured methodology for connecting disparate systems. Whether embedding a UI (like Grafana), synchronizing data (ERP sync), or handling events (Webhooks), this skill guides through research, pattern selection, security, and implementation.

## Integration Workflow

Follow this 4-step process for any integration task:

### 1. Research & Feasibility
- **Goal**: Understand the external system's capabilities.
- **Actions**:
    - Identify Integration Points: API (REST/GraphQL), SDK, or UI Embedding (IFrame)?
    - Check Authentication: OAuth2, API Keys, mTLS?
    - **Deliverable**: "Integration Strategy Brief" listing feasible methods.

### 2. Pattern Selection
Choose the right pattern based on requirements:

#### Pattern A: UI Embedding (e.g., Grafana, PowerBI)
- **Use Case**: Displaying external views directly in your app.
- **Key Considerations**:
    - **Method**: IFrame vs. JavaScript SDK.
    - **Security**: CSP (Content Security Policy), `X-Frame-Options` headers.
    - **Auth**: Embedding with JWT/Auth Proxy to avoid double login.

#### Pattern B: Data Synchronization (e.g., ERP, CRM)
- **Use Case**: Keeping local database in sync with external source.
- **Key Considerations**:
    - **Direction**: One-way (Read-only) vs. Bi-directional.
    - **Frequency**: Real-time (Webhooks) vs. Batch (Cron Jobs).
    - **Idempotency**: Handling duplicate events.

#### Pattern C: Proxy & Gateway
- **Use Case**: Hiding API keys or transforming data before it hits the frontend.
- **Key Considerations**:
    - Middleware to inject secrets.
    - Rate limiting and caching.

### 3. Security & Governance
- **Never expose secrets** in the frontend.
- Use **Environment Variables** for API Keys/Secrets.
- Implement **Least Privilege** access for the integration user.

### 4. Implementation Steps
1.  **PoC**: Connect to the sandbox/dev environment.
2.  **Auth Flow**: Implement the handshake (e.g., OAuth dance).
3.  **Data mapping**: Transform external DTOs to internal models.
4.  **Error Handling**: Retry logic for network failures.

## Example: Grafana Integration

When asked to "Integrate Grafana Dashboard":

1.  **Research**: Check Grafana "Embed" docs.
2.  **Pattern**: UI Embedding (IFrame).
3.  **Security**:
    - Enable `allow_embedding` in Grafana config.
    - Use "Auth Proxy" or JWT URL authentication to log the user in automatically.
4.  **Implementation**:
    - Create a React component using an `iframe`.
    - Source URL: `https://grafana.example.com/d/XYZ/dashboard?kiosk&orgId=1`.
    - Ensure SSL matches (no mixed content).
