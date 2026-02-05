import express, { Application } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from '../config';
import { logInfo, logError } from '../utils/logger';
import { register } from '../utils/metrics';
import { requestLogger } from './middleware/logging.middleware';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { getRedisClient, closeRedis } from '../utils/idempotency';
import { disconnectPrisma } from '../utils/prisma';
import { startTelemetryBridge, stopTelemetryBridge } from '../services/telemetry-bridge.service';
import routes from './routes';

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    path: '/api/live/ws',
    cors: {
        origin: config.cors.origin,
        credentials: true,
    },
});

io.on('connection', (socket) => {
    logInfo('Client connected to WebSocket', { socketId: socket.id });

    socket.on('disconnect', () => {
        logInfo('Client disconnected from WebSocket', { socketId: socket.id });
    });
});

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
    },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// Root route
app.get('/', (_req, res) => {
    res.json({
        service: 'MES RENAR Backend',
        version: config.server.apiVersion,
        docs: '/api/v1/docs', // Placeholder for future docs
        health: '/health',
    });
});

// Metrics endpoint
if (config.metrics.enabled) {
    app.get('/metrics', async (_req, res) => {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    });
}

// API routes
app.use(`/api/${config.server.apiVersion}`, routes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = httpServer.listen(config.server.port, async () => {
    logInfo(`MES RENAR Backend started`, {
        port: config.server.port,
        env: config.server.nodeEnv,
        apiVersion: config.server.apiVersion,
    });

    // Initialize Redis
    try {
        await getRedisClient();
        logInfo('Redis connection established');
    } catch (error) {
        logError('Failed to connect to Redis', error as Error);
    }

    // Start telemetry bridge
    try {
        startTelemetryBridge();
        logInfo('Telemetry bridge started');
    } catch (error) {
        logError('Failed to start telemetry bridge', error as Error);
    }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
    logInfo(`${signal} received, starting graceful shutdown`);

    server.close(async () => {
        logInfo('HTTP server closed');

        try {
            stopTelemetryBridge();
            await closeRedis();
            await disconnectPrisma();
            logInfo('All connections closed');
            process.exit(0);
        } catch (error) {
            logError('Error during shutdown', error as Error);
            process.exit(1);
        }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        logError('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
