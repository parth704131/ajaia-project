import { describe, expect, it } from "vitest";
import { resolveDocumentAccess } from "../../../src/policies/document.policy.js";

const document = { ownerId: "alice" };

describe("resolveDocumentAccess", () => {
  it("grants owner access to the document owner", () => {
    expect(resolveDocumentAccess(document, "alice", false)).toBe("owner");
  });

  it("grants editor access to a shared user", () => {
    expect(resolveDocumentAccess(document, "bob", true)).toBe("editor");
  });

  it("denies an unshared user", () => {
    expect(resolveDocumentAccess(document, "carol", false)).toBeNull();
  });
});
