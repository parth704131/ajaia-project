# Proposal — Ajaia Collaborative Docs

## Motivation

Teams need a lightweight place to create, format, reopen, import, and share working
documents. This take-home should demonstrate a complete product slice rather than a
wide imitation of Google Docs.

## Outcome

Deliver an attractive React and Express application where reviewers can switch among
mocked users, create and edit rich-text documents, import text/Markdown, and grant
another user edit access. Data and formatting persist in PostgreSQL locally and Neon
in production.

## Stack

- React 19, Vite, TypeScript, React Router
- Tailwind CSS and Lucide React with custom reusable UI components
- TipTap React editor with StarterKit and underline extension
- Express 5 and TypeScript
- PostgreSQL, Drizzle ORM/Kit, and Zod
- Local PostgreSQL for development; Neon PostgreSQL for Vercel production
- Vitest and Supertest

## Scope

- Mocked Alice/Bob/Carol identity switcher
- Owned and shared dashboard sections
- Create, rename, edit, save, reopen, and delete documents
- Bold, italic, underline, H1/H2, bullet/numbered lists, undo/redo
- Debounced autosave with retryable error feedback
- Optimistic document versions to detect conflicting saves
- Import `.txt` and `.md` files up to 1 MB as new documents
- Owner-managed grant/revoke editor access
- Server-side access enforcement
- Reproducible migrations and seed data
- Deployment configuration and required submission documentation

## Acceptance criteria

1. Alice can create, rename, format, autosave, leave, and reopen a document without
   losing content or formatting.
2. Alice can import supported text/Markdown and edit the resulting document.
3. Alice can share with Bob; Bob sees the document under "Shared with me" and can
   edit its content.
4. Bob cannot rename, delete, or manage Alice's document.
5. Carol cannot list or directly open an unshared document.
6. UI exposes distinct loading, empty, success, and recoverable error states.
7. Type-check, production build, policy/API tests, and browser smoke flow pass.
8. Vercel serves the Vite frontend and Express API, which persists to Neon.

## Non-goals

- Real authentication or email invitations
- Real-time editing, presence, comments, suggestions, or version history
- `.docx`, PDF, attachments, images, tables, or public links
- Viewer/commenter roles or ownership transfer
- Google Docs pixel parity
