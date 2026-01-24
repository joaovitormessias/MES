import { createClient, RedisClientType } from 'redis';
import config from '../config';
import { logInfo, logError } from './logger';

let redisClient: RedisClientType | null = null;

/**
 * Get or create Redis client
 */
export async function getRedisClient(): Promise<RedisClientType> {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }

    redisClient = createClient({
        url: config.redis.url,
    });

    redisClient.on('error', (err) => {
        logError('Redis client error', err);
    });

    redisClient.on('connect', () => {
        logInfo('Redis client connected');
    });

    await redisClient.connect();
    return redisClient;
}

/**
 * Check if an idempotency key has been used
 * @param key Idempotency key
 * @param ttlSeconds Time to live in seconds (default 24 hours)
 * @returns true if key exists (duplicate), false if new
 */
export async function checkIdempotencyKey(
    key: string,
    ttlSeconds: number = 86400
): Promise<boolean> {
    const client = await getRedisClient();
    const fullKey = `idempotency:${key}`;

    const exists = await client.exists(fullKey);
    if (exists) {
        return true; // Duplicate
    }

    // Set the key with TTL
    await client.setEx(fullKey, ttlSeconds, '1');
    return false; // New key
}

/**
 * Store idempotency result for retrieval
 * @param key Idempotency key
 * @param result Result to store
 * @param ttlSeconds Time to live in seconds
 */
export async function storeIdempotencyResult(
    key: string,
    result: unknown,
    ttlSeconds: number = 86400
): Promise<void> {
    const client = await getRedisClient();
    const fullKey = `idempotency:result:${key}`;
    await client.setEx(fullKey, ttlSeconds, JSON.stringify(result));
}

/**
 * Get stored idempotency result
 * @param key Idempotency key
 * @returns Stored result or null
 */
export async function getIdempotencyResult<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    const fullKey = `idempotency:result:${key}`;
    const result = await client.get(fullKey);
    return result ? JSON.parse(result) : null;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        logInfo('Redis client disconnected');
    }
}
