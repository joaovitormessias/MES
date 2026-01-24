# Plano: Analise de OEE

## Overview
Criar a pagina Analise de OEE em `/oee` com linguagem visual Anthropic (Poppins/Lora e paleta #141413/#faf9f5/#e8e6dc + acentos #d97757/#6a9bcc/#788c5d), mantendo o contexto industrial/tecnico do produto, mas priorizando as brand guidelines para esta pagina. A pagina deve usar dados de `getOEE` e inspirar a ordem das secoes no padrao Bento Grid Showcase (landing.csv #28): hero com resumo, grid de KPIs, cards de detalhe, graficos/insights, fechamento com notas/acoes.

## Project Type
WEB (Next.js + React)

## Success Criteria
- Pagina `/oee` existe, esta linkada pela navegacao e carrega sem erros.
- Tipografia e cores seguem as brand guidelines (Poppins heading, Lora body, paleta e acentos).
- KPIs e graficos de OEE sao claros, responsivos e consistentes com HeroUI/Tailwind.
- Estados de carregamento/empty e legenda de metrica estao presentes e compreensiveis.
- Animacoes discretas com `motion/react-client` sem comprometer performance.

## Tech Stack
- Next.js + React: pagina e componentes.
- Tailwind CSS + HeroUI: layout, componentes e tokens.
- `@ant-design/plots`: graficos de tendencia/composicao.
- `motion/react-client`: animacoes de entrada e escalonamento.
- `frontend/src/lib/api.ts`: `getOEE` como fonte de dados.
- `frontend/src/types/database.ts`: `OEESnapshot` para tipagem.

## File Structure
- `frontend/src/app/oee/page.tsx`
- `frontend/src/components/oee/OeeHero.tsx`
- `frontend/src/components/oee/OeeKpiGrid.tsx`
- `frontend/src/components/oee/OeeTrends.tsx`
- `frontend/src/components/oee/OeeInsights.tsx`
- `frontend/src/hooks/useOEE.ts`
- `frontend/src/lib/api.ts` (uso existente)
- `frontend/src/types/database.ts` (uso existente)
- `frontend/src/app/globals.css` (tokens/ajustes de tipografia, se necessario)

## Agent Assignments
- frontend-specialist: layout, componentes React, Tailwind/HeroUI, motion, charts.
- test-engineer: revisao rapida de responsividade e checklist de verificacao.

## Task Breakdown
- task_id: OEE-01 | name: Definir narrativa e estrutura Bento Grid (hero -> KPIs -> detalhes -> graficos -> insights) | agent: frontend-specialist | priority: P1 | dependencies: none | INPUT->OUTPUT->VERIFY: requisitos + brand guidelines -> outline das secoes e hierarquia -> outline revisado e coerente com landing.csv #28
- task_id: OEE-02 | name: Criar pagina `/oee` e layout base responsivo | agent: frontend-specialist | priority: P1 | dependencies: OEE-01 | INPUT->OUTPUT->VERIFY: outline aprovado -> `page.tsx` com estrutura e slots de conteudo -> pagina renderiza sem warnings
- task_id: OEE-03 | name: Construir componentes de KPIs (cards e grid) alinhados a brand guidelines | agent: frontend-specialist | priority: P1 | dependencies: OEE-02 | INPUT->OUTPUT->VERIFY: specs visuais + dados OEE -> `OeeKpiGrid` com cores/acento -> KPIs legiveis em desktop e mobile
- task_id: OEE-04 | name: Implementar hook `useOEE` e fluxo de dados (loading/empty) | agent: frontend-specialist | priority: P1 | dependencies: OEE-02 | INPUT->OUTPUT->VERIFY: `getOEE` + tipos -> hook com estado -> pagina exibe loading/empty sem quebra
- task_id: OEE-05 | name: Adicionar graficos de tendencia e distribuicao | agent: frontend-specialist | priority: P2 | dependencies: OEE-04 | INPUT->OUTPUT->VERIFY: dados OEE + spec visual -> `OeeTrends` com `@ant-design/plots` -> graficos legiveis com legenda e tooltips
- task_id: OEE-06 | name: Ajustar tipografia, cores e motion para identidade Anthropic | agent: frontend-specialist | priority: P2 | dependencies: OEE-03, OEE-05 | INPUT->OUTPUT->VERIFY: brand guidelines -> tokens/classes aplicados -> headings em Poppins, corpo em Lora, paleta correta
- task_id: OEE-07 | name: Revisao UX e responsividade final | agent: test-engineer | priority: P3 | dependencies: OEE-06 | INPUT->OUTPUT->VERIFY: pagina pronta -> checklist UX (contraste, spacing, estados) -> aprovacao visual e funcional

## Phase X: Verification
- [ ] `npm run lint && npx tsc --noEmit`
- [ ] `python .agent/scripts/verify_all.py . --url http://localhost:3000`
- [ ] `npm run build`
- [ ] Validar layout em mobile/tablet/desktop
- [ ] Confirmar cores/tipografia conforme `brand-guidelines/SKILL.md` e ausencia de roxos
