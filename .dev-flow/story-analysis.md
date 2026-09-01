# Story Analysis — Ajaia Collaborative Docs

## Problem and intended outcome

Build a reviewer-friendly collaborative document editor within a 4–6 hour delivery
window. The product must demonstrate a coherent full-stack slice: document creation,
rich-text editing, persistence, file import, and owner-controlled sharing. The goal is
not feature parity with Google Docs; it is a dependable core workflow with explicit
scope decisions.

## Reference-repository assessment

The referenced `mdamorgit/google-docs-ajaia` project uses SvelteKit, TipTap, Supabase
Postgres, and a centralized policy/repository structure. We will adapt its sound
product and architecture patterns to our chosen React + Express stack:

- Store TipTap JSON rather than HTML so formatting survives reloads predictably.
- Model shares in a join table instead of embedding user IDs in documents.
- Enforce owner/access rules in Express middleware/services, never only in React.
- Keep editor extensions in one registry used by rendering and import conversion.
- Use debounced autosave with visible states and a final best-effort navigation flush.
- Separate owned and shared documents on the dashboard.

We will not copy the reference project's self-managed password authentication,
`.docx` import, images, tables, alignment controls, or real-time features. Those are
outside the assignment's minimum requirements and create disproportionate schedule,
security, and fidelity risk.

## Users

- Alice: seeded document owner and default active user.
- Bob: seeded collaborator used to demonstrate sharing and shared edits.
- Carol: seeded unshared user used to demonstrate access denial.
- Reviewer: switches between seeded users without signup or credentials.

## Primary flows

1. Reviewer selects Alice and creates a new document.
2. Alice renames it and edits formatted content in TipTap.
3. Autosave persists the title/content and displays saving success or failure.
4. Alice returns to the dashboard and reopens the persisted document.
5. Alice imports a `.txt` or `.md` file as a new editable document.
6. Alice shares a document with Bob.
7. Reviewer switches to Bob, sees the document under "Shared with me", opens it,
   edits it, and verifies Alice can see the update.
8. Reviewer switches to Carol and verifies that the document is not listed and a
   direct URL returns an access-denied experience.

## Acceptance criteria

### Document lifecycle

- A user can create a document with a default title and empty valid TipTap content.
- An owner can rename a document to a trimmed, non-empty title up to 120 characters.
- An owner or shared editor can edit content using bold, italic, underline, H1/H2,
  bullet lists, and numbered lists.
- Saved TipTap JSON and title remain after refresh and server restart.
- The dashboard orders documents by most recently updated.

### Saving and recovery

- Content autosaves after approximately 800 ms without changes.
- The editor visibly distinguishes saving, saved, and failed states.
- A failed save keeps the local editor content and offers a retry action.
- Stale save responses cannot incorrectly replace the status of a newer save.
- Pending timers/requests are cleaned up when the editor unmounts.

### Import

- The UI clearly states that `.txt` and `.md` files up to 1 MB are supported.
- A valid file creates a new document using the filename as its title.
- Markdown headings, emphasis, and lists that TipTap supports are preserved.
- Unsupported, empty, and oversized files return actionable validation messages.

### Sharing and authorization

- Every document has exactly one owner.
- Only the owner can grant or revoke access and rename/delete the document.
- An owner can grant Bob editor access but cannot share with themselves or create a
  duplicate share.
- Shared editors can open and update content but cannot manage sharing or ownership.
- Dashboard sections visibly distinguish owned and shared documents.
- Express returns 401 for missing user identity, 403 for denied access, and 404 for
  a missing document without silently swallowing errors.

### Engineering and delivery

- Database schema and seed command are reproducible.
- API input is validated with Zod and upload boundaries are enforced server-side.
- At minimum, policy/API tests cover owner access, shared access, and denied access.
- Build, type-check, tests, and a browser smoke flow pass.
- README, ARCHITECTURE.md, AI_WORKFLOW.md, SUBMISSION.md, deployment config, and
  walkthrough-link placeholder are included.

## Proposed architecture

```text
React + Vite
  Dashboard / Editor / Share dialog / Import dialog / User switcher
        |
        | REST JSON + multipart upload; x-user-id identifies seeded reviewer user
        v
Express API
  routes -> Zod validation -> access policy -> service/repository
        |
        v
PostgreSQL
  users <- documents -> document_shares
                  |
             TipTap JSONB
```

