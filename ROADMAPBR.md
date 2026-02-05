# MES RENAR - Roadmap do Sistema e Especificação Funcional

## 1. Visão Geral do Projeto e Conectividade
O MES RENAR é um Sistema de Execução de Manufatura em Tempo Real projetado para preencher a lacuna entre o **ERP** corporativo e o chão de fábrica. Ele opera em um modelo de integração orientado a dados:

- **Entrada**: Ordens de Produção (OP) liberadas pelo ERP.
- **Processo**: O MES executa o roteamento, valida recursos, rastreia tempo e monitora a qualidade.
- **Saída**: Indicadores de desempenho em tempo real (KPIs), solicitações automáticas de reabastecimento e registros de rastreabilidade.
- **Objetivo**: Transformar um sistema "empurrado" em um ambiente controlado e rico em dados, garantindo governança industrial.

---

## 2. Objetivos Estratégicos
O sistema é construído para resolver dores operacionais específicas:
1.  **Aumentar a Eficiência Operacional**: Reduzir o tempo de inatividade e otimizar o uso de recursos.
2.  **Sincronização de Processos**: Garantir que subconjuntos e componentes cheguem juntos (lógica Just-in-Time).
3.  **Governança Industrial**: Impor regras (ex: "nenhuma produção sem OP válida").
4.  **Precisão da Informação**: Eliminar erros de entrada manual de dados via contagem automática e código de barras.

---

## 3. Fluxo Macro do Sistema
O fluxo de dados dita o ciclo de vida da operação do sistema:
1.  **Liberação do ERP**: O ERP gera uma Ordem de Produção (OP).
2.  **Recepção no MES**: O MES recebe a OP e a agenda com base no roteamento.
3.  **Execução e Validação**: Operadores/Máquinas executam tarefas. O MES valida entradas (Matéria-Prima) e capacidade.
4.  **Ciclo de Análise**:
    *   *Tempo Padrão vs. Real* -> Métricas de Eficiência.
    *   *Verificação de Qualidade* -> Categorização de Refugo/Retrabalho.
    *   *Discrepância?* -> Geração automática de OP de Reabastecimento.

---

## 4. Roteiro Operacional e Funcionalidades
Cada estágio da produção possui requisitos funcionais específicos, necessidades de conectividade e desafios identificados.

### Fase A: Preparação e Corte
#### 1. Otimizadora
*   **Funcionalidade**: Lê códigos de barras de OP/Lote. Valida quantidade e verificação de Matéria-Prima (MP).
*   **Conectividade**: Integração direta com banco de dados da máquina para dados de saída.
*   **Desafio/Problema**: Controlar o momento exato de liberação conforme o material sai do processo de corte (sincronização).

#### 2. Pré-corte
*   **Funcionalidade**: Valida recepção da OP da Otimizadora. Verifica disponibilidade de MP.
*   **Controle de Qualidade**: Diferencia entre **Refugo** (perdido) e **Retrabalho** (recuperável).
*   **Conectividade**: Link upstream para Otimizadora; Link downstream para CNC/Moldagem.
*   **Desafio/Problema**: Gerenciar a ocupação de recursos (prensas/esteiras) e validação entre processos na célula de moldagem de gavetas.

### Fase B: Usinagem e Processamento
#### 3. CNC
*   **Funcionalidade**: Contagem automática de peças por ciclo. Valida OP e impõe verificações de qualidade.
*   **Conectividade**: PLC/Controlador da máquina para contagem de ciclos.
*   **Desafio/Problema**: Garantir contagem automática 100% precisa e reporte de refugo.

#### 4. Lixamento e Escovação
*   **Funcionalidade**: Valida OP e conta o fluxo de produção (throughput).
*   **Conectividade**: Integração de sensores na esteira.
*   **Desafio/Problema**: Lidar com a capacidade de "buffer" e ocupação na esteira de escovação para evitar gargalos.

### Fase C: Montagem e Expedição
#### 5. Montagem
*   **Funcionalidade**: **Lógica de Liberação Condicional**. A operação *só* é permitida se todos os componentes necessários (BOM) estiverem disponíveis.
*   **Tratamento de Exceção**: Se itens estiverem faltando, libera quantidade parcial e aciona alerta de reabastecimento/discrepância.
*   **Conectividade**: Verificação de inventário entre processos.
*   **Desafio/Problema**: Lógica de dependência complexa (Subconjuntos + Componentes).

#### 6. Pintura
*   **Funcionalidade**: Similar à Montagem, impõe lógica de "Disponibilidade de Conjunto". Todas as partes de um conjunto devem estar prontas.
*   **Conectividade**: Rastreamento de partes individuais vs. conjuntos inteiros.
*   **Desafio/Problema**: Sequenciamento de trabalhos de pintura para corresponder aos requisitos do conjunto de montagem.

#### 7. Embalagem
*   **Funcionalidade**: Validação final da completude do produto. Contagem automática de caixas. Gera Etiqueta de Produto Final.
*   **Conectividade**: Integração com impressora de etiquetas e notificação de "Produto Acabado" ao ERP.
*   **Desafio/Problema**: Garantir que a contagem física de caixas corresponda à conclusão lógica da ordem.

---

## 5. Módulos Técnicos e Recursos

### Motor OEE (Eficácia Geral do Equipamento)
Calcula a eficácia com base em três pilares:
1.  **Disponibilidade**: (Horas Trabalhadas - Tempo de Inatividade) / Horas Trabalhadas.
    *   *Regra*: Tempo de inatividade não planejado requer justificativa obrigatória.
2.  **Desempenho**: Saída Real / Meta Padrão.
3.  **Qualidade**: Peças Boas / Peças Totais.
*   *Integração*: Cálculo em tempo real exibido em dashboards.

### Dashboards (Visualização)
Visão centralizada para gestão:
*   **Tempo Real**: Peças/Turno (Planejado vs Real).
*   **Manutenção**: MTTR (Tempo Médio Para Reparo) e MTBF (Tempo Médio Entre Falhas).
*   **Utilização**: Uso da capacidade de Prensas/Mesas.
*   **Qualidade**: Gráficos de Pareto de motivos de refugo.

### Módulo de Rastreabilidade
*   **Visão de Linha do Tempo**: Histórico completo de um Lote/OP específico.
*   **Pontos de Dados**: Quem (Operador), Quando (Carimbo de Data/Hora), Onde (Máquina), O Que (Parâmetros do Processo).

---

## 6. Plano de Implementação (Rollout)
A implantação segue uma cadeia de dependência lógica:

1.  **Integração ERP**: Estabelecer a ponte de dados (Importação de OP / Validação de MP). *Passo Fundamental.*
2.  **Rastreabilidade**: Habilitar o rastreamento de itens através do fluxo.
3.  **Telas MES**: Implantar Interfaces de Operador (UI) para execução e validação.
4.  **Dashboards**: Construir visualizações gerenciais sobre os dados coletados.
5.  **OEE**: Ativar métricas avançadas de desempenho assim que os dados estiverem estáveis.
