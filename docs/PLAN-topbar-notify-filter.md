# Plano: TopBar filtros contextuais + notif dot

## Overview
Redesenhar o TopBar para reduzir ruido visual, trocar o badge numerico por um dot, e manter Filtrar como gatilho contextual que aparece apenas em paginas que registram filtros e aplica estado nos dados.

## Project Type
WEB (Next.js + React)

## Success Criteria
- Notificacoes exibem um ponto (dot) quando ha itens nao lidos, sem contagem numerica.
- TopBar com layout enxuto e alinhado a paleta/tipografia global.
- Filtrar aparece somente em paginas registradas e aplica filtros reais nos dados.
- Layout responsivo sem overflow em desktop e mobile.

## Tech Stack
- Next.js + React
- Tailwind CSS + HeroUI (Button, Badge, Popover/Dropdown, Input, Select)
- motion/react-client (opcional, animacoes leves)
- landing.csv #4 (Minimal Single Column) para direcao de limpeza visual

## File Structure
- frontend/src/components/layout/TopBar.tsx
- frontend/src/components/layout/AppLayout.tsx
- frontend/src/components/layout/TopBarFilterContext.tsx (novo, registro de filtros)
- frontend/src/components/layout/TopBarFilters.tsx (novo, UI do painel)
- frontend/src/app/ops/page.tsx
- frontend/src/app/alerts/page.tsx
- frontend/src/app/globals.css (somente se novos tokens/classes forem necessarios)

## Agent Assignments
- frontend-specialist: layout, interacoes e wiring de filtros
- test-engineer: revisao visual e responsiva

## Task Breakdown
- task_id: TOPBAR-01 | name: Auditar TopBar atual e mapear filtros existentes nas paginas | agent: frontend-specialist | priority: P1 | dependencies: none | INPUT->OUTPUT->VERIFY: TopBar + /ops + /alerts -> mapa de filtros e dot logic -> lista revisada e coerente
- task_id: TOPBAR-02 | name: Definir API de filtros contextuais (registro + estado) | agent: frontend-specialist | priority: P1 | dependencies: TOPBAR-01 | INPUT->OUTPUT->VERIFY: mapa + necessidade de Filtrar -> contrato de contexto (TopBarFilterContext) -> comportamento documentado
- task_id: TOPBAR-03 | name: Redesenhar TopBar e badge de notificacoes com dot | agent: frontend-specialist | priority: P1 | dependencies: TOPBAR-02 | INPUT->OUTPUT->VERIFY: contrato + design tokens -> TopBar atualizado com dot e layout limpo -> header renderiza sem contagem numerica
- task_id: TOPBAR-04 | name: Implementar Filtrar contextual e conectar /ops e /alerts | agent: frontend-specialist | priority: P2 | dependencies: TOPBAR-03 | INPUT->OUTPUT->VERIFY: TopBarFilterContext + UI -> filtros aplicam em /ops e /alerts -> resultados filtrados visiveis
- task_id: TOPBAR-05 | name: Ajustes finais de UX e responsividade | agent: test-engineer | priority: P3 | dependencies: TOPBAR-03, TOPBAR-04 | INPUT->OUTPUT->VERIFY: TopBar pronto -> revisao em desktop/mobile -> alinhamento e acessibilidade ok

## Phase X: Verification
- [ ] npm run lint && npx tsc --noEmit
- [ ] python .agent/skills/frontend-design/scripts/ux_audit.py .
- [ ] Validar /dashboards, /ops, /alerts (dot + filtros funcionando)
- [ ] Confirmar que Filtrar so aparece quando registrado
