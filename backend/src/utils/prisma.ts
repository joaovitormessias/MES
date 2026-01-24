import { PrismaClient } from '@prisma/client';
import { logInfo, logError } from './logger';

const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
    ],
});

// Log Prisma queries in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logInfo('Prisma Query', {
            query: e.query,
            params: e.params,
            duration: e.duration,
        });
    });
}

prisma.$on('error', (e) => {
    logError('Prisma Error', new Error(e.message));
});

prisma.$on('warn', (e) => {
    logInfo('Prisma Warning', { message: e.message });
});

export default prisma;

/**
 * Disconnect Prisma client
 */
export async function disconnectPrisma(): Promise<void> {
    await prisma.$disconnect();
    logInfo('Prisma client disconnected');
}
