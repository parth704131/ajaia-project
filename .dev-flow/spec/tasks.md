# Implementation Tasks — Ajaia Collaborative Docs

- [x] 1. Normalize scaffold and dependencies
  - Add Tailwind, React Router, Lucide, TipTap, Zod, Drizzle, PostgreSQL driver,
    multipart/Markdown parsing, and test dependencies.
  - Add environment examples and preserve the port-3002 local configuration.
  - Verify workspace type-check/build/test baseline.

- [x] 2. Implement database foundation
  - Define users, documents, and document-shares schema and indexes.
  - Include content-schema and optimistic-lock versions in documents.
  - Configure Drizzle for local PostgreSQL and Neon `DATABASE_URL`.
  - Generate/review initial migration and add idempotent Alice/Bob/Carol seed.
  - Add database scripts and setup documentation.

- [x] 3. Implement Express foundations
  - Add env validation, async error flow, consistent error envelope, request limits,
    and current-user middleware.
  - Add database repositories and centralized document policy.
  - Test owner, editor, denied, and missing-document decisions.

- [x] 4. Implement document API
  - Add user/document list, create, load, rename/content update, and delete routes.
  - Validate all inputs and keep dashboard projections lightweight.
  - Add Supertest coverage for CRUD and authorization failures.

- [x] 5. Implement sharing and import API
  - Add grant/revoke endpoints with owner-only enforcement and duplicate guards.
  - Add bounded `.txt`/`.md` import conversion with atomic document creation.
  - Test successful sharing, denied management, duplicate sharing, supported import,
    and invalid file failures.

- [x] 6. Build visual foundation and routing
  - Configure Tailwind tokens/global styles and reusable UI primitives.
  - Add React Router, current-user context, typed API client, toast system, and shell.
  - Ensure keyboard focus, labels, contrast, and responsive behavior.

- [x] 7. Build dashboard
  - Add header/user switcher, welcome area, create/import actions, owned/shared cards,
    skeletons, empty states, retry errors, and delete confirmation.
  - Verify user switch persists and document lists refresh after mutations.

- [x] 8. Build editor
  - Add centralized TipTap extensions, toolbar, paper surface, inline title, access
    badge, and navigation.
  - Add race-safe autosave, status states, retry, lifecycle cleanup, and pending flush.
  - Verify formatting survives refresh/reopen.

- [x] 9. Build sharing UI
  - Add owner-only Share button/dialog, eligible-user selection, collaborator list,
    grant/revoke pending/error states, and shared-editor explanatory copy.
  - Verify Alice/Bob/Carol end-to-end access behavior.

- [ ] 10. Configure Vercel and harden verification (in progress)
  - Add Express function export, Vite output/routing configuration, Neon environment
    documentation, and migration release instructions.
  - Run type-check, build, targeted tests, full tests, and browser smoke scenarios.

- [ ] 11. Produce deliverables
  - Complete README, ARCHITECTURE.md, AI_WORKFLOW.md, SUBMISSION.md, walkthrough URL
    placeholder, demo script, reviewer credentials/instructions, and known gaps.
  - Capture polished screenshots after browser verification.
