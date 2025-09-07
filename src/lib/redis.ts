import Redis from 'ioredis';
import { logger } from '@/lib/logger';

class RedisManager {
  private static instance: RedisManager;
  private client: Redis;
  private subscribers: Map<string, Redis>;

  private constructor() {
    this.client = this.createClient();
    this.subscribers = new Map();
  }

  static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  private createClient(): Redis {
    const client = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
      {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      }
    );

    client.on('error', (error) => {
      logger.error(error, 'Redis client error');
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('ready', () => {
      logger.info('Redis client ready');
    });

    client.on('close', () => {
      logger.warn('Redis client closed');
    });

    client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    return client;
  }

  getClient(): Redis {
    return this.client;
  }

  async getSubscriber(channel: string): Promise<Redis> {
    if (!this.subscribers.has(channel)) {
      const subscriber = this.createClient();
      await subscriber.subscribe(channel);
      this.subscribers.set(channel, subscriber);
    }
    return this.subscribers.get(channel)!;
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    for (const subscriber of this.subscribers.values()) {
      await subscriber.quit();
    }
    this.subscribers.clear();
  }

  // Cache operations with error handling
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error({ key, error }, 'Redis GET error');
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error({ key, error }, 'Redis SET error');
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error({ key, error }, 'Redis DEL error');
      return false;
    }
  }

  // Lock mechanism for distributed operations
  async acquireLock(key: string, ttl: number): Promise<boolean> {
    const lockKey = `lock:${key}`;
    // Use any to avoid strict overload issues with ioredis typings for this helper
    // This performs a SET key value NX EX ttl atomic operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await (this.client as any).set(lockKey, '1', 'NX', 'EX', ttl);
    return res === 'OK';
  }

  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.client.del(lockKey);
  }
}

// Export a singleton instance
export const redis = RedisManager.getInstance();

// Export the class for testing
export { RedisManager };
