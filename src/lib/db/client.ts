import "server-only";

import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & {
  postgresPool?: Pool;
};

export function getPostgresPool(): Pool {
  if (globalForPostgres.postgresPool) {
    return globalForPostgres.postgresPool;
  }

  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }

  const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    max: 10,
  });

  pool.on("error", () => {
    console.error("[PostgreSQL] Idle client error");
  });

  globalForPostgres.postgresPool = pool;
  return pool;
}
