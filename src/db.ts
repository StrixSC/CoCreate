import { Tedis } from 'tedis';
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();

export function initializeCache(port: number | undefined): unknown {
  const tedis = new Tedis({
    port: port,
    host: process.env.CACHE_REDIS_HOST || 'localhost',
  });
  return tedis;
}
