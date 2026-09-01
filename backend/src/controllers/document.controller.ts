import type { RequestHandler } from "express";
import * as documentService from "../services/document.service.js";
import {
  createDocumentSchema,
  documentIdSchema,
  renameDocumentSchema,
  updateDocumentContentSchema,
} from "../validators/document.validator.js";

export const listDocuments: RequestHandler = async (request, response) => {
  const data = await documentService.listDocuments(request.currentUser.id);
  response.json({ data });
};

export const createDocument: RequestHandler = async (request, response) => {
  const input = createDocumentSchema.parse(request.body);
  const document = await documentService.createDocument(
    request.currentUser.id,
    input.title,
  );
  response.status(201).json({ data: document });
};

export const getDocument: RequestHandler = async (request, response) => {
  const documentId = documentIdSchema.parse(request.params.id);
  const data = await documentService.getDocument(
    documentId,
    request.currentUser.id,
  );
  response.json({ data });
};

export const renameDocument: RequestHandler = async (request, response) => {
  const documentId = documentIdSchema.parse(request.params.id);
  const input = renameDocumentSchema.parse(request.body);
  const data = await documentService.renameDocument(
    documentId,
    request.currentUser.id,
    input.title,
  );
  response.json({ data });
};

export const saveDocumentContent: RequestHandler = async (
  request,
  response,
) => {
  const documentId = documentIdSchema.parse(request.params.id);
  const input = updateDocumentContentSchema.parse(request.body);
  const data = await documentService.saveDocumentContent(
    documentId,
    request.currentUser.id,
    input.content,
    input.expectedVersion,
  );
  response.json({ data });
};

export const deleteDocument: RequestHandler = async (request, response) => {
  const documentId = documentIdSchema.parse(request.params.id);
  await documentService.deleteDocument(documentId, request.currentUser.id);
  response.status(204).end();
};
