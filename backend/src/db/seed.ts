import { sql } from "drizzle-orm";
import { closeDatabase, getDatabase } from "./client.js";
import { users } from "./models/user.model.js";

export const SEEDED_USERS = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Alice Johnson",
    email: "alice@ajaia.demo",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Bob Smith",
    email: "bob@ajaia.demo",
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Carol Williams",
    email: "carol@ajaia.demo",
  },
] as const;

async function seed() {
  await getDatabase()
    .insert(users)
    .values([...SEEDED_USERS])
    .onConflictDoUpdate({
      target: users.id,
      set: {
        name: sql`excluded.name`,
        email: sql`excluded.email`,
      },
    });

  console.log(`Seeded ${SEEDED_USERS.length} demo users.`);
}

seed()
  .catch((error: unknown) => {
    console.error("Database seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDatabase();
  });
