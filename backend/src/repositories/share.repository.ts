import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDatabase } from "../db/client.js";
import { documentShares } from "../db/models/document-share.model.js";
import { documents } from "../db/models/document.model.js";
import { users } from "../db/models/user.model.js";

const owners = alias(users, "owners");
const lastEditors = alias(users, "last_editors");

export function findDocumentsSharedWithUser(userId: string) {
  return getDatabase()
    .select({
      id: documents.id,
      title: documents.title,
      ownerId: documents.ownerId,
      ownerName: owners.name,
      updatedByName: lastEditors.name,
      updatedAt: documents.updatedAt,
    })
    .from(documentShares)
    .innerJoin(documents, eq(documentShares.documentId, documents.id))
    .innerJoin(owners, eq(documents.ownerId, owners.id))
    .innerJoin(lastEditors, eq(documents.updatedBy, lastEditors.id))
    .where(eq(documentShares.userId, userId))
    .orderBy(desc(documents.updatedAt));
}

export async function isSharedWithUser(documentId: string, userId: string) {
  const [share] = await getDatabase()
    .select({ documentId: documentShares.documentId })
    .from(documentShares)
    .where(
      and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.userId, userId),
      ),
    )
    .limit(1);
  return Boolean(share);
}

export function findDocumentCollaborators(documentId: string) {
  return getDatabase()
    .select({
      userId: documentShares.userId,
      name: users.name,
      email: users.email,
      role: documentShares.role,
      grantedAt: documentShares.grantedAt,
    })
    .from(documentShares)
    .innerJoin(users, eq(documentShares.userId, users.id))
    .where(eq(documentShares.documentId, documentId))
    .orderBy(users.name);
}

export async function createDocumentShare(documentId: string, userId: string) {
  const [share] = await getDatabase()
    .insert(documentShares)
    .values({ documentId, userId, role: "editor" })
    .onConflictDoNothing()
    .returning({
      documentId: documentShares.documentId,
      userId: documentShares.userId,
    });
  return share ?? null;
}

export async function deleteDocumentShare(documentId: string, userId: string) {
  const [share] = await getDatabase()
    .delete(documentShares)
    .where(
      and(
        eq(documentShares.documentId, documentId),
        eq(documentShares.userId, userId),
      ),
    )
    .returning({
      documentId: documentShares.documentId,
      userId: documentShares.userId,
    });
  return share ?? null;
}
