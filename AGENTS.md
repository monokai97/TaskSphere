# task-sphere — Payload CMS 3.0 + Next.js 16

## Stack
- **Payload CMS 3.85.1** with SQLite (`@payloadcms/db-sqlite`), Lexical editor, Sharp for media
- **Next.js 16** (App Router), React 19
- **pnpm 9–10** with `legacy-peer-deps=true` (see `.npmrc`)

## Commands
| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build (adds `--max-old-space-size=8000`) |
| `pnpm lint` | ESLint (next/core-web-vitals + next/typescript) |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` from config |
| `pnpm generate:importmap` | Regenerate `src/app/(payload)/admin/importMap.js` |
| `pnpm test:int` | Vitest integration tests (`tests/int/**/*.int.spec.ts`) |
| `pnpm test:e2e` | Playwright e2e (`tests/e2e/**/*.e2e.spec.ts`) — auto-starts dev server |
| `pnpm test` | Integration then e2e |

All commands use `cross-env NODE_OPTIONS=--no-deprecation`. The `devsafe` script (`rm -rf .next`) is Unix-only; use `pnpm dev` directly or delete `.next` manually on Windows.

## Architecture
- **Route groups**: `(frontend)/` for public pages, `(payload)/` for admin + API
- **Collections** (`src/collections/`): `Users` (auth-enabled) and `Media` (uploads)
- **Config**: `src/payload.config.ts` uses SQLite — **not** MongoDB despite `.env.example` and README suggesting otherwise
- **Payload config is async**: import it as `const payloadConfig = await config` before using with `getPayload()`
- **Path aliases** (tsconfig): `@/*` → `./src/*`, `@payload-config` → `./src/payload.config.ts`
- **Import style**: ESM (`"type": "module"`). Relative imports use `.js` extension in source files (e.g., `from '../../src/payload.config.js'`)

## Generated files (do not edit)
- `src/payload-types.ts` — re-run with `pnpm generate:types`
- `src/payload-generated-schema.ts`
- `src/app/(payload)/admin/importMap.js` — re-run with `pnpm generate:importmap`

These are also ignored by ESLint under `ignores`.

## Code style
- Prettier: `singleQuote`, `noSemi`, `trailingComma: "all"`, `printWidth: 100` — no format script exists
- ESLint TS rules set to `warn` (not error): `no-explicit-any`, `no-unused-vars`, `ban-ts-comment`, `no-empty-object-type`
- Unused vars prefixed `_` (args) or `_` (vars), `caughtErrorsIgnorePattern: '^(_|ignore)'`

## Testing
- **Integration** (`tests/int/`): vitest + jsdom, files must match `*.int.spec.ts`
- **E2E** (`tests/e2e/`): Playwright with Chromium, files must match `*.e2e.spec.ts`
- **Helpers** at `tests/helpers/`: `seedUser.ts` (creates `dev@payloadcms.com / test`) and `login.ts` (admin login via Playwright)
- Int tests import Payload config via `@/payload.config`; seedUser uses relative `.js` path
- `test.env` sets `NODE_OPTIONS="--no-deprecation --no-experimental-strip-types"`

## Environment
- `.env` uses SQLite: `DATABASE_URL=file:./task-sphere.db`
- `.env.example` shows MongoDB format (not actually used)
- `PAYLOAD_SECRET` is required; `.env` is checked in (no `.env*.local` gitignored except `.env*.local`)

## Docker
- `docker-compose.yml`: dev setup with mongo container + payload service (uses `corepack`)
- `Dockerfile`: production multi-stage build with Node 22 (requires `output: 'standalone'` in next.config)
