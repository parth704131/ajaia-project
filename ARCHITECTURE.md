# Architecture

## Product slice

Ajaia Docs is intentionally a small collaborative editor rather than a Google Docs
clone. It prioritizes the end-to-end document lifecycle, formatting persistence,
file import, sharing intent, server-enforced access, and clear recovery states.

## Stack

| Layer         | Choice                  | Reason                                                   |
| ------------- | ----------------------- | -------------------------------------------------------- |
| Frontend      | React, Vite, TypeScript | Fast SPA development and deployment                      |
| UI            | Tailwind CSS, Lucide    | Custom visual system without a heavy component framework |
| Editor        | TipTap                  | ProseMirror-backed rich text with structured JSON output |
| State         | Zustand                 | Small persisted mocked-user identity store               |
| Backend       | Express, TypeScript     | Explicit HTTP and product-layer boundaries               |
| Database      | PostgreSQL, Drizzle     | Typed SQL-oriented models, JSONB, reviewable migrations  |
| Production DB | Neon                    | Serverless PostgreSQL integrated with Vercel             |
| Tests         | Vitest, Supertest       | Fast policy, parser, and HTTP verification               |

## System

```text
React SPA
  pages → components/hooks → services/api → Express
                                        routes
                                          ↓
                                     controllers
                                          ↓
                                       services
                                      ↙        ↘
                                  policies  repositories
                                                ↓
                                           PostgreSQL
```

The server—not the browser—enforces ownership and shared-editor access. Mocked
identity is sent through `x-user-id` and resolved to a seeded database user.

Production code stays under `backend/src`. Backend tests live separately under
`backend/tests`, split into `integration` for HTTP contracts and `unit` for pure
policy, parser, and validation behavior.

## Data model

- `users`: deterministic Alice, Bob, and Carol demo identities.
- `documents`: title, TipTap JSONB, content-schema version, owner, last editor,
  optimistic version, and timestamps.
- `document_shares`: composite-key grant from a document to an editor.

TipTap JSONB is canonical. It preserves nodes and marks without storing arbitrary HTML.
`content_schema_version` provides a migration path if supported nodes change.
`version` prevents silent overwrites across users or browser tabs.

Important invariants exist in PostgreSQL as well as Zod: foreign keys, composite and
unique keys, role/content checks, positive versions, and query-backed indexes.

## Key decisions

1. **Layer-first functional backend.** Routes, controllers, services, repositories,
   validators, policies, models, and errors have separate responsibilities. There are
   no class-based service layers or database calls from controllers.
2. **Thin client state.** Zustand persists only selected demo identity. Documents
   remain server state and are refetched, avoiding an unsynchronized client database.
3. **Autosave as a state machine.** Edits debounce, serialize writes, expose saved,
   unsaved, saving, error, and conflict states, and retain pending content on failure.
4. **One extension registry.** TipTap rendering and supported document structure are
   controlled centrally.
5. **Atomic import.** `.txt` and `.md` are bounded to 1 MB, parsed in memory, and create
   a document only after successful validation.
6. **One deployment.** Vite assets use Vercel's CDN; Express is a catch-all Vercel
   Function; Neon supplies `DATABASE_URL`.

## Deliberate cuts

- No production authentication, invitations, or password flows
- No CRDT/OT real-time collaboration or presence
- No comments, suggestions, version-history UI, or public links
- No `.docx`, PDF, images, tables, or attachments
- No viewer/commenter roles in the shipped UI

These cuts preserve time for editor usability, persistence, authorization, import,
error handling, tests, and delivery quality.

## Engineering invariants

- TipTap instances and autosave timers are cleaned up on unmount.
- Stale/in-flight saves cannot silently mark newer content saved.
- A collaborator can update content but cannot rename, delete, or share.
- Dashboard queries omit the full JSONB document body.
- Upload and JSON request sizes are bounded.
- Database credentials never enter Vite client variables.
- Applied migrations are immutable; later changes create new migrations.

## What another 2–4 hours would add

1. Playwright flows in CI against an isolated test PostgreSQL database.
2. Basic document-version snapshots using the existing optimistic version.
3. Viewer permission and read-only editor mode.
4. Presence indicators using a small realtime channel—without concurrent editing.
