import type { JSONContent } from "@tiptap/react";

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};
export type DocumentCard = {
  id: string;
  title: string;
  ownerId: string;
  ownerName: string;
  updatedByName: string;
  updatedAt: string;
};
export type DocumentDetails = DocumentCard & {
  content: JSONContent;
  contentSchemaVersion: number;
  version: number;
  createdAt: string;
};
export type DocumentAccess = "owner" | "editor";
export type Collaborator = {
  userId: string;
  name: string;
  email: string;
  role: "editor";
  grantedAt: string;
};
