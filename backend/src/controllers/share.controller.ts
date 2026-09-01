import type { RequestHandler } from "express";
import * as shareService from "../services/share.service.js";
import {
  documentIdSchema,
  shareDocumentSchema,
} from "../validators/document.validator.js";

export const listCollaborators: RequestHandler = async (request, response) => {
  const documentId = documentIdSchema.parse(request.params.id);
  const data = await shareService.listCollaborators(
    documentId,
    request.currentUser.id,
  );
  response.json({ data });
};

export const shareDocument: RequestHandler = async (request, response) => {
  const documentId = documentIdSchema.parse(request.params.id);
  const input = shareDocumentSchema.parse(request.body);
  const data = await shareService.shareDocument(
    documentId,
    request.currentUser.id,
    input.userId,
  );
  response.status(201).json({ data });
};

export const revokeDocumentShare: RequestHandler = async (
  request,
  response,
) => {
  const documentId = documentIdSchema.parse(request.params.id);
  const userId = documentIdSchema.parse(request.params.userId);
  await shareService.revokeDocumentShare(
    documentId,
    request.currentUser.id,
    userId,
  );
  response.status(204).end();
};
