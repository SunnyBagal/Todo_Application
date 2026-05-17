# Todo Application

A full-stack todo app with priority management, a live progress bar, and timezone-aware analytics — built to learn **Zustand**, **TanStack Query**, and how to wire a real frontend to a real backend.

**Live:** [todo-application-blgn.vercel.app](https://todo-application-blgn.vercel.app)

---

## Why this project?

This started as "I'll build a quick todo app to learn Zustand and TanStack Query." It was not quick.

What I thought would be a weekend project turned into a deep dive into things I didn't know I didn't know — state management philosophy (client state vs server state and why they're fundamentally different), query caching and invalidation, MongoDB aggregation pipelines, timezone-aware date bucketing, and honestly just how much goes into making a "simple" CRUD app feel production-ready.

Some of the things I learned the hard way:

- **Zustand vs TanStack Query** — they solve completely different problems. Zustand manages state that exists only in the browser (filters, dark mode, auth tokens). TanStack Query manages server data that can go stale, needs caching, and should refetch intelligently. Mixing them up (like storing API data in Zustand) creates bugs. Keeping them separate makes everything cleaner.
- **Query invalidation** — when you check a todo as "done," the progress bar, the todo list, AND the analytics chart all need to update. With TanStack Query, that's one line: `invalidateQueries({ queryKey: ['todos'] })`. Without it, you're manually syncing state across five components.
- **Timezones are painful** — if you bucket completed todos by date in UTC, a todo finished at 11pm IST shows up in "tomorrow's" column. The analytics pipeline now uses `Intl.DateTimeFormat` to bucket in the user's local timezone. This took way longer than I expected.
- **File structure matters early** — I started with everything in two files. By the time I had auth + CRUD + analytics, it was unmanageable. Refactoring into routes/middleware/models/schemas made each file focused and debuggable.

The project is far from perfect, but it taught me more than any tutorial could. **Next up: a Trello clone** — I've already started on the backend, database schema, and application architecture.

---

## What it does

**Auth** — signup, login, JWT sessions persisted in localStorage via Zustand. Protected routes redirect to login when there's no token.

**Todos** — create, edit, delete, toggle done, assign priority (low/medium/high). Filters by status and priority. The backend scopes every query to the logged-in user — you only see your own todos.

**Progress bar** — dynamically updates as you complete todos. Fetches all todos (unfiltered) so the percentage stays accurate regardless of active filters.

**Analytics dashboard** — an area chart showing todos created vs completed per day, overall completion rate, and a streak counter (consecutive days with at least one completion). The chart supports 7/30/90 day views via a dropdown.

**Dark mode** — persisted across reloads. One click, no flash.

---

## Tech stack

| Layer | What I used |
|-------|-------------|
| Frontend | React 19, Vite, TanStack Query, Zustand, Tailwind v4, shadcn/ui, Recharts, React Router |
| Backend | Express, Mongoose, Zod, bcryptjs, jsonwebtoken |
| Database | MongoDB Atlas |

---

## Project structure

```
Todo_application/
├── frontend/               # React SPA
│   └── src/
│       ├── api/             # fetch wrapper (reads auth token from Zustand, handles 401s)
│       ├── components/      # AddTodo, TodoList, TodoItem, ProgressBar, AnalyticsChart, etc.
│       ├── hooks/           # useTodos, useAnalytics (TanStack Query)
│       ├── pages/           # Login, Signup, Dashboard
│       └── stores/          # useAuthStore (persisted), useUIStore
│
└── server/                  # Express API
    ├── config/              # MongoDB connection
    ├── middleware/           # JWT auth, Zod validation
    ├── models/              # User, Todo (Mongoose)
    ├── routes/              # /auth, /todos, /analytics
    └── schemas/             # Zod request schemas
```

Two independent projects — separate `package.json`, separate `node_modules`, separate deploy targets.

---

## Running locally

**Prerequisites:** Node.js ≥ 18, a MongoDB instance (Atlas works great)

```bash
git clone <your-repo-url>
cd Todo_application

# install both
cd server && npm install
cd ../frontend && npm install
```

Create `server/.env`:

```
MONGO_KEY=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
PORT=3000
```

Start both (two terminals):

```bash
# terminal 1
cd server && npx nodemon index.js

# terminal 2
cd frontend && npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

> The frontend points at `http://localhost:3000/api` in `src/api/client.js`. If you change the backend port, update that too.

---

## API endpoints

All `/api/todos` and `/api/analytics` routes need an `Authorization: Bearer <token>` header.

| Method | Route | What it does |
|--------|-------|--------------|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/signin` | Log in, get a JWT |
| GET | `/api/auth/me` | Get current user from token |
| GET | `/api/todos` | List todos (supports `?status=` and `?priority=` filters) |
| POST | `/api/todos` | Create a todo |
| PATCH | `/api/todos/:id` | Update fields; toggling `done` auto-sets `completedAt` |
| DELETE | `/api/todos/:id` | Delete a todo |
| GET | `/api/analytics` | Daily series, completion rate, streak (`?days=30&tz=Asia/Kolkata`) |

---

## How state management works (the thing I actually learned)

```
┌──────────────────────────────┐     ┌──────────────────────────────┐
│         Zustand              │     │       TanStack Query          │
│                              │     │                              │
│  Auth token (persisted)      │     │  Todo list (cached, refetched)│
│  Dark mode toggle            │────▶│  Analytics data               │
│  Filter selections           │     │  Progress bar data            │
│  UI state (modals, etc.)     │     │                              │
│                              │     │  Auto-invalidates on mutation │
│  Lives in the browser only   │     │  Lives on the server, cached  │
└──────────────────────────────┘     └──────────────────────────────┘
```

The arrow shows the bridge: Zustand holds which filter is selected, TanStack Query uses that filter in its query key. Change the filter → query key changes → TanStack Query fetches (or serves from cache). Two libraries, zero prop drilling.

---

## Deploying it (the part nobody warns you about)

This is my first deployed application — and I genuinely thought deployment would be the easy part.

It wasn't.

I spent more time debugging the deployment than I did building some of the features. Here's what actually tripped me up:

- **Env var names have to match exactly.** My backend reads `MONGO_KEY` but the guide I was following said to set `MONGODB_URI`. One name off, completely silent crash. The server just died on startup.
- **Hardcoded URLs will betray you.** I had `http://localhost:3005/api` baked into the frontend. Works perfectly locally. In production, the browser is literally trying to reach localhost — on someone else's machine. Completely invisible bug until you open DevTools.
- **CORS is not a formality.** I thought you paste in `app.use(cors())` and move on. Turns out you have to list exact origins, and a Vercel preview URL is a completely different origin from your production URL. Cost me 30 minutes of confusion.
- **SPA routing on a CDN.** When you close a tab on `/dashboard` and reopen it, Vercel looks for an actual file called `dashboard`. It doesn't exist. Three lines in a `vercel.json` fixes it — but not before you get a 404 and wonder if the whole app broke.

Building this taught me how the pieces connect. Deploying it taught me that the pieces have to be *precise*. There's no "close enough" when it comes to endpoints, env var names, and allowed origins.

---

## What I'd do differently

- Add toast notifications for errors instead of inline text — errors silently disappearing is bad UX
- Implement optimistic updates for the todo toggle so it feels instant instead of waiting on the server
- Add an edit modal for todos — right now you can only delete, not update the title or description
- Write tests for at least the API routes — I got burned by a mismatch between what I assumed the API did and what it actually did
- Set up CI/CD with GitHub Actions so deploys happen automatically on push
- Add a health check endpoint on the backend so Render's free tier wakes up faster

---

## What's next

Building a **Trello clone** — kanban boards, drag-and-drop, multiple lists, card assignments. Already started on the backend schema and architecture. The state management patterns from this project carry over directly — Zustand for board UI state, TanStack Query for card/list data.

---

## License

MIT