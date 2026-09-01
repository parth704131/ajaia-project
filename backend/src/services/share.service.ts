import { conflict, forbidden, notFound } from "../errors/app-error.js";
import * as documentRepository from "../repositories/document.repository.js";
import * as shareRepository from "../repositories/share.repository.js";
import * as userRepository from "../repositories/user.repository.js";

async function requireOwner(documentId: string, ownerId: string) {
  const document = await documentRepository.findDocumentById(documentId);
  if (!document) throw notFound("Document not found");
  if (document.ownerId !== ownerId)
    throw forbidden("Only the owner can manage sharing");
  return document;
}

export async function listCollaborators(documentId: string, ownerId: string) {
  await requireOwner(documentId, ownerId);
  return shareRepository.findDocumentCollaborators(documentId);
}

export async function shareDocument(
  documentId: string,
  ownerId: string,
  userId: string,
) {
  await requireOwner(documentId, ownerId);
  if (userId === ownerId)
    throw conflict("The owner already has access to this document");

  const user = await userRepository.findUserById(userId);
  if (!user) throw notFound("The selected user does not exist");

  const share = await shareRepository.createDocumentShare(documentId, userId);
  if (!share) throw conflict("This document is already shared with that user");
  return share;
}

export async function revokeDocumentShare(
  documentId: string,
  ownerId: string,
  userId: string,
) {
  await requireOwner(documentId, ownerId);
  const share = await shareRepository.deleteDocumentShare(documentId, userId);
  if (!share) throw notFound("Share not found");
}
