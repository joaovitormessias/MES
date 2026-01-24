# Plano: Revisao UI Industrial Tecnico

## Overview
Revisar todo o UI do sistema MES com direcao visual industrial tecnico, padronizar o design system, alinhar header e area de Configuracoes, e remover Ajuda/Seguranca da navegacao.

## Project Type
WEB (Next.js + React)

## Success Criteria
- Todas as paginas seguem o mesmo sistema visual (cores, tipografia, espacamento, componentes).
- Header e Configuracoes com alinhamento consistente em desktop e mobile.
- Ajuda e Seguranca removidas da navegacao e sem referencias residuais.
- UI 100% pt-BR, sem strings em ingles.

## Tech Stack
- Next.js + React
- Tailwind CSS + HeroUI
- motion/react-client para animacoes leves

## File Structure (impacto previsto)
- frontend/src/app/*/page.tsx
- frontend/src/components/layout/*
- frontend/src/components/dashboard/*
- frontend/src/app/globals.css

## Agent Assignments
- frontend-specialist: arquitetura de layout, estilos, responsividade e consistencia visual

## Task Breakdown
- [ ] Mapear paginas e componentes criticos (header, sidebar, cards, tabelas, formularios).
  - INPUT: lista de paginas atuais
  - OUTPUT: checklist de areas e inconsistencias
  - VERIFY: lista completa com prioridades
- [ ] Definir tokens do design industrial tecnico (paleta, tipografia, espacamento, bordas).
  - INPUT: globals.css atual
  - OUTPUT: tokens ajustados e documentados
  - VERIFY: UI base reflete direcao tecnica
- [ ] Reestruturar area de Configuracoes (campos Formato..., grids e cards de apoio).
  - INPUT: frontend/src/app/settings/page.tsx
  - OUTPUT: layout alinhado sem sobreposicao
  - VERIFY: campos legiveis em desktop e mobile
- [ ] Refinar header global (alinhamento, alturas, espacamento, CTA e busca).
  - INPUT: frontend/src/components/layout/TopBar.tsx
  - OUTPUT: header padronizado e equilibrado
  - VERIFY: elementos alinhados e consistentes
- [ ] Padronizar navegacao (sidebar, estados ativos, remocao Ajuda/Seguranca).
  - INPUT: frontend/src/components/layout/Sidebar.tsx
  - OUTPUT: navegacao limpa e consistente
  - VERIFY: sem links Ajuda/Seguranca
- [ ] Aplicar novo sistema visual nas paginas principais (Dashboard, Execucao, OPs, Alertas).
  - INPUT: paginas principais
  - OUTPUT: cards/tabelas/headers alinhados ao novo sistema
  - VERIFY: consistencia visual entre paginas
- [ ] Aplicar novo sistema visual nas paginas de suporte (Itens, Qualidade, Rastreabilidade).
  - INPUT: paginas suporte
  - OUTPUT: layout unificado e responsivo
  - VERIFY: contraste e hierarquia coerentes
- [ ] Revisao final e ajustes de consistencia (tipos, estados, spacing).
  - INPUT: todas as paginas
  - OUTPUT: UI consistente
  - VERIFY: checklist de qualidade OK

## Phase X: Verification
- [ ] npm run lint && npx tsc --noEmit
- [ ] Revisar responsividade (mobile/tablet/desktop)
- [ ] Confirmar ausencia de strings em ingles
- [ ] Checar contraste e estados de foco
