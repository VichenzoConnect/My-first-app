# Parrot Translator 🦜

A fun, parrot-themed multilingual translator with text input, voice support, translation history, favorites, Chaos Mode, and a phrase of the day — built for coding contests.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/parrot-translator run dev` — run the frontend (port 23065)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Translation: LibreTranslate (free, open-source API with multiple mirrors)
- Voice: Web Speech API (speech-to-text) + Speech Synthesis API (text-to-speech)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/history.ts` — translation history table
- `lib/db/src/schema/favorites.ts` — favorites table
- `artifacts/api-server/src/routes/translate.ts` — translation + detect routes (LibreTranslate proxy)
- `artifacts/api-server/src/routes/history.ts` — history CRUD routes
- `artifacts/api-server/src/routes/favorites.ts` — favorites CRUD routes
- `artifacts/api-server/src/routes/phrase.ts` — phrase of the day route
- `artifacts/parrot-translator/src/` — React frontend (pages, components, hooks)

## Architecture decisions

- LibreTranslate is called server-side to avoid CORS issues; multiple public mirrors are tried in sequence with a fallback mock response if all fail.
- Phrase of the day is deterministic by day-of-year (no external API needed), cycling through 13 curated phrases covering all supported languages.
- Voice features (speech-to-text, text-to-speech) use browser-native APIs — zero cost, zero API keys.
- Chaos Mode is entirely client-side using keyword matching and a response lookup table.
- Translation history is saved to the DB after each successful translation; limited to 100 most recent.

## Product

- Landing page with animated parrot mascot, feature showcase, and supported languages
- Main translator with 13 languages, auto-detect, swap button, character counter
- Voice input (microphone) and voice output (speak translation)
- Chaos Mode 🦜 — meme-heavy funny parrot responses alongside real translations
- Translation history panel with delete
- Favorites panel with save/remove
- Phrase of the Day featuring all supported languages

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- LibreTranslate public mirrors may rate-limit or be slow; the fallback gracefully shows a message rather than crashing.
- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`, then run `pnpm run typecheck:libs` to rebuild the db lib if schema changed.
- The `@workspace/db` lib must be rebuilt (`pnpm run typecheck:libs`) before the API server can typecheck when new tables are added.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
