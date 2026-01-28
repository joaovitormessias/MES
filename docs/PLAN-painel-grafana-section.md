# Plan: Painel de Controle + Grafana Section

## Overview
Restore the original Painel de Controle dashboard layout and add the Grafana panels as a dedicated section below it on `/dashboards`, keeping the Grafana data pipeline intact.

## Project Type
WEB (Next.js + React)

## Success Criteria
- `/dashboards` shows the original Painel de Controle layout again.
- Grafana panels render below the existing dashboard content.
- Grafana time range and refresh controls remain functional.
- Loading/error states are isolated per section (Painel vs Grafana).
- Existing dashboard hooks and components continue to work.

## Tech Stack
- Next.js + React
- React Query
- @ant-design/plots + HeroUI
- Grafana API proxy (existing integration)

## File Structure
- `frontend/src/app/dashboards/page.tsx` (restore Painel + insert Grafana section)
- `frontend/src/components/dashboard/GrafanaSection.tsx` (new)
- `frontend/src/components/dashboard/GrafanaPanelCard.tsx` (new)
- `frontend/src/hooks/useDashboardMetrics.ts` (reuse)
- `frontend/src/services/dashboard.service.ts` (reuse)
- `frontend/src/hooks/useGrafanaDashboards.ts` (reuse)
- `frontend/src/services/grafana.service.ts` (reuse)
- `frontend/src/lib/grafana.ts` (reuse)

## Agent Assignments
- frontend-specialist: page refactor + component extraction
- test-engineer: layout + data validation

## Task Breakdown
- task_id: DASH-01 | name: Restore Painel de Controle layout on `/dashboards` | agent: frontend-specialist | priority: P1 | dependencies: none | INPUT->OUTPUT->VERIFY: prior layout + components -> KPIs/charts/workcenter table restored -> header reads "Painel de Controle"
- task_id: DASH-02 | name: Extract Grafana rendering into a section component | agent: frontend-specialist | priority: P1 | dependencies: DASH-01 | INPUT->OUTPUT->VERIFY: Grafana rendering logic -> `GrafanaSection` + `GrafanaPanelCard` -> section renders panels below Painel content
- task_id: DASH-03 | name: Preserve Grafana range + refresh controls | agent: frontend-specialist | priority: P2 | dependencies: DASH-02 | INPUT->OUTPUT->VERIFY: controls present -> Grafana queries update on range change -> refresh invalidates Grafana queries
- task_id: DASH-04 | name: Validate loading/error isolation | agent: test-engineer | priority: P3 | dependencies: DASH-01, DASH-02 | INPUT->OUTPUT->VERIFY: loading/errors -> Painel renders independently from Grafana -> errors isolated to Grafana section

## Phase X: Verification
- [ ] `npm run dev` and open `/dashboards`
- [ ] Verify Painel KPIs/charts load as before
- [ ] Verify Grafana panels render below Painel content
- [ ] Verify Grafana range/refresh updates panels
- [ ] Optional: `npm run lint` (frontend)

## Notes
- Keep Grafana integration intact and refactor only presentation.
- Reuse existing dashboard components to avoid regressions.
