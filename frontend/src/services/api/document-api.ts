import type { JSONContent } from "@tiptap/react";
import type {
  Collaborator,
  DocumentAccess,
  DocumentCard,
  DocumentDetails,
} from "../../types/api.types";
import { apiRequest } from "./client";

export type DocumentList = { owned: DocumentCard[]; shared: DocumentCard[] };

export function fetchDocuments(userId: string, signal?: AbortSignal) {
  return apiRequest<DocumentList>("/documents", { userId, signal });
}

export function createDocument(userId: string) {
  return apiRequest<{ id: string }>("/documents", {
    method: "POST",
    userId,
    body: JSON.stringify({}),
  });
}

export function fetchDocument(
  documentId: string,
  userId: string,
  signal?: AbortSignal,
) {
  return apiRequest<{ document: DocumentDetails; access: DocumentAccess }>(
    `/documents/${documentId}`,
    { userId, signal },
  );
}

export function renameDocument(
  documentId: string,
  userId: string,
  title: string,
) {
  return apiRequest<{ title: string; updatedAt: string }>(
    `/documents/${documentId}/title`,
    {
      method: "PATCH",
      userId,
      body: JSON.stringify({ title }),
    },
  );
}

export function saveDocument(
  documentId: string,
  userId: string,
  content: JSONContent,
  expectedVersion: number,
  keepalive = false,
) {
  return apiRequest<{ version: number; updatedAt: string }>(
    `/documents/${documentId}/content`,
    {
      method: "PATCH",
      userId,
      keepalive,
      body: JSON.stringify({ content, expectedVersion }),
    },
  );
}

export function deleteDocument(documentId: string, userId: string) {
  return apiRequest<void>(`/documents/${documentId}`, {
    method: "DELETE",
    userId,
  });
}

export function importDocument(userId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  return apiRequest<{ id: string }>("/import", {
    method: "POST",
    userId,
    body,
  });
}

export function fetchCollaborators(documentId: string, userId: string) {
  return apiRequest<Collaborator[]>(`/documents/${documentId}/shares`, {
    userId,
  });
}

export function shareDocument(
  documentId: string,
  ownerId: string,
  userId: string,
) {
  return apiRequest(`/documents/${documentId}/shares`, {
    method: "POST",
    userId: ownerId,
    body: JSON.stringify({ userId }),
  });
}

export function revokeShare(
  documentId: string,
  ownerId: string,
  userId: string,
) {
  return apiRequest<void>(`/documents/${documentId}/shares/${userId}`, {
    method: "DELETE",
    userId: ownerId,
  });
}
