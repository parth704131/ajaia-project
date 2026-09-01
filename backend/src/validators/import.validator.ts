import path from "node:path";
import { z } from "zod";

export const importedFileSchema = z
  .object({
    originalname: z.string().min(1),
    mimetype: z.string(),
    size: z
      .number()
      .int()
      .positive()
      .max(1024 * 1024),
    buffer: z.instanceof(Buffer),
  })
  .superRefine((file, context) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!new Set([".txt", ".md"]).has(extension)) {
      context.addIssue({
        code: "custom",
        message: "Only .txt and .md files are supported",
      });
    }
  });
