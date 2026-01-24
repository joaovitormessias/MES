import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from '../config';

// Ensure log directory exists
const logDir = config.logging.filePath;
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for structured logging
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    defaultMeta: { service: 'mes-renar' },
    transports: [
        // Error log file
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 10,
        }),
    ],
});

// Add console transport in development
if (config.server.nodeEnv !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// Helper methods for structured logging
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
    logger.info(message, meta);
};

export const logError = (message: string, error?: Error, meta?: Record<string, unknown>) => {
    logger.error(message, { ...meta, error: error?.message, stack: error?.stack });
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
    logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: Record<string, unknown>) => {
    logger.debug(message, meta);
};

export default logger;
