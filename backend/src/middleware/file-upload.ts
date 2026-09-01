import multer from "multer";

export const uploadDocumentFile = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 1024 * 1024 },
}).single("file");
