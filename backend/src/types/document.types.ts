import type { DocumentContent } from "../db/content.js";

export type DocumentAccess = "owner" | "editor";

export type DocumentCard = {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  updatedByName: string;
  updatedAt: Date;
};

export type DocumentDetails = DocumentCard & {
  content: DocumentContent;
  contentSchemaVersion: number;
  version: number;
  createdAt: Date;
};
