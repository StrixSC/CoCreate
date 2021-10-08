import "reflect-metadata";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { Tedis } from "tedis";

export function initializeCache(port: number | undefined) : unknown {
  const tedis = new Tedis({
    port: port,
    host: process.env.CACHE_REDIS_HOST || 'redis',
  });
  return tedis;
 }

export async function initDB(): Promise<Connection> {
  return await createConnection(
      {
          type: "postgres",
          url: process.env.PSQL_URL
      }
  );
}
