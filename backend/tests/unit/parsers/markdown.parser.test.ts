import { describe, expect, it } from "vitest";
import {
  parseMarkdown,
  parsePlainText,
} from "../../../src/parsers/markdown.parser.js";

describe("document import parsers", () => {
  it("preserves supported Markdown structure and inline formatting", () => {
    const document = parseMarkdown(
      "# Plan\n\nA **bold** decision.\n\n- Build\n- Verify",
    );

    expect(document).toMatchObject({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 } },
        {
          type: "paragraph",
          content: expect.arrayContaining([
            expect.objectContaining({
              text: "bold",
              marks: [{ type: "bold" }],
            }),
          ]),
        },
        { type: "bulletList" },
      ],
    });
  });

  it("converts plain-text lines into editable paragraphs", () => {
    expect(parsePlainText("First\n\nThird").content).toEqual([
      { type: "paragraph", content: [{ type: "text", text: "First" }] },
      { type: "paragraph" },
      { type: "paragraph", content: [{ type: "text", text: "Third" }] },
    ]);
  });
});
