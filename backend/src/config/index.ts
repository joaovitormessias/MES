import dotenv from 'dotenv';

dotenv.config();

interface Config {
    server: {
        nodeEnv: string;
        port: number;
        apiVersion: string;
    };
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    erp: {
        type: 'rest' | 'database';
        apiUrl?: string;
        apiKey?: string;
        dbHost?: string;
        dbPort?: number;
        dbName?: string;
        dbUser?: string;
        dbPassword?: string;
    };
    optimizer: {
        dbType: 'sqlserver' | 'mysql' | 'postgresql';
        dbHost: string;
        dbPort: number;
        dbName: string;
        dbUser: string;
        dbPassword: string;
    };
    cnc: {
        protocol: 'opcua' | 'modbus' | 'database';
        opcEndpoint?: string;
    };
    logging: {
        level: string;
        filePath: string;
    };
    metrics: {
        enabled: boolean;
        port: number;
    };
    cors: {
        origin: string[];
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    jobs: {
        erpSyncCron: string;
        oeeCalcCron: string;
        shiftConsolidationCron: string;
    };
}

const config: Config = {
    server: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT || '3000', 10),
        apiVersion: process.env.API_VERSION || 'v1',
    },
    database: {
        url: process.env.DATABASE_URL || 'postgresql://mes_user:mes_password@localhost:5432/mes_renar',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    },
    erp: {
        type: (process.env.ERP_TYPE as 'rest' | 'database') || 'rest',
        apiUrl: process.env.ERP_API_URL,
        apiKey: process.env.ERP_API_KEY,
        dbHost: process.env.ERP_DB_HOST,
        dbPort: process.env.ERP_DB_PORT ? parseInt(process.env.ERP_DB_PORT, 10) : undefined,
        dbName: process.env.ERP_DB_NAME,
        dbUser: process.env.ERP_DB_USER,
        dbPassword: process.env.ERP_DB_PASSWORD,
    },
    optimizer: {
        dbType: (process.env.OPTIMIZER_DB_TYPE as 'sqlserver' | 'mysql' | 'postgresql') || 'sqlserver',
        dbHost: process.env.OPTIMIZER_DB_HOST || 'localhost',
        dbPort: parseInt(process.env.OPTIMIZER_DB_PORT || '1433', 10),
        dbName: process.env.OPTIMIZER_DB_NAME || 'OptimizerDB',
        dbUser: process.env.OPTIMIZER_DB_USER || 'mes_reader',
        dbPassword: process.env.OPTIMIZER_DB_PASSWORD || '',
    },
    cnc: {
        protocol: (process.env.CNC_PROTOCOL as 'opcua' | 'modbus' | 'database') || 'opcua',
        opcEndpoint: process.env.CNC_OPC_ENDPOINT,
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH || './logs',
    },
    metrics: {
        enabled: process.env.METRICS_ENABLED === 'true',
        port: parseInt(process.env.METRICS_PORT || '9090', 10),
    },
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    jobs: {
        erpSyncCron: process.env.ERP_SYNC_CRON || '*/5 * * * *',
        oeeCalcCron: process.env.OEE_CALC_CRON || '0 * * * *',
        shiftConsolidationCron: process.env.SHIFT_CONSOLIDATION_CRON || '0 6,14,22 * * *',
    },
};

export default config;
