# Submission

## Included

- React/Vite/TypeScript frontend
- Express/TypeScript REST API
- PostgreSQL Drizzle models, migration, and seed data
- TipTap rich-text editor with autosave and conflict feedback
- Mocked Alice/Bob/Carol user switching
- Owner/shared dashboard distinction
- Owner-controlled editor sharing and revocation
- `.txt` and `.md` import (1 MB maximum)
- Automated tests
- Vercel and Neon deployment configuration
- `README.md`, `ARCHITECTURE.md`, and `AI_WORKFLOW.md`
- Walkthrough placeholder in `WALKTHROUGH_URL.txt`

## Reviewer flow

1. Start as Alice and create a document.
2. Add formatting and wait for the Saved indicator.
3. Share the document with Bob.
4. Switch to Bob and open it under Shared with you.
5. Edit content, then switch back to Alice to see the saved update.
6. Switch to Carol to verify the document is not listed.
7. Import a `.txt` or `.md` file from the dashboard.

## Demo identities

No passwords are required. Use the header selector:

- Alice Johnson — owner flow
- Bob Smith — shared-editor flow
- Carol Williams — denied/unshared flow

## Links

- Live product: `ADD_VERCEL_URL`
- Walkthrough: `ADD_VIDEO_URL`
- Source repository: `ADD_GITHUB_URL`
- Google Drive folder: `ADD_GOOGLE_DRIVE_URL`

## Current limitations

- Authentication is intentionally mocked and must not be treated as production auth.
- Sharing grants editor access only.
- Editing is persistent but not realtime/multi-cursor.
- `.docx`, PDF, images, tables, comments, and version-history UI are out of scope.
- Final visual browser QA and links above must be completed before submission.
- `npm audit --omit=dev` is clean. Drizzle Kit currently carries four moderate
  development-only transitive advisories; no migration tooling is exposed in runtime.
