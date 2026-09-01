import { describe, expect, it } from "vitest";
import { updateDocumentContentSchema } from "../../../src/validators/document.validator.js";

describe("document content validation", () => {
  it("accepts the supported TipTap document structure", () => {
    const result = updateDocumentContentSchema.safeParse({
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              { type: "text", text: "Plan", marks: [{ type: "bold" }] },
            ],
          },
        ],
      },
      expectedVersion: 1,
    });

    expect(result.success).toBe(true);
  });

  it("rejects nodes unsupported by the configured editor", () => {
    const result = updateDocumentContentSchema.safeParse({
      content: {
        type: "doc",
        content: [
          { type: "image", attrs: { src: "https://example.com/image.png" } },
        ],
      },
      expectedVersion: 1,
    });

    expect(result.success).toBe(false);
  });
});
