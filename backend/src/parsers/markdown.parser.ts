import { marked, type Token, type Tokens } from "marked";
import type {
  DocumentContent,
  DocumentMark,
  DocumentNode,
} from "../db/content.js";

function withMark(nodes: DocumentNode[], mark: DocumentMark): DocumentNode[] {
  return nodes.map((node) => {
    if (node.type !== "text") return node;
    return { ...node, marks: [...(node.marks ?? []), mark] };
  });
}

function parseInlineTokens(tokens: Token[] = []): DocumentNode[] {
  return tokens.flatMap((token): DocumentNode[] => {
    switch (token.type) {
      case "text": {
        const text = token as Tokens.Text;
        if (text.tokens?.length) return parseInlineTokens(text.tokens);
        return text.text ? [{ type: "text", text: text.text }] : [];
      }
      case "strong":
        return withMark(parseInlineTokens((token as Tokens.Strong).tokens), {
          type: "bold",
        });
      case "em":
        return withMark(parseInlineTokens((token as Tokens.Em).tokens), {
          type: "italic",
        });
      case "del":
        return withMark(parseInlineTokens((token as Tokens.Del).tokens), {
          type: "strike",
        });
      case "codespan":
        return [
          {
            type: "text",
            text: (token as Tokens.Codespan).text,
            marks: [{ type: "code" }],
          },
        ];
      case "br":
        return [{ type: "hardBreak" }];
      case "link":
        return parseInlineTokens((token as Tokens.Link).tokens);
      case "escape":
        return [{ type: "text", text: (token as Tokens.Escape).text }];
      default:
        return token.raw ? [{ type: "text", text: token.raw }] : [];
    }
  });
}

function paragraph(content: DocumentNode[]): DocumentNode {
  return content.length
    ? { type: "paragraph", content }
    : { type: "paragraph" };
}

function parseList(token: Tokens.List): DocumentNode {
  return {
    type: token.ordered ? "orderedList" : "bulletList",
    content: token.items.map((item) => {
      const content = parseBlockTokens(item.tokens);
      return {
        type: "listItem",
        content: content.length ? content : [paragraph([])],
      };
    }),
  };
}

function parseBlockTokens(tokens: Token[]): DocumentNode[] {
  return tokens.flatMap((token): DocumentNode[] => {
    switch (token.type) {
      case "space":
        return [];
      case "heading": {
        const heading = token as Tokens.Heading;
        return [
          {
            type: "heading",
            attrs: { level: Math.min(heading.depth, 3) },
            content: parseInlineTokens(heading.tokens),
          },
        ];
      }
      case "paragraph": {
        const value = token as Tokens.Paragraph;
        return [paragraph(parseInlineTokens(value.tokens))];
      }
      case "text": {
        const value = token as Tokens.Text;
        return [paragraph(parseInlineTokens(value.tokens ?? [value]))];
      }
      case "list":
        return [parseList(token as Tokens.List)];
      case "blockquote":
        return [
          {
            type: "blockquote",
            content: parseBlockTokens((token as Tokens.Blockquote).tokens),
          },
        ];
      case "code": {
        const value = token as Tokens.Code;
        return [
          { type: "codeBlock", content: [{ type: "text", text: value.text }] },
        ];
      }
      case "hr":
        return [{ type: "horizontalRule" }];
      default:
        return token.raw.trim()
          ? [paragraph([{ type: "text", text: token.raw.trim() }])]
          : [];
    }
  });
}

export function parseMarkdown(markdown: string): DocumentContent {
  const content = parseBlockTokens(marked.lexer(markdown));
  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}

export function parsePlainText(text: string): DocumentContent {
  const paragraphs = text
    .split(/\r?\n/)
    .map((line) =>
      line.length
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" },
    );
  return {
    type: "doc",
    content: paragraphs.length ? paragraphs : [{ type: "paragraph" }],
  };
}
