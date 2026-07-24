# NoteVault — Smart Note Manager

> A full-stack note-taking web app with a premium glassmorphism UI, built with **Vue 3**, **Node.js/Express**, and **SQLite**.

**🌐 Live Demo:** [https://note-vault-note-taking-kappa.vercel.app](https://note-vault-note-taking-kappa.vercel.app)

**🚀 Backend API:** [https://notevaultnotetaking-production.up.railway.app/api](https://notevaultnotetaking-production.up.railway.app/api)

---

## Quick Start (Recommended)

> **One command starts both backend + frontend simultaneously.**

```bash
# 1. Clone the repository
git clone https://github.com/henyu0112/NoteVault_NoteTaking.git
cd NoteVault_NoteTaking

# 2. Install all dependencies (first time only)
npm run install:all

# 3. Start both servers
npm run dev
```

Then open → **http://localhost:5173**

---

## Manual Start (Two Terminals)

**Terminal 1 — Backend API (port 3001):**
```bash
cd backend
cp .env.example .env   # copy environment config
npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd frontend
npm run dev
```

> The backend **must be running** before the frontend can load notes.

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start **both** backend + frontend (recommended) |
| `npm run backend` | Start backend only (port 3001) |
| `npm run frontend` | Start frontend only (port 5173) |
| `npm run install:all` | Install dependencies for both projects |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Vue 3 (Composition API) + Vite |
| **Backend** | Node.js + Express |
| **Database** | SQLite via `better-sqlite3` |
| **Styling** | Vanilla CSS — Glassmorphism design system |
| **HTTP Client** | Axios |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Railway |

---

## Features

- **Create** notes with title, content, accent colour, and pin toggle
- **View** all notes in a responsive card grid with staggered animations
- **Update** notes via a click-to-edit modal
- **Delete** notes with an animated confirmation dialog
- **Search** notes in real-time (debounced, searches title & content)
- **Pin** notes to keep them at the top
- **12 Themes** — 6 colour families × Dark & Light variants, persisted to `localStorage`
- **Typography** — 7 curated font families (including OpenDyslexic) and 4 scaling sizes
- **Accessibility** — Reduced motion, adjustable line height, letter spacing, and layout density sliders
- **Animations** — Fluid staggered grid loading, dynamic search bar, tactile buttons, and stacking toast notifications
- **Sound Effects** — Web Audio API sounds on create, save, delete, pin, and setting changes
- **Responsive** — works on desktop, tablet, and mobile

---

## REST API Reference

Base URL: `http://localhost:3001/api`  
Production URL: `https://notevaultnotetaking-production.up.railway.app/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes` | Get all notes (supports `?search=` query) |
| `GET` | `/notes/:id` | Get a single note |
| `POST` | `/notes` | Create a new note |
| `PUT` | `/notes/:id` | Update a note (partial update supported) |
| `DELETE` | `/notes/:id` | Delete a note |

**Note body shape:**
```json
{
  "title":   "My Note",
  "content": "Note content here",
  "color":   "#7c3aed",
  "pinned":  false
}
```

---

## Deployment Guide

This app is split across two services for deployment:

| Service | Platform | What it hosts |
|---------|----------|---------------|
| **Backend** | [Railway](https://railway.app) | Node.js API + SQLite |
| **Frontend** | [Vercel](https://vercel.com) | Vue 3 static site |

> ⚠️ **Note on Data Persistence:** Railway runs the backend inside an ephemeral container. This means the SQLite database (`notes.db`) is reset every time Railway redeploys the backend (e.g., on every GitHub push). For permanent data storage, consider upgrading to a hosted database like Railway PostgreSQL or MongoDB Atlas.

### Step 1 — Deploy Backend to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
3. Select the repo, set the **Root Directory** to `backend`
4. Add this environment variable in Railway's dashboard:
   ```
   PORT=3001
   ```
5. Copy your Railway public URL (e.g. `https://your-app.up.railway.app`)

### Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project → Import from GitHub**
2. Set **Root Directory** to `frontend`
3. Set the **Framework Preset** to `Vite`
4. Add this environment variable in Vercel's dashboard:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app/api
   ```
5. Click **Deploy** — Vercel will auto-detect Vite and build it

---

## Project Structure

```
NoteVault_NoteTaking/
├── .gitignore
├── package.json                ← Root scripts (concurrently)
├── README.md
├── backend/
│   ├── .env.example            ← Copy to .env and configure
│   ├── db/
│   │   ├── database.js         ← SQLite schema + init
│   │   └── notes.db            ← auto-created, git-ignored
│   ├── routes/
│   │   └── notes.js            ← CRUD route handlers
│   ├── server.js               ← Express entry point
│   └── package.json
└── frontend/
    ├── .env.example            ← Copy to .env.local to configure
    ├── index.html
    ├── vite.config.js          ← Dev proxy → localhost:3001
    ├── src/
    │   ├── assets/
    │   │   └── main.css                ← Global design system (12 themes)
    │   ├── components/
    │   │   ├── NoteCard.vue            ← Individual note card + tooltip
    │   │   ├── NoteModal.vue           ← Create/Edit modal
    │   │   ├── DeleteConfirm.vue       ← Confirmation dialog
    │   │   ├── SearchBar.vue           ← Debounced search
    │   │   └── ThemeSelector.vue       ← Settings panel (theme, typography, a11y, volume)
    │   ├── composables/
    │   │   ├── useTheme.js             ← Theme state (localStorage)
    │   │   ├── useFont.js              ← Typography state (localStorage)
    │   │   ├── useAccessibility.js     ← A11y state (localStorage)
    │   │   └── useSound.js             ← Web Audio API sound engine
    │   ├── services/
    │   │   └── api.js                  ← Axios API layer
    │   ├── views/
    │   │   └── HomeView.vue            ← Main dashboard
    │   ├── App.vue
    │   └── main.js
    └── package.json
```

---

## Development Process — AI Usage

### 1. Glassmorphism Card Design

**Prompt given:**
> "Generate CSS for a glassmorphism note card with a color accent bar at the top, hover lift animation, and hover-reveal action buttons."

**AI output:** A basic card with `backdrop-filter: blur` and a simple box-shadow hover.

**How I modified it:**
- Added a dynamic `--note-color` CSS variable so each card reflects its user-chosen accent colour
- Replaced the generic box-shadow with `color-mix(in srgb, var(--note-color) 20%, transparent)` for a theme-aware glow
- Added the `card-actions` opacity/transform reveal animation (opacity: 0 → 1, translateX(6px) → 0) since the AI only had a static button layout

**Why:** The AI gave the structural foundation; the customisation made the card feel genuinely premium and interactive.

---

### 2. SQLite Schema Design

**Prompt given:**
> "Design a SQLite schema for a notes table that supports a title, content, optional accent color, pinning, and timestamps."

**AI output:**
```sql
CREATE TABLE notes (id INTEGER PRIMARY KEY, title TEXT, content TEXT, created_at DATETIME);
```

**How I modified it:**
- Added `color TEXT DEFAULT '#7c3aed'` and `pinned INTEGER DEFAULT 0` columns
- Changed `DATETIME` to `TEXT` (SQLite stores dates as text; `datetime('now')` is more portable)
- Added `updated_at TEXT DEFAULT (datetime('now'))` and update timestamp logic in the route layer
- Enabled `PRAGMA journal_mode = WAL` for better concurrent read performance

**Why:** The AI suggested only the minimum. Real requirements (colour per note, pinning, update timestamps) needed to be added manually.

---

### 3. Vue 3 Composition API State Pattern

**Prompt given:**
> "Show me a Vue 3 Composition API pattern for managing CRUD state with loading indicators, error handling, and toast notifications in a single view."

**AI output:** A basic `ref` array with a `try/catch` around an API call.

**How I modified it:**
- Structured loading as an object `{ fetch, save, delete }` so each operation has its own independent spinner
- Added a toast queue with auto-dismiss IDs (`toastId++`) instead of a single error string
- Added a debounced search watcher that triggers `fetchNotes()` without flooding the API
- Extracted the `addToast()` helper for reuse across all CRUD handlers

**Why:** The AI gave a starting skeleton; real UX requires granular loading states and non-blocking user feedback.
