# Plan: Grafana API Panels on /dashboards

## Overview
Integrate Grafana via API (no iframe) by fetching dashboards and panel data server-side using `GRAFANA_URL` and `GRAFANA_API_KEY`, then render all panels on `/dashboards` with React Query and existing chart components.

## Project Type
WEB (Next.js + React + Supabase Edge Functions)

## Success Criteria
- `/dashboards` shows panels from all Grafana dashboards visible to the API key.
- API key never reaches the browser (server-only proxy).
- Panels render with correct titles and chart types; unsupported panels show a clear fallback.
- Time range and refresh are supported (default last 24h).
- Error states are visible and non-blocking (partial dashboard still renders).

## Tech Stack
- Grafana HTTP API (`/api/search`, `/api/dashboards/uid/:uid`, `/api/ds/query`)
- Supabase Edge Functions (Deno) for server-side proxy
- Next.js + React Query for data fetching
- @ant-design/plots (existing charts), HeroUI (cards/layout)

## File Structure
- `backend/supabase/functions/grafana/index.ts` (new)
- `backend/supabase/functions/grafana/types.ts` (new)
- `frontend/src/services/grafana.service.ts` (new)
- `frontend/src/hooks/useGrafanaDashboards.ts` (new)
- `frontend/src/types/grafana.ts` (new)
- `frontend/src/app/dashboards/page.tsx` (update)

## Agent Assignments
- backend-specialist: Grafana proxy + API contract
- frontend-specialist: data hooks + UI rendering
- security-auditor: verify API key isolation + least privilege
- test-engineer: manual UI verification + error states

## Task Breakdown
- task_id: GRAFANA-01 | name: Define integration contract + permissions | agent: backend-specialist | priority: P1 | dependencies: none | INPUT->OUTPUT->VERIFY: Grafana docs + API key scope -> contract for list dashboards + panel data + time range -> API endpoints + required Grafana permissions documented
- task_id: GRAFANA-02 | name: Build Grafana API client (server-side) | agent: backend-specialist | priority: P1 | dependencies: GRAFANA-01 | INPUT->OUTPUT->VERIFY: `GRAFANA_URL` + `GRAFANA_API_KEY` -> request helpers for search/dashboard/query -> can call Grafana from edge function without exposing secrets
- task_id: GRAFANA-03 | name: Add Supabase function endpoints for dashboards + panel data | agent: backend-specialist | priority: P1 | dependencies: GRAFANA-02 | INPUT->OUTPUT->VERIFY: Grafana client -> `/grafana/dashboards` + `/grafana/dashboards/:uid` -> hitting function returns dashboards + panel data
- task_id: GRAFANA-04 | name: Frontend data layer for Grafana panels | agent: frontend-specialist | priority: P1 | dependencies: GRAFANA-03 | INPUT->OUTPUT->VERIFY: API contract -> `grafana.service` + React Query hooks -> data shape matches panel types + loading/error handled
- task_id: GRAFANA-05 | name: Render Grafana panels on `/dashboards` | agent: frontend-specialist | priority: P2 | dependencies: GRAFANA-04 | INPUT->OUTPUT->VERIFY: panel data -> grouped by dashboard with cards + chart mapping (timeseries/area/bar/pie/stat/table) + fallback for unsupported types
- task_id: GRAFANA-06 | name: Add time range + refresh control | agent: frontend-specialist | priority: P2 | dependencies: GRAFANA-05 | INPUT->OUTPUT->VERIFY: UI controls -> query params in API calls -> switching range updates all panels
- task_id: GRAFANA-07 | name: Security + UX verification | agent: test-engineer | priority: P3 | dependencies: GRAFANA-05, GRAFANA-06 | INPUT->OUTPUT->VERIFY: running app -> API key not in client bundle, dashboards load, partial failures visible, refresh works

## Phase X: Verification
- [ ] `npm run lint` in `frontend`
- [ ] `npm run lint` in `backend`
- [ ] `npm run dev` (frontend) and open `/dashboards`
- [ ] Verify: all Grafana dashboards render, time range works, error fallback present, API key not exposed
- [ ] Optional: `python .agent/skills/frontend-design/scripts/ux_audit.py .`

## Notes
- Use API proxy pattern to avoid exposing `GRAFANA_API_KEY`.
- Start with a strict set of supported panel types; render a fallback for others.
- Add caching if Grafana response times become slow.
