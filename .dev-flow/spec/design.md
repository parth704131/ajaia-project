# Design — Ajaia Collaborative Docs

## System shape

```text
Browser
  React dashboard/editor/dialogs
  TipTap document model
        |
        | /api REST + x-user-id
        v
Express application (one Vercel Function in production)
  request identity -> validation -> policy -> repository
        |
        v
PostgreSQL
  local instance in development / Neon in production
```

The production Vite build is a static Vercel output. Express is exported as a Vercel
Function and does not attempt to serve files using `express.static`.

## Frontend design

### Routes

- `/`: workspace dashboard with user switcher, create/import actions, owned cards,
  shared cards, empty states, skeletons, and retryable load errors.
- `/documents/:documentId`: editor with back navigation, inline title, save status,
  toolbar, centered document page, access badge, and owner-only Share button.

### Modules

- `src/services/api`: fetch wrapper and normalized `ApiError`.
- `src/state/store`: Zustand stores; selected seeded user is persisted.
- `src/ui`: Button, Dialog, Menu, Input, Toast, Skeleton, EmptyState.
- `src/components/documents`: dashboard cards and create/import interactions.
- `src/components/editor`: TipTap extensions, toolbar, and editor surface.
- `src/components/sharing`: collaborators and grant/revoke dialog.
- `src/hooks`: reusable async and autosave lifecycle behavior.
- `src/types`: API and editor types.

### Visual system

- Warm off-white workspace background and white paper surface.
- Deep ink text, restrained emerald brand color, and subtle borders/shadows.
- Inter/system typography with high-contrast editor content.
- 8 px spacing rhythm, rounded controls, strong focus rings, and 44 px primary targets.
- Purposeful hover/pressed/disabled states and lightweight transitions.
- Desktop-first editor with responsive dashboard and wrapping toolbar.
- No generic component-library skin; Tailwind utilities support custom components.

### Editor model

One `editorExtensions.ts` registry defines StarterKit behavior and Underline. Content is
read/written as TipTap JSON. The initial document is:

```json
{ "type": "doc", "content": [{ "type": "paragraph" }] }
```

Autosave waits 800 ms after an update. Each save gets a monotonically increasing
sequence number; only the newest completion may change UI status. Failed saves retain
the editor content and expose Retry. The hook clears timers and aborts stale requests
on unmount, with a best-effort `keepalive` flush for pending content.

## Backend design

### Layers

- Feature routes declare paths and middleware only.
- Controllers translate HTTP input/output and contain no database queries.
- Zod schemas validate headers, params, JSON bodies, and import metadata.
- `currentUser` middleware resolves `x-user-id` to a seeded database user.
- Document policy returns `owner`, `editor`, or denied.
- Services implement use cases and coordinate policy, transactions, and repositories.
- Functional Drizzle repositories own database queries and contain no HTTP behavior.
- Final error middleware returns `{ error: { code, message, details? } }`.

The dependency direction is route → controller → service → repository → database,
with services calling centralized policies. Each layer has a separate top-level
folder. Controllers, services, and repositories use named functions rather than
classes.

### Backend structure

```text
backend/src/
├── app.ts
├── server.ts
├── db/
│   ├── client.ts
│   ├── content.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── document.model.ts
│   │   ├── document-share.model.ts
│   │   └── index.ts
│   └── seed.ts
├── errors/
├── middleware/
├── controllers/
├── services/
├── repositories/
├── routes/
├── validators/
├── parsers/
├── types/
└── policies/

backend/tests/
├── integration/
└── unit/
    ├── parsers/
    ├── policies/
    └── validators/
```

React is the view layer, so the overall system follows MVC responsibilities while the
Express API uses functional controller/service/repository layering expected for a
separate SPA frontend.

### API

| Method | Path | Access | Behavior |
| --- | --- | --- | --- |
| GET | `/api/users` | Any valid user | List seeded users |
| GET | `/api/documents` | User | Owned and shared lists |
| POST | `/api/documents` | User | Create empty document |
| GET | `/api/documents/:id` | Owner/editor | Load document and access |
| PATCH | `/api/documents/:id` | Depends on field | Owner title; owner/editor content |
| DELETE | `/api/documents/:id` | Owner | Delete document |
| POST | `/api/documents/:id/shares` | Owner | Grant editor access |
| DELETE | `/api/documents/:id/shares/:userId` | Owner | Revoke access |
| POST | `/api/import` | User | Validate and create imported document |

