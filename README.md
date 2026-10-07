# NYSC Connect — Frontend

A location-based settlement and information platform for Corps Members in Nigeria.

NYSC Connect is **not** a housing marketplace. Accommodation is the anchor use
case within a broader settlement problem: helping a newly deployed Corps Member
find organized, trustworthy, location-specific information — accommodation,
transport, PPA details, healthcare, security and everyday services — in a State
and LGA they are unfamiliar with.

This repository contains the **web frontend**. It consumes the NYSC Connect
Backend API (v1) and shares the same data contract with the Mobile client.

---

## Status

MVP — Corps Member journey and admin moderation loop are functional.
Five backend dependencies remain open before full end-to-end QA can pass.
See **Known Backend Dependencies** below.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Backend-Free Mode (Mock)](#backend-free-mode-mock)
- [API Contract](#api-contract)
- [Routes](#routes)
- [Core User Journeys](#core-user-journeys)
- [Architecture Notes](#architecture-notes)
- [Known Backend Dependencies](#known-backend-dependencies)
- [Security Notes](#security-notes)
- [Testing](#testing)
- [Contributing](#contributing)
- [Scripts](#scripts)

---

## Tech Stack

| Layer      | Choice                   | Why                                              |
| ---------- | ------------------------ | ------------------------------------------------ |
| Build      | Vite                     | Fast dev server, first-class environment vars    |
| UI         | React 18 (JavaScript)    | Team is JS-first; TypeScript removed this cycle  |
| Routing    | react-router-dom v6      | Nested routes, guard composition                 |
| HTTP       | Axios                    | Request/response interceptors for auth and 401   |
| Session    | localStorage             | MVP only — see Security Notes                    |
| Styling    | Plain CSS                | No CSS-in-JS for MVP                             |

---

## Project Structure

```
src/
├── main.jsx                      # Entry — providers + router
├── contexts/
│   ├── AuthContext.jsx           # user, token, register/login/logout
│   └── LocationContext.jsx       # state, lga, ppa (exposes useUserLocation)
├── routes/
│   └── AppRoutes.jsx             # Route table + Protected guards
├── services/
│   ├── apiClient.js              # Axios instance + interceptors + unwrap
│   └── mockApi.js                # Backend-free mode (VITE_MOCK_API)
├── components/
│   ├── ScreenStates.jsx          # Loading / Error / Empty / Offline / 404
│   └── ...                       # Feature components
└── pages/                        # All screens
    ├── HomePage.jsx              # Location-based dashboard
    ├── AccommodationPage.jsx     # Search + filters
    ├── AccommodationDetailPage.jsx
    ├── GuidePage.jsx
    ├── GuideDetailPage.jsx
    ├── SavedPage.jsx
    ├── ReportPage.jsx
    ├── ProfilePage.jsx
    ├── AdminReportsPage.jsx
    └── ...                       # Additional MVP screens
```

Notes:

- All source is `.jsx` / `.js`. No `.ts` or `.tsx`.
- The custom location hook is named **`useUserLocation`**, not `useLocation`,
  to avoid a collision with React Router's `useLocation`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A running instance of the NYSC Connect Backend (or use Mock mode — below)

### Install & Run

```bash
git clone <repo-url>
cd nysc-connect-frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
npm run preview
```

---

## Environment Variables

Vite reads `VITE_*` variables from `.env` (and `.env.local` for overrides).

| Variable              | Required | Default                              | Purpose                                    |
| --------------------- | -------- | ------------------------------------ | ------------------------------------------ |
| `VITE_API_BASE_URL`   | Yes      | `http://localhost:5000/api/v1`       | Backend API base URL                       |
| `VITE_APP_ENV`        | No       | `development`                        | `development` \| `staging` \| `production` |
| `VITE_MOCK_API`       | No       | `false`                              | Enable backend-free mode                   |

### Example `.env`

```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_ENV=development
VITE_MOCK_API=false
```

**Never commit `.env` or `.env.local`.** Use `.env.example` as the template.

---

## Backend-Free Mode (Mock)

The frontend supports a mock adapter so UI work and demos can run without the
backend. Toggle it with a single environment flag:

```bash
VITE_MOCK_API=true npm run dev
```

When enabled, the Axios adapter intercepts requests before they hit the network:

- `/auth/login`, `/auth/register`, `/auth/me` handled in memory
- `/locations/*`, `/accommodations/*`, `/local-info`, `/saved`, `/reports`,
  `/admin/reports` return seeded responses
- AuthContext, pages, and guards are unchanged — the app cannot tell the difference

### Seeded accounts

| Email                | Password       | Role          |
| -------------------- | -------------- | ------------- |
| `chinedu@nysc.test`  | `Password123!` | `corps_member`|
| `admin@nysc.test`    | `Password123!` | `ADMIN`       |

> Mock mode is for development and demo only. It is disabled by default in
> committed code. All production builds point to the real backend.

---

## API Contract

All requests go through `src/services/apiClient.js`. That module:

- injects `Authorization: Bearer <token>` when a token is present
- unwraps the `{ status, message, data }` envelope so pages receive clean data
- clears the session and redirects to `/onboarding` on `401`
- redirects to `/home` on `403`

### Endpoints consumed

| Method | Endpoint                      | Auth   | Used by                       |
| ------ | ----------------------------- | ------ | ----------------------------- |
| POST   | `/auth/register`              | No     | Onboarding                    |
| POST   | `/auth/login`                 | No     | Onboarding                    |
| GET    | `/auth/me`                    | Yes    | Session restore               |
| GET    | `/locations/states`           | No     | Onboarding (State)            |
| GET    | `/locations/lgas?state=`      | No     | Onboarding (LGA)              |
| GET    | `/accommodations`             | No     | Home, Accommodation feed      |
| GET    | `/accommodations/:id`         | No     | Accommodation detail          |
| GET    | `/local-info`                 | No     | Local Guide                   |
| GET    | `/saved`                      | Yes    | Saved                         |
| POST   | `/saved`                      | Yes    | Accommodation detail (Save)   |
| DELETE | `/saved/:id`                  | Yes    | Saved (Remove)                |
| POST   | `/reports`                    | Yes    | Report/Flag                   |
| GET    | `/admin/reports`              | Admin  | Admin Reports queue           |
| PATCH  | `/admin/reports/:id`          | Admin  | Admin Reports (resolve/dismiss)|

Full specification is maintained by the Backend team — see the
**NYSC Connect Frontend & Mobile API Specification (v1)**.

---

## Routes

| Path                       | Page                      | Guard           |
| -------------------------- | ------------------------- | --------------- |
| `/onboarding`              | Onboarding                | Public          |
| `/home`                    | HomePage                  | Authenticated   |
| `/accommodation`           | AccommodationPage         | Authenticated   |
| `/accommodation/:id`       | AccommodationDetailPage   | Authenticated   |
| `/guide`                   | GuidePage                 | Authenticated   |
| `/guide/:category`         | GuideDetailPage           | Authenticated   |
| `/saved`                   | SavedPage                 | Authenticated   |
| `/report`                  | ReportPage                | Authenticated   |
| `/profile`                 | ProfilePage               | Authenticated   |
| `/admin/reports`           | AdminReportsPage          | Admin only      |
| `*`                        | 404                       | Public          |

---

## Core User Journeys

### Corps Member

```
Register / Login
  → Select State
  → Select LGA
  → Optional PPA (or Skip)
  → Location-based Home
  → Accommodation feed
  → Accommodation detail
  → Save
  → Saved items
  → Local Guide
  → Report an item
  → Confirmation
```

### Admin

```
Login as ADMIN
  → Open Report Queue
  → Review Report
  → Resolve / Dismiss
```

---

## Architecture Notes

- **Single Axios instance.** Every API call goes through `services/apiClient.js`.
  Auth header injection, envelope unwrapping, and 401 handling are implemented
  once, not per screen.
- **Two contexts.** `AuthContext` (user, token) and `LocationContext`
  (state, lga, ppa — exposed as `useUserLocation`). Both hydrate from
  `localStorage` on mount.
- **Route guards.** `Protected` checks authentication. `requireAdmin` additionally
  checks that the user's role is `ADMIN` or `admin`.
- **Screen states.** Every data-driven screen renders one of: Loading → Error →
  Empty → Content. All states come from `components/ScreenStates.jsx`.
- **Nested routes.** The shell uses `<Outlet />` and relative paths. Absolute
  paths inside nested `<Route>` blocks are avoided.

---

## Known Backend Dependencies

The MVP cannot complete end-to-end QA until the following are confirmed by the
Backend team:

| # | Dependency                                | Impact                                                     | Workaround                                  |
| - | ----------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| 1 | `PATCH /users/me/location`                | Location cannot persist server-side across devices         | Client-side only via `localStorage`         |
| 2 | PPA field on the user object              | PPA cannot be stored server-side                           | Client-side only via `localStorage`         |
| 3 | Freshness field on accommodations         | Only `source` displayed; freshness cannot be surfaced      | Display source only                         |
| 4 | `GET /saved` response shape               | Spec shows object, not array                               | Client normalizes both shapes               |
| 5 | Admin role value casing                   | Spec says `ADMIN`; sample shows `corps_member`             | Client checks both `ADMIN` and `admin`      |

**Impact statement:** Until items 1 and 2 are resolved, the MVP cannot claim
"location persists across sessions and devices." This must be stated clearly to
stakeholders.

---

## Security Notes

**MVP only.** The access token is stored in `localStorage`, which is vulnerable
to XSS. The recommended production path is:

- short-lived access token held in memory
- refresh token in an `httpOnly`, `Secure`, `SameSite=Strict` cookie

This is documented in the codebase and should be revisited before any public
launch.

- No secrets are committed. All config is via `VITE_*` environment variables.
- `.env` and `.env.local` are gitignored.

---

## Testing

Manual end-to-end checklist is run before each milestone:

- [ ] Register creates an account and redirects to onboarding
- [ ] Login with an existing account rehydrates the session
- [ ] Reload preserves session and location
- [ ] State and LGA lists load from the backend
- [ ] PPA can be entered or skipped
- [ ] Home shows listings filtered by State + LGA
- [ ] Empty LGA renders the empty state
- [ ] Backend down renders the error state with retry
- [ ] Detail loads by listing ID
- [ ] Save → item appears in Saved
- [ ] Guide toggles between transport / health / security
- [ ] Report submits with each allowed reason
- [ ] Admin login → queue shows submitted report
- [ ] Resolve / Dismiss removes the report from the queue
- [ ] Non-admin is redirected away from `/admin/reports`
- [ ] Unknown URL renders 404

Automated tests are **not in scope for the MVP**; planned for post-QA hardening.

---

## Contributing

### Branching

- `main` — stable, protected
- `dev` — integration branch
- `feat/<epic>-<short>` — features
- `fix/<short>` — bug fixes
- `chore/<short>` — tooling
- `docs/<short>` — documentation

Open a pull request from your feature branch into `dev`. `main` is updated only
by merging `dev` at milestone boundaries.

### Commit messages

Conventional commits:

```
feat: add onboarding state step
fix: reset filters on empty state
chore: bump vite
docs: update README with mock mode
```

### Before you push

```bash
npm run lint
npm run build
```

---

## Scripts

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server                |
| `npm run build`   | Production build                     |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

---

## License

Internal — Cohort 8 Capstone Project. Not for public distribution.