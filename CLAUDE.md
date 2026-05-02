# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent Node projects, no root-level package.json:

- `server/` — Express 5 + Mongoose API (CommonJS)
- `frontend/` — React 19 + Vite SPA (ESM)

Each has its own `package.json` and `node_modules`. Run commands from inside the respective directory.

## Commands

Backend (`cd server`):
- `node index.js` — start API (defaults to port 3005)
- `npx nodemon index.js` — dev with reload (nodemon is a devDependency; no `dev` script defined)
- No test runner configured.

Frontend (`cd frontend`):
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint over the project
- `npm run preview` — preview built bundle

## Required environment

`server/.env` must define:
- `MONGO_KEY` — MongoDB connection string (used by `server/config/db.js`)
- `JWT_SECRET` — signing secret for auth tokens (used by `server/middleware/auth.js` and `server/routes/auth.js`)
- `PORT` — optional, defaults to 3005

The frontend hard-codes `BASE_URL = 'http://localhost:3005/api'` in `frontend/src/api/client.js`. If the backend port changes, update it there.

## Architecture

### Backend request flow
`index.js` → `app.js` mounts three routers under `/api/auth`, `/api/todos`, `/api/analytics`. Each protected route uses two middleware layers:

1. `middleware/auth.js` — reads `Authorization: Bearer <jwt>`, verifies with `JWT_SECRET`, sets `req.userId`.
2. `middleware/validate.js` — generic Zod validator: `validate(schema)` returns middleware that runs `schema.safeParse(req.body)` and 400s on failure. Schemas live in `server/schemas/`.

All Mongo queries scope by `req.userId` — there is no admin/global access path. The `Todo` model includes a `completedAt` timestamp that is set/cleared in the PATCH route based on the `done` toggle; this field is what powers the analytics aggregations.

### Analytics
`routes/analytics.js` accepts `?days=N&tz=<IANA tz>` and returns `{ dailySeries: [{ date, created, completed }], windowDays, totalTodos, completedTodos, completionRate, currentStreak }`. Two parallel aggregations bucket by `createdAt` and `completedAt`; the result is zero-filled across every day in the window so the area chart renders continuously.

**Timezone is load-bearing.** Bucket keys are generated with `Intl.DateTimeFormat('en-CA', { timeZone })` (yields `YYYY-MM-DD` in the user's local calendar) and the same `timezone` is passed to `$dateToString` in every aggregation, including the streak calc. The `$gte` lower bound is set to `firstKey - 24h` in UTC so events near tz boundaries aren't excluded. If you change the bucketing math, keep both sides — server key generation and `$dateToString` — using the same tz, or new todos created during local daytime will silently fall outside the map and disappear from the chart.

The frontend (`useAnalytics.js`) sends `Intl.DateTimeFormat().resolvedOptions().timeZone` automatically and includes `tz` in the React Query key so users with different system clocks don't share a cache entry. The chart's date formatters use `timeZone: 'UTC'` when rendering the `YYYY-MM-DD` strings, otherwise users west of UTC would see labels shift back a day.

When mutating todos on the frontend, invalidate both `['todos']` and `['analytics']` query keys — `useCreateTodo`, `useUpdateTodo`, and `useDeleteTodo` all do this so the chart and stat cards stay in sync. Prefix-style invalidation (`['analytics']`) matches all `{ days, tz }` cache variants.

### Frontend state model
Three layers, kept deliberately separate:

- **Server state** — TanStack Query, accessed via hooks in `src/hooks/` (`useTodos.js`, `useAnalytics.js`). Query keys are centralized in `todoKeys` objects within those files.
- **Auth state** — Zustand store `useAuthStore` with `persist` middleware (localStorage key `auth-store`). Holds `token` and `user`.
- **UI state** — Zustand store `useUIStore` for filters, dark mode, etc. (non-persisted).

`src/api/client.js` is the single fetch wrapper. It pulls the token from `useAuthStore.getState()` (not from a hook, so it works outside React) and on 401 calls `logout()` and throws — components don't need to handle session expiry individually. The `api.{get,post,patch,delete}` helpers JSON-stringify object bodies automatically.

### Routing & auth gating
`App.jsx` defines `/login`, `/signup`, `/dashboard` (wrapped in `ProtectedRoute`), and a catch-all redirect to `/dashboard`. `ProtectedRoute` checks `useAuthStore` for a token. Dark mode is applied by toggling the `dark` class on `<html>` in an effect driven by `useUIStore`.

### UI stack
- Tailwind v4 via `@tailwindcss/vite` (no tailwind.config; configured in CSS).
- shadcn/ui components in `src/components/ui/` (config in `frontend/components.json`, style `radix-nova`, base color `neutral`).
- Path alias `@/` → `frontend/src/` (configured in both `vite.config.js` and `jsconfig.json`).
- Charts use `recharts`; icons use `lucide-react`.

### Analytics chart component
`AnalyticsChart.jsx` is an `AreaChart` with two overlaid series — `created` (lighter, "Total Todos") and `completed` (darker) — both gradient-filled from `var(--primary)`. Local component state holds the time range; a shadcn `Select` in the card header offers Last 7 days / Last 30 days / Last 3 months and feeds the value into `useAnalytics(days)`. The legend is rendered as plain JSX below the `ResponsiveContainer` (not Recharts' `<Legend>`) so the swatches can mirror the gradient opacities exactly.

Use `var(--primary)` (and the other shadcn vars) directly in chart props, not `hsl(var(--primary))` — the design tokens are stored as full `oklch(...)` values, so the nested `hsl()` form is invalid CSS and silently falls back.

## Conventions worth knowing

- Server uses CommonJS (`require`/`module.exports`); frontend uses ESM. Don't mix.
- Mongoose model is registered as `'todos'` (plural, lowercased) — `mongoose.model('todos', Todo)` in `models/Todo.js`.
- The `findOneAndUpdate` call in `routes/todos.js` uses `returnDocument: 'after'` (not the deprecated `new: true`).
- `server/package.json` lists a bogus `experss` dependency alongside `express` — leave it alone unless cleaning up; only `express` is actually required.
- `index.css` carries a legacy theme layer (`--text`, `--text-h`, `--bg`, etc.) that pre-dates shadcn's tokens. The `h1, h2` rule deliberately does **not** set `color` — headings inherit `text-foreground` from the App container so the `.dark` class toggle works regardless of OS `prefers-color-scheme`. Don't reintroduce `color: var(--text-h)` on those tags or the in-app theme toggle will desync from what the user sees.
