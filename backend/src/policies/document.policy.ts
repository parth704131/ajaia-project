import type { DocumentAccess } from "../types/document.types.js";

export function resolveDocumentAccess(
  document: { ownerId: string },
  userId: string,
  isSharedEditor: boolean,
): DocumentAccess | null {
  if (document.ownerId === userId) return "owner";
  if (isSharedEditor) return "editor";
  return null;
}
