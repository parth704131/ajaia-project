import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../.env", quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run Drizzle commands");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/models/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
