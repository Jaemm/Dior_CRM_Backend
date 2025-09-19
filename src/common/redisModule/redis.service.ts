import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private readonly redisClient: Redis;

    constructor() {
    }

    subscribe(message: string) {
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
