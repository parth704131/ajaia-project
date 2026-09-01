import { Router } from "express";
import { importDocument } from "../controllers/import.controller.js";
import { requireCurrentUser } from "../middleware/current-user.js";
import { uploadDocumentFile } from "../middleware/file-upload.js";

export function createImportRouter() {
  const router = Router();
  router.use(requireCurrentUser());
  router.post("/", uploadDocumentFile, importDocument);
  return router;
}
