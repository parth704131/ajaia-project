import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDatabase } from "../db/client.js";
import { EMPTY_DOCUMENT, type DocumentContent } from "../db/content.js";
import { documents } from "../db/models/document.model.js";
import { users } from "../db/models/user.model.js";

const owners = alias(users, "owners");
const lastEditors = alias(users, "last_editors");

const documentCardSelection = {
  id: documents.id,
  title: documents.title,
  ownerId: documents.ownerId,
  ownerName: owners.name,
  updatedByName: lastEditors.name,
  updatedAt: documents.updatedAt,
};

export function findOwnedDocuments(userId: string) {
  return getDatabase()
    .select(documentCardSelection)
    .from(documents)
    .innerJoin(owners, eq(documents.ownerId, owners.id))
    .innerJoin(lastEditors, eq(documents.updatedBy, lastEditors.id))
    .where(eq(documents.ownerId, userId))
    .orderBy(desc(documents.updatedAt));
}

export async function findDocumentById(id: string) {
  const [document] = await getDatabase()
    .select({
      ...documentCardSelection,
      content: documents.content,
      contentSchemaVersion: documents.contentSchemaVersion,
      version: documents.version,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(owners, eq(documents.ownerId, owners.id))
    .innerJoin(lastEditors, eq(documents.updatedBy, lastEditors.id))
    .where(eq(documents.id, id))
    .limit(1);

  return document ?? null;
}

export async function createDocument(
  ownerId: string,
  title = "Untitled document",
  content: DocumentContent = EMPTY_DOCUMENT,
) {
  const [document] = await getDatabase()
    .insert(documents)
    .values({ title, content, ownerId, updatedBy: ownerId })
    .returning({ id: documents.id });
  return document;
}

export async function renameDocument(
  id: string,
  title: string,
  updatedBy: string,
) {
  const [document] = await getDatabase()
    .update(documents)
    .set({ title, updatedBy, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning({
      id: documents.id,
      title: documents.title,
      updatedAt: documents.updatedAt,
    });
  return document ?? null;
}

export async function updateDocumentContent(
  id: string,
  content: typeof documents.$inferInsert.content,
  updatedBy: string,
  expectedVersion: number,
) {
  const [document] = await getDatabase()
    .update(documents)
    .set({
      content,
      updatedBy,
      updatedAt: new Date(),
      version: expectedVersion + 1,
    })
    .where(and(eq(documents.id, id), eq(documents.version, expectedVersion)))
    .returning({ version: documents.version, updatedAt: documents.updatedAt });
  return document ?? null;
}

export async function deleteDocument(id: string) {
  const [document] = await getDatabase()
    .delete(documents)
    .where(eq(documents.id, id))
    .returning({ id: documents.id });
  return document ?? null;
}
