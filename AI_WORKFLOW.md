# AI Workflow Note

## Tools used

I used OpenAI Codex as a coding and architecture collaborator, along with targeted
official-documentation research for Vercel, Neon, Drizzle, and editor decisions. Git,
TypeScript, Vitest, Supertest, PostgreSQL tools, and HTTP smoke tests provided the
verification loop.

## Where AI materially accelerated the work

- Converted an ambiguous prompt into testable flows, scope cuts, and a phased spec.
- Compared persistence, ORM, editor, and deployment options against the timebox.
- Scaffolded the React/Express workspace and layered implementation.
- Generated first-pass validation, authorization, parser, autosave, and UI code.
- Kept architecture, implementation tasks, and required deliverables synchronized.

## Output changed or rejected

- Rejected real authentication because the assignment explicitly allows mocked users
  and password storage would add security scope without strengthening the core demo.
- Rejected speculative `.docx`, tables, images, comments, and realtime editing.
- Reworked an initially feature-co-located backend into the requested layer-first,
  functional structure.
- Replaced React Context with a small persisted Zustand identity store after reviewing
  conventions in a larger production frontend.
- Renamed Drizzle's random migration name to `initial_schema`.
- Removed a speculative `updated_by` index and strengthened the JSONB database check
  after reviewing the generated SQL rather than accepting it blindly.
- Split route bundles after the production build exposed an oversized initial chunk.

## Verification

- Reviewed every generated migration statement before applying it.
- Applied and inspected the local schema and deterministic seed users.
- Ran strict TypeScript checks and production builds across both workspaces.
- Added policy and import-parser tests plus the API health contract.
- Ran an HTTP smoke flow covering owner create/save/share, shared-editor read,
  unshared-user denial, and cleanup.
- Confirmed `npm audit --omit=dev` reports zero runtime vulnerabilities. Four moderate
  advisories remain inside Drizzle Kit's local development chain; the offered fix is
  an incompatible downgrade, so it was not forced.
- Attempted in-app browser verification; no browser surface was connected in the
  environment, so visual interaction remains a clearly reported manual checkpoint.

AI accelerated execution, but architecture choices, scope, SQL changes, and acceptance
decisions were reviewed explicitly rather than accepted from generated output.