Content and title may use separate endpoints internally if that produces clearer
authorization; the external behavior remains as specified.

### Database schema

- `users`: UUID PK, name, unique email, timestamps.
- `documents`: UUID PK, title varchar(120), content JSONB, content-schema version,
  owner FK, updated-by FK, optimistic-lock version, created/updated timestamps.
- `document_shares`: document FK, user FK, role enum/text, created timestamp,
  composite primary key.
- Foreign keys cascade share deletion with a document and prevent orphan identities.
- Content-schema versions provide an explicit migration path if supported TipTap nodes
  change. Optimistic versions prevent silent overwrites across users or browser tabs.
- One index supports owned documents ordered by update time; another supports shared
  lookups by user. No speculative index is created for `updated_by` until a real query
  requires it.

Migrations are generated SQL committed under `backend/drizzle`. Seed logic uses fixed
UUIDs/upserts so rerunning it is safe. Local and Neon databases apply identical files.

### File import

Multipart upload accepts `.txt` and `.md`, maximum 1 MB. Server validation checks
extension, MIME where meaningful, actual byte size, and UTF-8 text. Markdown is parsed
into TipTap-compatible content using the same supported editor schema. A parse failure
creates no document. The filename (sanitized and extension removed) becomes the title.

## Vercel deployment

- Vite output is deployed as static assets/CDN content.
- Express is exported as a single Vercel Function under the supported entry point.
- `/api/*` routes to the Express function; client routes fall back to `index.html`.
- Neon marketplace integration injects production `DATABASE_URL`.
- A pooled/serverless-safe Neon connection is used in production.
- Migrations are an explicit release/setup step, not run concurrently on every cold
  start.

## Alternatives considered

- Prisma: strong tooling but more generated/runtime workflow than this small project
  needs; current major-version churn adds timebox risk.
- SQLite: quickest locally but mismatched with stateless Vercel deployment.
- Supabase: valid hosted PostgreSQL choice, but Neon has the more direct Vercel-native
  serverless integration for this deployment.
- Lexical/Slate: capable editors; TipTap reaches the required document behavior faster
  and has direct structured JSON output.
- Real auth: assignment permits mocks; implementing passwords would reduce time for
  editor quality and introduce avoidable security scope.

## Risks

- Serverless database connection exhaustion: use Neon serverless/pooled connection and
  avoid unbounded per-request pools.
- Autosave races: sequence requests and ignore stale completion states.
- Content/schema mismatch: centralize extensions and validate top-level TipTap shape.
- Markdown fidelity: document supported subset; test headings, emphasis, and lists.
- Vercel client routing: verify direct navigation to editor URLs after deployment.
- Time pressure: cut delete first, then Markdown fidelity enhancements; never cut core
  persistence, sharing enforcement, or error states.

## Engineering invariants

### Resource lifecycle and cleanup

- TipTap editor instances are destroyed on unmount.
- Autosave timers and abort controllers are cleaned up.
- File buffers are bounded and released after request completion.
- Database clients follow the selected driver's serverless lifecycle guidance.

### Async coordination, cancellation, races, and stale work

- Route loads abort when navigation changes.
- Autosave sequence IDs prevent stale status updates.
- Buttons prevent duplicate create/share/import submissions.
- Database constraints remain the final defense against duplicate shares.

### Error and empty-state recovery UX

- Dashboard load errors provide Retry.
- Editor load exposes distinct denied and missing states.
- Autosave failures keep local changes and provide Retry.
- Empty owned/shared sections explain their next action.
- Import errors identify allowed types and size.

### Performance

- Dashboard returns only card fields, not full document JSON.
- Content is fetched only when an editor opens.
- Autosave is debounced and request bodies are capped.
- Database list queries use indexes and avoid N+1 collaborator lookups.

### Security and privacy

- Mocked identity is clearly documented as demonstration-only.
- The server verifies identity and authorization for every protected operation.
- No database credential is exposed through Vite client environment variables.
- Zod and upload limits constrain untrusted input.
- Raw HTML is not stored or rendered as the canonical document format.
- Error responses do not include database internals or document content.
