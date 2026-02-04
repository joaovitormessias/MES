import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.middleware';
import oeeService from '../../domain/oee/oee.service';
import productionOrderService from '../../domain/production-order/production-order.service';

const router = Router();

// Digital Twin API URL
const DT_API_URL = process.env.DT_API_URL || 'http://localhost:8000';

// Validation schema
const chatSchema = z.object({
    message: z.string().min(1).max(1000),
    device: z.string().optional().default('serra_01'),
});

interface AIResponse {
    answer: string;
    source: 'digital-twin' | 'mes' | 'combined';
}

/**
 * Determine if query is about machine state (Digital Twin) or MES metrics
 */
function classifyQuery(message: string): 'machine' | 'mes' | 'combined' {
    const lowerMsg = message.toLowerCase();

    // Machine state keywords
    const machineKeywords = [
        'estado', 'status', 'temperatura', 'temperature', 'rpm',
        'vibração', 'vibration', 'velocidade', 'belt', 'serra',
        'saw', 'motor', 'corrente', 'current', 'alertas', 'alerts',
        'sensor', 'telemetria', 'telemetry'
    ];

    // MES metrics keywords
    const mesKeywords = [
        'oee', 'eficiência', 'efficiency', 'produção', 'production',
        'ordens', 'orders', 'qualidade', 'quality', 'scrap', 'refugo',
        'mês', 'month', 'semana', 'week', 'dia', 'day', 'histórico',
        'history', 'mttr', 'mtbf', 'parada', 'downtime', 'disponibilidade',
        'performance', 'desempenho'
    ];

    const hasMachineKeyword = machineKeywords.some(k => lowerMsg.includes(k));
    const hasMesKeyword = mesKeywords.some(k => lowerMsg.includes(k));

    if (hasMachineKeyword && hasMesKeyword) return 'combined';
    if (hasMachineKeyword) return 'machine';
    return 'mes';
}

/**
 * Query Digital Twin API for machine state
 */
