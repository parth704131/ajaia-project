export type DocumentMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type DocumentNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocumentNode[];
  marks?: DocumentMark[];
  text?: string;
};

export type DocumentContent = DocumentNode & {
  type: "doc";
};

export const EMPTY_DOCUMENT: DocumentContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const CURRENT_CONTENT_SCHEMA_VERSION = 1;
