# Ajaia Docs

An intentionally scoped collaborative document editor built with React, Express,
TipTap, and PostgreSQL.

## Features

- Create, rename, edit, save, reopen, and delete documents
- Bold, italic, underline, headings, bullet/numbered lists, undo, and redo
- Debounced autosave with visible saved, error, retry, and conflict states
- Mocked Alice/Bob/Carol identity switcher
- Owner-controlled sharing and revocation
- Clear Owned by you and Shared with you dashboard sections
- `.txt` and `.md` import as editable documents (maximum 1 MB)
- PostgreSQL persistence for TipTap JSON and permissions

## Requirements

- Node.js 24 or newer
- npm 11 or newer
- PostgreSQL 15 or newer

## Local setup

```bash
git clone <repository-url>
cd ajaia-project
npm install
createdb ajaia_docs
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

Default local configuration:

```env
DATABASE_URL=postgresql://YOUR_POSTGRES_USER@localhost:5432/ajaia_docs
PORT=3002
```

Update `YOUR_POSTGRES_USER` for your machine. Add a password to the URL if your local
PostgreSQL requires one.

Open:

- Frontend: <http://localhost:5173>
- API health: <http://localhost:3002/api/health>

If port 5173 is occupied, Vite prints the next available URL. Port 3002 is used to
avoid the common 3001 conflict in the review environment.

## Demo users

The product uses mocked authentication, which the assignment permits. Select a user
from the header:

| User           | Intended demonstration  |
| -------------- | ----------------------- |
| Alice Johnson  | Owner/create/share flow |
| Bob Smith      | Shared-editor flow      |
| Carol Williams | Unshared/denied flow    |

The browser sends the selected seeded user ID as `x-user-id`; Express still resolves
the user and enforces authorization on every protected operation. This is not
production authentication.

## Import support

- `.txt`: each line becomes an editable paragraph
- `.md`: headings, paragraphs, bold, italic, lists, blockquotes, code, and horizontal
  rules are normalized to the supported TipTap structure
- Maximum file size: 1 MB
- Empty, oversized, or unsupported files return an actionable error

`.docx`, PDF, images, and attachments are intentionally out of scope.

## Commands

| Command               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Run frontend and backend                 |
| `npm run typecheck`   | Type-check both workspaces               |
| `npm run build`       | Create both production builds            |
| `npm test`            | Run automated tests                      |
| `npm run db:generate` | Generate a migration after model changes |
| `npm run db:migrate`  | Apply committed migrations               |
| `npm run db:seed`     | Idempotently seed demo users             |

## Database workflow

Table models live under `backend/src/db/models`. Migration files are immutable
change-set history under `backend/drizzle`.

When changing a model:

```bash
npm run db:generate -- --name=describe_change
# Review generated SQL
npm run db:migrate
```

Never edit a migration that has already been applied.

## Deploy to Vercel with Neon

1. Push the repository to GitHub and import it as one Vercel project with repository
   root as the Root Directory.
2. Install Neon from the Vercel Marketplace and connect it to the project. Vercel
   injects `DATABASE_URL`.
3. Apply migrations and seed once against the Neon connection:

   ```bash
   DATABASE_URL="<neon-direct-or-pooled-url>" npm run db:migrate
   DATABASE_URL="<neon-direct-or-pooled-url>" npm run db:seed
   ```

4. Deploy. `vercel.json` builds the Vite SPA, preserves deep links, and deploys the
   Express API as a catch-all Node.js Function.
5. Verify `/api/health`, create/reopen, sharing, direct editor URL navigation, and
   import on the preview URL before promoting it.

Use a pooled Neon URL for function runtime traffic. Keep database credentials in
Vercel environment variables—never in `VITE_*` variables or source control.

## Project structure

```text
frontend/src/
  components/  hooks/  pages/  services/api/  state/store/  types/

backend/src/
  controllers/  services/  repositories/  routes/  validators/
  policies/  middleware/  errors/  parsers/  db/models/

backend/tests/
  integration/  unit/parsers/  unit/policies/  unit/validators/
```

Backend dependency direction:

```text
route → controller → service → repository → PostgreSQL
                    ↘ policy
```

See [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_WORKFLOW.md](./AI_WORKFLOW.md), and
[SUBMISSION.md](./SUBMISSION.md) for decisions and reviewer notes.
