# Plan: Digital Twin Tabs + Grafana Tab

## Overview
Add a tabbed layout to the Digital Twin page with Visao Geral, Dispositivos IoT, Alertas IoT, and a new Grafana tab that shows Grafana graphs using the existing integration.

## Project Type
WEB (Next.js + React)

## Success Criteria
- `/digital-twin` uses tabs for Visao Geral, Dispositivos IoT, Alertas IoT, and Grafana.
- Grafana graphs render inside the Grafana tab using the existing Grafana section.
- Tab switching keeps device/alert state intact and refresh behavior unchanged.
- Grafana data only loads when the Grafana tab is selected.
- Visual style matches the existing Digital Twin design.

## Tech Stack
- Next.js + React
- HeroUI Tabs
- framer-motion
- Grafana API proxy + React Query (existing integration)

## File Structure
- `frontend/src/app/digital-twin/page.tsx` (tabs + conditional sections)
- `frontend/src/components/dashboard/GrafanaSection.tsx` (reuse)

## Agent Assignments
- frontend-specialist: tabs + layout refactor
- test-engineer: UI behavior validation

## Task Breakdown
- task_id: DT-01 | name: Add HeroUI tabs to Digital Twin page | agent: frontend-specialist | priority: P1 | dependencies: none | INPUT->OUTPUT->VERIFY: current page -> Tabs with visao/dispositivos/alertas/grafana -> tab selection swaps content
- task_id: DT-02 | name: Split Digital Twin sections by tab | agent: frontend-specialist | priority: P1 | dependencies: DT-01 | INPUT->OUTPUT->VERIFY: stats/devices/alerts blocks -> Visao Geral uses full layout, other tabs show scoped sections -> content matches existing UI
- task_id: DT-03 | name: Add Grafana tab content | agent: frontend-specialist | priority: P2 | dependencies: DT-01 | INPUT->OUTPUT->VERIFY: GrafanaSection -> renders only when Grafana tab selected -> graphs visible
- task_id: DT-04 | name: Validate tab transitions and data states | agent: test-engineer | priority: P3 | dependencies: DT-02, DT-03 | INPUT->OUTPUT->VERIFY: tab switching -> no UI regressions, alerts/devices stay consistent, Grafana loads on demand

## Phase X: Verification
- [ ] `npm run dev` and open `/digital-twin`
- [ ] Switch tabs and verify each section renders correctly
- [ ] Open Grafana tab and confirm graphs load
- [ ] Confirm alert refresh still works

## Notes
- Keep Grafana integration intact; only refactor presentation and tab layout.
