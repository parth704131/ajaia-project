import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "dotenv";
import { Pool } from "pg";
import * as schema from "./models/index.js";

config({ path: "../.env", quiet: true });

let pool: Pool | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDatabase() {
  if (database) return database;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  pool = new Pool({
    connectionString: databaseUrl,
    max: process.env.NODE_ENV === "production" ? 3 : 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
  });
  database = drizzle({ client: pool, schema });
  return database;
}

export async function closeDatabase() {
  await pool?.end();
  pool = undefined;
  database = undefined;
}
