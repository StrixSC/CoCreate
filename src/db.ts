import "reflect-metadata";
import { createConnection, Connection, ConnectionOptions } from "typeorm";
import { Tedis } from "tedis";

export async function initDB(): Promise<Connection> {
  return await createConnection(
      {
          type: "postgres",
          url: process.env.PSQL_URL
      }
  );
}
