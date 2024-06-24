// redis.service.ts
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis'; // Use default import

@Injectable()
export class RedisService {
    private readonly redisClient: Redis;

    constructor() {
        // this.redisClient = new Redis({
        //   host: '127.0.0.1',
        //   port: 6379,
        //   // Add more options as needed, such as password, TLS, etc.
        // });
    }

    subscribe(message: string) {
        // Subscribe to the specified channel
        this.redisClient.subscribe(message);
    }

    on(message: string, cb: any) {
        this.redisClient.on(message, cb);
    }
    async set(key: string, value: string): Promise<void> {
        await this.redisClient.set(key, value);
    }

    async get(key: string): Promise<string | null> {
        return await this.redisClient.get(key);
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }
}
