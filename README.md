# Todo Application

A full-stack todo app with priority-based task management, a productivity dashboard, and timezone-aware analytics. Built with React 19, Express 5, and MongoDB.

---

## Highlights

- **JWT auth** — signup, login, and protected routes with bearer-token sessions persisted across reloads.
- **Smart todos** — title, description, three priority levels (low/medium/high), and a `done` toggle that records `completedAt` so analytics knows *when* work was finished.
- **Dashboard** — live progress bar, status + priority filters, and inline edit/delete.
- **Analytics that actually work** — an area chart of todos created vs. completed each day, completion rate, and a current-streak counter. Bucketing is done in the user's timezone, so a todo added at noon shows up in *today's* column, not a UTC neighbor.
- **Light & dark mode** — class-based theme toggle that survives reloads.
- **Polished UI** — shadcn/ui (Radix primitives) on Tailwind v4, with Recharts for visualizations and lucide-react icons.

---

## Tech stack

| Layer | Tools |
|-------|-------|
| Frontend | React 19, Vite 8, React Router 7, TanStack Query 5, Zustand 5, Tailwind 4, shadcn/ui, Recharts, lucide-react |
| Backend | Express 5, Mongoose 9, Zod 4, jsonwebtoken, bcryptjs, dotenv, cors |
| Database | MongoDB |

---

## Project layout

```
Todo_application/
├── frontend/          # React + Vite SPA (ESM)
│   └── src/
│       ├── api/       # fetch wrapper with auth + 401 handling
│       ├── components/ # AddTodo, TodoList, AnalyticsChart, … + shadcn/ui
│       ├── hooks/     # useTodos, useAnalytics (TanStack Query)
│       ├── pages/     # LoginPage, SignupPage, DashboardPage
│       └── stores/    # Zustand: useAuthStore (persisted), useUIStore
└── server/            # Express + Mongoose API (CommonJS)
    ├── config/        # Mongo connection
    ├── middleware/    # auth (JWT), validate (Zod)
    ├── models/        # User, Todo
    ├── routes/        # auth, todos, analytics
    └── schemas/       # Zod request schemas
```

The two projects are independent — each has its own `package.json` and `node_modules`.

---

## Getting started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — Atlas connection string or local instance

### 1. Clone & install

```bash
git clone <your-repo-url>
cd Todo_application

# install both projects
(cd server && npm install)
(cd frontend && npm install)
```

### 2. Configure environment

Create `server/.env`:

```bash
MONGO_KEY=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-string
PORT=3005
```

> The frontend points at `http://localhost:3005/api` (hard-coded in `frontend/src/api/client.js`). If you change `PORT`, update that constant too.

### 3. Run

In two terminals:

```bash
# terminal 1 — API
cd server
npx nodemon index.js     # or: node index.js

# terminal 2 — UI
cd frontend
npm run dev
```

Open the printed Vite URL (usually `http://localhost:5173`).

---

## Scripts

**Frontend** (`cd frontend`):

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Serve the built bundle |
| `npm run lint` | ESLint over the project |

**Backend** (`cd server`):

| Command | Purpose |
|---------|---------|
| `node index.js` | Start the API |
| `npx nodemon index.js` | Dev mode with auto-reload |

---

## API

All `/api/todos` and `/api/analytics` routes require an `Authorization: Bearer <jwt>` header.

| Method | Route | Body / Query | Description |
|--------|-------|--------------|-------------|
| POST | `/api/auth/signup` | `{ username, email, password }` | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| GET | `/api/todos` | `?status=completed\|active`, `?priority=low\|medium\|high` | List the current user's todos |
| POST | `/api/todos` | `{ title, description?, priority? }` | Create a todo |
| PATCH | `/api/todos/:id` | partial fields, including `done` | Update; toggling `done` sets/clears `completedAt` |
| DELETE | `/api/todos/:id` | — | Delete a todo |
| GET | `/api/analytics` | `?days=7\|30\|90`, `?tz=<IANA timezone>` | `dailySeries`, totals, completion rate, current streak |

Request validation is performed by the `validate(schema)` middleware in `server/middleware/validate.js`, which runs Zod schemas from `server/schemas/`.

---

## Architecture notes

**Frontend state model.** Three layers are kept separate on purpose:

- **Server state** — TanStack Query (`useTodos`, `useAnalytics`). Mutations invalidate `['todos']` and `['analytics']` so the chart, progress bar, and list stay in sync.
- **Auth state** — Zustand `useAuthStore` with `persist` middleware (localStorage).
- **UI state** — Zustand `useUIStore` for filters and dark mode (in-memory).

The `apiClient` wrapper reads the token via `useAuthStore.getState()` (not a hook), so it works outside React, and on `401` it calls `logout()` and throws — components don't need to handle session expiry.

**Timezone-aware analytics.** Daily buckets are generated using `Intl.DateTimeFormat('en-CA', { timeZone })` and the same `timezone` is passed to MongoDB's `$dateToString`. The frontend sends `Intl.DateTimeFormat().resolvedOptions().timeZone` automatically, so a todo created at 2 pm IST lands in today's column and not yesterday's UTC bucket.

**Theming.** Dark mode toggles a `.dark` class on `<html>` driven by Zustand. The chart, cards, and form components all consume shadcn's CSS variables, so the same component tree renders correctly in both modes.

---

## License

MIT — feel free to fork and adapt.
