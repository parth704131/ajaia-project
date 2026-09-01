import type { DocumentContent } from "../db/content.js";
import { conflict, forbidden, notFound } from "../errors/app-error.js";
import { resolveDocumentAccess } from "../policies/document.policy.js";
import * as documentRepository from "../repositories/document.repository.js";
import * as shareRepository from "../repositories/share.repository.js";

async function requireDocumentAccess(documentId: string, userId: string) {
  const document = await documentRepository.findDocumentById(documentId);
  if (!document) throw notFound("Document not found");

  const shared =
    document.ownerId === userId
      ? false
      : await shareRepository.isSharedWithUser(documentId, userId);
  const access = resolveDocumentAccess(document, userId, shared);
  if (!access) throw forbidden();

  return { document, access };
}

async function requireDocumentOwner(documentId: string, userId: string) {
  const result = await requireDocumentAccess(documentId, userId);
  if (result.access !== "owner")
    throw forbidden("Only the owner can perform this action");
  return result.document;
}

export async function listDocuments(userId: string) {
  const [owned, shared] = await Promise.all([
    documentRepository.findOwnedDocuments(userId),
    shareRepository.findDocumentsSharedWithUser(userId),
  ]);
  return { owned, shared };
}

export async function createDocument(userId: string, title?: string) {
  const document = await documentRepository.createDocument(userId, title);
  if (!document) throw new Error("Document insert returned no result");
  return document;
}

export async function getDocument(documentId: string, userId: string) {
  return requireDocumentAccess(documentId, userId);
}

export async function renameDocument(
  documentId: string,
  userId: string,
  title: string,
) {
  await requireDocumentOwner(documentId, userId);
  const document = await documentRepository.renameDocument(
    documentId,
    title,
    userId,
  );
  if (!document) throw notFound("Document not found");
  return document;
}

export async function saveDocumentContent(
  documentId: string,
  userId: string,
  content: DocumentContent,
  expectedVersion: number,
) {
  await requireDocumentAccess(documentId, userId);
  const document = await documentRepository.updateDocumentContent(
    documentId,
    content,
    userId,
    expectedVersion,
  );
  if (!document) {
    throw conflict(
      "This document was updated elsewhere. Reload to get the latest version.",
    );
  }
  return document;
}

export async function deleteDocument(documentId: string, userId: string) {
  await requireDocumentOwner(documentId, userId);
  const document = await documentRepository.deleteDocument(documentId);
  if (!document) throw notFound("Document not found");
}
