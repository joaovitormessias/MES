# Plano: OEE font + background alignment

## Overview
Alinhar a pagina /oee com a tipografia global (Space Grotesk / Source Sans 3) e a paleta do design system, removendo overrides Poppins/Lora e o fundo "paper" atual.

## Project Type
WEB (Next.js + React)

## Success Criteria
- Pagina /oee usa as fontes globais do layout.
- Fundo e cards do /oee usam tokens --color-bg-* e --color-border do design system.
- Nao existem overrides locais de --font-display/--font-body na pagina.
- Contraste e legibilidade mantidos em desktop e mobile.

## Tech Stack
- Next.js + React (pagina /oee)
- Tailwind CSS + custom properties em frontend/src/app/globals.css
- next/font (fontes globais definidas em frontend/src/app/layout.tsx)
- .agent/.shared/ui-ux-pro-max/data/landing.csv (padrao #28 para superficies)

## File Structure
- frontend/src/app/oee/page.tsx
- frontend/src/app/globals.css
- frontend/src/components/oee/OeeHero.tsx
- frontend/src/components/oee/OeeKpiGrid.tsx
- frontend/src/components/oee/OeeTrends.tsx
- frontend/src/components/oee/OeeInsights.tsx

## Agent Assignments
- frontend-specialist: ajustar tipografia e paleta da pagina OEE
- test-engineer: revisao visual e responsiva

## Task Breakdown
- task_id: OEE-STYLE-01 | name: Auditar overrides atuais de tipografia e cor no /oee | agent: frontend-specialist | priority: P1 | dependencies: none | INPUT->OUTPUT->VERIFY: page.tsx + globals.css + landing.csv #28 -> lista de overrides (fonts, tokens, backgrounds) -> lista cobre .oee-page, .oee-shell, .oee-card, .oee-title
- task_id: OEE-STYLE-02 | name: Definir mapeamento para fontes e paleta global | agent: frontend-specialist | priority: P1 | dependencies: OEE-STYLE-01 | INPUT->OUTPUT->VERIFY: overrides atuais + tokens globais -> mapeamento (fontes globais, --color-bg-*) -> mapeamento revisado e aprovado
- task_id: OEE-STYLE-03 | name: Remover fontes Poppins/Lora e aplicar fontes globais no /oee | agent: frontend-specialist | priority: P1 | dependencies: OEE-STYLE-02 | INPUT->OUTPUT->VERIFY: mapeamento -> page.tsx sem Poppins/Lora e .oee-page sem override de --font-* -> textos usam Space Grotesk/Source Sans 3
- task_id: OEE-STYLE-04 | name: Ajustar backgrounds e superficies do OEE para a paleta do site | agent: frontend-specialist | priority: P1 | dependencies: OEE-STYLE-02 | INPUT->OUTPUT->VERIFY: mapeamento + landing.csv #28 -> .oee-shell/.oee-card usando --color-bg-secondary/--color-bg-tertiary + --color-border -> fundo e cards alinhados ao app
- task_id: OEE-STYLE-05 | name: Revisao visual e consistencia cross-page | agent: test-engineer | priority: P2 | dependencies: OEE-STYLE-03, OEE-STYLE-04 | INPUT->OUTPUT->VERIFY: pagina /oee atualizada -> checagem visual com paginas base -> tipografia e fundo coerentes sem regressao

## Phase X: Verification
- [ ] npm run lint && npx tsc --noEmit
- [ ] python .agent/skills/frontend-design/scripts/ux_audit.py .
- [ ] Abrir /oee em desktop/tablet/mobile e comparar com paginas base
- [ ] Confirmar ausencia de roxos e contraste OK