async function queryDigitalTwin(message: string, device: string): Promise<string> {
    try {
        const response = await fetch(`${DT_API_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: message, device }),
        });

        if (!response.ok) {
            throw new Error(`DT API error: ${response.status}`);
        }

        const data = await response.json() as { answer?: string };
        return data.answer || 'Não foi possível obter resposta do Digital Twin.';
    } catch (error) {
        console.error('[AI] Digital Twin query error:', error);

        // Fallback: try to get status directly
        try {
            const statusRes = await fetch(`${DT_API_URL}/status?machine_id=${device}`);
            if (statusRes.ok) {
                const status = await statusRes.json() as Record<string, unknown>;
                return formatMachineStatus(status, device);
            }
        } catch {
            // Ignore fallback error
        }

        return 'Digital Twin temporariamente indisponível. Tente novamente em alguns instantes.';
    }
}

/**
 * Format machine status for response
 */
function formatMachineStatus(status: Record<string, unknown>, device: string): string {
    const values = status.values as Record<string, unknown> || {};

    const temp = values.temperature ?? 'N/A';
    const rpm = values.sawRpm ?? 'N/A';
    const vibration = values.vibration ?? 'N/A';
    const beltSpeed = values.beltSpeed ?? 'N/A';
    const machineStatus = values.status ?? 'desconhecido';

    return `**Estado atual de ${device}:**
- Status: ${machineStatus}
- Temperatura: ${temp}°C
- RPM da Serra: ${rpm}
- Vibração: ${vibration}
- Velocidade da Esteira: ${beltSpeed} m/min`;
}

/**
 * Query MES database for metrics
 */
async function queryMES(message: string): Promise<string> {
    const lowerMsg = message.toLowerCase();
    const responses: string[] = [];

    try {
        // OEE query
        if (lowerMsg.includes('oee') || lowerMsg.includes('eficiência')) {
            // Get historical OEE for the current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const oeeData = await oeeService.getOEEHistory({
                dateFrom: startOfMonth,
                dateTo: now,
            });

            if (oeeData && oeeData.length > 0) {
                // Calculate average OEE for the month
                const avgOEE = oeeData.reduce((sum, d) => sum + (d.oee || 0), 0) / oeeData.length;
                const avgAvailability = oeeData.reduce((sum, d) => sum + (d.availability || 0), 0) / oeeData.length;
                const avgPerformance = oeeData.reduce((sum, d) => sum + (d.performance || 0), 0) / oeeData.length;
                const avgQuality = oeeData.reduce((sum, d) => sum + (d.quality || 0), 0) / oeeData.length;

                responses.push(`**OEE do mês:**
- OEE Médio: ${(avgOEE * 100).toFixed(1)}%
- Disponibilidade: ${(avgAvailability * 100).toFixed(1)}%
- Performance: ${(avgPerformance * 100).toFixed(1)}%
- Qualidade: ${(avgQuality * 100).toFixed(1)}%
- Registros analisados: ${oeeData.length}`);
            } else {
                responses.push('Ainda não há dados de OEE registrados para este mês.');
            }
        }

        // Production orders query
        if (lowerMsg.includes('produção') || lowerMsg.includes('ordens') || lowerMsg.includes('orders')) {
            const orders = await productionOrderService.searchProductionOrders({});

            if (orders && orders.length > 0) {
                const byStatus = orders.reduce((acc, o) => {
                    const status = o.status || 'UNKNOWN';
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const statusList = Object.entries(byStatus)
                    .map(([s, count]) => `  - ${s}: ${count}`)
                    .join('\n');

                responses.push(`**Ordens de Produção:**
- Total: ${orders.length}
Por status:
${statusList}`);
            } else {
                responses.push('Não há ordens de produção no momento.');
            }
        }

        // Quality query
        if (lowerMsg.includes('qualidade') || lowerMsg.includes('quality') ||
            lowerMsg.includes('scrap') || lowerMsg.includes('refugo')) {
            responses.push(`**Métricas de Qualidade:**
Para ver detalhes de qualidade, acesse o painel de Qualidade no menu lateral.`);
        }

        if (responses.length === 0) {
            responses.push(`Posso ajudar com informações sobre:
- **OEE**: "Qual o OEE do mês?"
- **Produção**: "Quantas ordens de produção temos?"
- **Qualidade**: "Qual a taxa de refugo?"
- **Estado das máquinas**: "Qual o estado da serra_01?"`);
        }

        return responses.join('\n\n');
    } catch (error) {
        console.error('[AI] MES query error:', error);
        return 'Erro ao consultar dados do MES. Verifique a conexão com o banco de dados.';
    }
}

/**
 * POST /api/v1/ai/chat
 * Unified AI chat endpoint (public - no auth required)
 */
router.post(
    '/chat',
    validateBody(chatSchema),
    async (req, res, next) => {
        try {
            const { message, device } = req.body;
            const queryType = classifyQuery(message);

            let response: AIResponse;

            switch (queryType) {
                case 'machine':
                    response = {
                        answer: await queryDigitalTwin(message, device),
                        source: 'digital-twin',
                    };
                    break;

                case 'mes':
                    response = {
                        answer: await queryMES(message),
                        source: 'mes',
                    };
                    break;

                case 'combined': {
                    const [dtAnswer, mesAnswer] = await Promise.all([
                        queryDigitalTwin(message, device),
                        queryMES(message),
                    ]);
                    response = {
                        answer: `${dtAnswer}\n\n---\n\n${mesAnswer}`,
                        source: 'combined',
                    };
                    break;
                }
            }

            res.json(response);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/v1/ai/health
 * Check AI system health
 */
router.get('/health', async (_req, res) => {
    let dtStatus = 'unknown';

    try {
        const dtRes = await fetch(`${DT_API_URL}/health`, { method: 'GET' });
        dtStatus = dtRes.ok ? 'healthy' : 'unhealthy';
    } catch {
        dtStatus = 'unreachable';
    }

    res.json({
        status: 'ok',
        digitalTwin: dtStatus,
        mes: 'healthy',
    });
});

export default router;
