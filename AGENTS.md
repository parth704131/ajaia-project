# Ajaia Docs Engineering Guidelines

## Quality bar

Write production-oriented TypeScript at the standard expected from a senior product
engineer. Prefer clear boundaries, explicit types, small cohesive functions, and
actionable failures over shortcuts that only satisfy the happy path.

## Backend architecture

Use a classic layer-first MVC structure:

- Routes declare paths and middleware only.
- Controllers translate HTTP requests and responses; they contain no database logic.
- Services implement use cases, transactions, authorization coordination, and domain
  decisions; they contain no Express request/response objects.
- Repositories contain Drizzle queries only; they contain no HTTP behavior.
- Policies centralize authorization rules.
- Validation schemas parse all untrusted boundary input with Zod.
- Error middleware is the single HTTP error translator.
- Database models (`*.model.ts`), client, migrations, and seed scripts remain
  infrastructure concerns.

Keep controllers, services, repositories, routes, validators, middleware, policies,
and database models in separate top-level folders. Do not co-locate these layers in
feature/module folders.

Dependency direction must remain:

```text
route -> controller -> service -> repository -> database
                     -> policy
```

Do not bypass a layer for convenience. Avoid generic `utils` dumping grounds and
avoid duplicating repository queries or authorization checks.

Use modern functional TypeScript modules. Do not implement controllers, services, or
repositories as classes. Export named functions and use small factory functions only
when dependency injection is needed for tests.

## Frontend architecture

Use a layer-first React structure consistent with the project's larger frontend
reference:

- Pages own route-level composition and loading/error behavior.
- Components own product interactions and remain grouped by domain where useful.
- Reusable UI primitives live under `ui/` and contain presentation behavior only.
- API clients live under `services/api/` and own HTTP details and normalized errors.
- Zustand stores live under `state/store/`; persist only genuine local preferences or
  identity selection, not duplicated server data without a cache policy.
- Hooks own reusable stateful behavior and lifecycle cleanup.
- Shared application types live under `types/`.
- TipTap extensions live in one registry.

Components should distinguish loading, empty, success, and error states. Async effects
must clean up timers, listeners, requests, and editor instances. Do not hide failures.

## Database and migrations

- Treat committed migrations as immutable history.
- Define every PostgreSQL table in a dedicated Drizzle `*.model.ts` file and export
  inferred select/insert types beside it.
- One initial migration file for the first schema is expected and atomic.
- Every later schema change receives a new migration; never rewrite an applied
  migration.
- Review generated SQL before applying it.
- Keep seed scripts idempotent and deterministic.
- Enforce important invariants with foreign keys, unique keys, checks, and indexes in
  addition to application validation.

## Code conventions

- Use descriptive domain names and guard clauses.
- Keep functions focused and avoid deeply nested control flow.
- Do not use `any`; narrow `unknown` deliberately.
- Do not silently catch errors.
- Keep transport DTOs separate from database row types when their responsibilities
  differ.
- Add comments only when they explain a non-obvious decision, invariant, or tradeoff.
- Reuse established components and helpers before creating new ones.
- Keep unrelated refactors out of feature changes.

## Verification

- Test services/policies for business and authorization behavior.
- Test controllers/routes through Supertest for HTTP contracts.
- Test repositories against PostgreSQL where meaningful.
- Run type-check, tests, build, and relevant browser flows before completion.