### Frontend boundaries

- `src/api/`: typed fetch client and normalized API errors.
- `src/features/documents/`: dashboard, document cards, create/import actions.
- `src/features/editor/`: TipTap editor, toolbar, autosave state machine.
- `src/features/sharing/`: share dialog and collaborator list.
- `src/context/CurrentUserContext.tsx`: seeded-user selection persisted locally.
- React Router routes: `/` and `/documents/:documentId`.

### Backend boundaries

- `src/routes/`: users, documents, sharing, import endpoints.
- `src/middleware/currentUser.ts`: validates `x-user-id` against seeded users.
- `src/policies/documentPolicy.ts`: owner/access checks used by every protected route.
- `src/services/`: document and import orchestration.
- `src/db/`: Drizzle schema, connection, migrations, seed data, repositories.
- `src/errors/`: consistent API error envelope and final error middleware.

### Data model

- `users(id UUID PK, name, email UNIQUE, created_at)`
- `documents(id UUID PK, title, content JSONB, owner_id FK, created_at,
  updated_at, updated_by FK)`
- `document_shares(document_id FK, user_id FK, role, created_at,
  PRIMARY KEY(document_id, user_id))`
- Cascading document deletion removes its share rows.
- Shipped role is `editor`; the role column permits future `viewer` support.

### API surface

- `GET /api/users`
- `GET /api/documents`
- `POST /api/documents`
- `GET /api/documents/:id`
- `PATCH /api/documents/:id`
- `DELETE /api/documents/:id`
- `POST /api/documents/:id/shares`
- `DELETE /api/documents/:id/shares/:userId`
- `POST /api/import`

## Edge cases and failure behavior

- Invalid/missing current user: show user-session recovery rather than an empty list.
- Empty dashboard: explain how to create or import the first document.
- Deleted document opened from stale URL: dedicated not-found state with dashboard link.
- Denied document: dedicated access-denied state without leaking its contents.
- Import parse failure: no partial document row is created.
- Network loss during autosave: retain local edits, show retry, save on next change/retry.
- Rapid edits: debounce and sequence saves so old responses cannot mark new content saved.
- Duplicate sharing: idempotent response or validation message, never duplicate rows.

## Affected areas and integration points

- Existing frontend placeholder becomes routed dashboard/editor application.
- Existing Express health app gains API routers and error middleware.
- Root scripts gain database migration/seed commands.
- Deployment must inject a database URL and serve the built React application.

## Assumptions

- Mocked seeded-user switching satisfies the assignment's authentication allowance.
- All shared users are editors; only owners manage document metadata and access.
- Import means creating a new document, not attaching a binary file.
- English UI and desktop-first responsive behavior are sufficient.
- One process serves API and production frontend to simplify deployment.

## Explicit non-goals

- Real authentication, password reset, invitations, or email delivery.
- Real-time editing, presence, CRDT/OT, comments, suggestions, or version history.
- `.docx`, PDF, image, table, link, and attachment workflows.
- Public links, viewer/commenter UI, teams, workspaces, or ownership transfer.
- Pixel parity with Google Docs.

## Ambiguities

### Blocking decisions

- None. Local development uses local PostgreSQL; production uses Neon PostgreSQL
  connected through Vercel. Both use the same Drizzle schema and migrations.

### Non-blocking assumptions

- Product name: "Ajaia Docs".
- `.txt` and `.md` are the only supported imports.
- Shared users have edit access, while owner-only operations remain protected.
- Reviewer identity uses a mocked Alice/Bob/Carol user switcher.
- Delete is included as a small, coherent lifecycle affordance even though the prompt
  does not explicitly require it; it can be cut first if schedule pressure appears.

## Verification strategy

- Unit tests for Markdown/text conversion and policy decisions.
- Supertest integration tests for document CRUD, access denial, and sharing.
- Database integration test using an isolated test database/schema where practical.
- Production build and TypeScript checks for both workspaces.
- Browser smoke test: Alice creates/formats/imports/shares; Bob reopens/edits; Carol is
  denied; refresh preserves content and formatting.
