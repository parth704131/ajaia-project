import { z } from "zod";

const documentMarkSchema = z
  .object({
    type: z.string().min(1),
    attrs: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const documentNodeSchema: z.ZodType = z.lazy(() =>
  z
    .object({
      type: z.string().min(1),
      attrs: z.record(z.string(), z.unknown()).optional(),
      content: z.array(documentNodeSchema).optional(),
      marks: z.array(documentMarkSchema).optional(),
      text: z.string().optional(),
    })
    .passthrough(),
);

const supportedNodeTypes = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
]);
const supportedMarkTypes = new Set([
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
]);

type ValidatedNode = {
  type?: unknown;
  attrs?: { level?: unknown };
  marks?: Array<{ type?: unknown }>;
  content?: ValidatedNode[];
};

const supportedDocumentSchema = documentNodeSchema.superRefine(
  (node, context) => {
    function validateNode(value: ValidatedNode, path: Array<string | number>) {
      if (
        typeof value.type !== "string" ||
        !supportedNodeTypes.has(value.type)
      ) {
        context.addIssue({
          code: "custom",
          path,
          message: `Unsupported document node: ${value.type}`,
        });
      }
      if (
        value.type === "heading" &&
        value.attrs?.level !== 1 &&
        value.attrs?.level !== 2
      ) {
        context.addIssue({
          code: "custom",
          path: [...path, "attrs", "level"],
          message: "Only heading levels 1 and 2 are supported",
        });
      }
      for (const [index, mark] of (value.marks ?? []).entries()) {
        if (
          typeof mark.type !== "string" ||
          !supportedMarkTypes.has(mark.type)
        ) {
          context.addIssue({
            code: "custom",
            path: [...path, "marks", index],
            message: `Unsupported document mark: ${mark.type}`,
          });
        }
      }
      for (const [index, child] of (value.content ?? []).entries()) {
        validateNode(child, [...path, "content", index]);
      }
    }

    validateNode(node as ValidatedNode, []);
  },
);

export const documentIdSchema = z.uuid();

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
});

export const renameDocumentSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export const updateDocumentContentSchema = z.object({
  content: supportedDocumentSchema.and(z.object({ type: z.literal("doc") })),
  expectedVersion: z.int().positive(),
});

export const shareDocumentSchema = z.object({
  userId: z.uuid(),
});
