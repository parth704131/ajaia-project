import { Router } from "express";
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  renameDocument,
  saveDocumentContent,
} from "../controllers/document.controller.js";
import {
  listCollaborators,
  revokeDocumentShare,
  shareDocument,
} from "../controllers/share.controller.js";
import { requireCurrentUser } from "../middleware/current-user.js";

export function createDocumentRouter() {
  const router = Router();
  router.use(requireCurrentUser());
  router.get("/", listDocuments);
  router.post("/", createDocument);
  router.get("/:id", getDocument);
  router.patch("/:id/title", renameDocument);
  router.patch("/:id/content", saveDocumentContent);
  router.get("/:id/shares", listCollaborators);
  router.post("/:id/shares", shareDocument);
  router.delete("/:id/shares/:userId", revokeDocumentShare);
  router.delete("/:id", deleteDocument);
  return router;
}
