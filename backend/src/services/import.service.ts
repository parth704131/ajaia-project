import path from "node:path";
import { badRequest } from "../errors/app-error.js";
import { parseMarkdown, parsePlainText } from "../parsers/markdown.parser.js";
import * as documentRepository from "../repositories/document.repository.js";

type ImportedFile = {
  originalname: string;
  buffer: Buffer;
};

export async function importDocument(userId: string, file: ImportedFile) {
  const extension = path.extname(file.originalname).toLowerCase();
  const title = path
    .basename(file.originalname, extension)
    .trim()
    .slice(0, 120);
  const source = file.buffer.toString("utf8").replace(/^\uFEFF/, "");
  if (!source.trim()) throw badRequest("The selected file is empty");

  const content =
    extension === ".md" ? parseMarkdown(source) : parsePlainText(source);
  const document = await documentRepository.createDocument(
    userId,
    title || "Imported document",
    content,
  );
  if (!document) throw new Error("Imported document insert returned no result");
  return document;
}
