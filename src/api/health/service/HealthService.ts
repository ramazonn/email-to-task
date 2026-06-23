import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly configService: ConfigService,
  ) {}

  async check() {
    const mongo = await this.checkMongo();
    const redis = await this.checkRedis();

    return {
      status: mongo && redis ? 'ok' : 'degraded',
      mongo,
      redis,
    };
  }

  private async checkMongo(): Promise<boolean> {
    try {
      if (this.mongoConnection.readyState !== 1) {
        return false;
      }

      await this.mongoConnection.db?.admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    const client = new Redis({
      host: this.configService.getOrThrow<string>('REDIS_HOST'),
      port: Number(this.configService.getOrThrow<string>('REDIS_PORT')),
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      connectTimeout: 3000,
    });

    try {
      await client.connect();
      const pong = await client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    } finally {
      client.disconnect();
    }
  }
}
