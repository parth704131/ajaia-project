import { asc, eq } from "drizzle-orm";
import { getDatabase } from "../db/client.js";
import { users } from "../db/models/user.model.js";

export function findAllUsers() {
  return getDatabase().select().from(users).orderBy(asc(users.name));
}

export async function findUserById(id: string) {
  const [user] = await getDatabase()
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user ?? null;
}
