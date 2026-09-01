import type { RequestHandler } from "express";
import { badRequest } from "../errors/app-error.js";
import { importDocument as importDocumentFile } from "../services/import.service.js";
import { importedFileSchema } from "../validators/import.validator.js";

export const importDocument: RequestHandler = async (request, response) => {
  if (!request.file) throw badRequest("Choose a .txt or .md file to import");
  const file = importedFileSchema.parse(request.file);
  const document = await importDocumentFile(request.currentUser.id, file);
  response.status(201).json({ data: document });
};
