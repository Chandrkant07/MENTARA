# Stable Hosting (No Domain Needed) — Render (Backend) + Netlify (Frontend)

This gives you **stable public URLs** (subdomains) you can share with your client.
You do NOT need to buy a domain.

You will end with:
- Frontend: `https://<site>.netlify.app`  (send this to client)
- Backend API: `https://<service>.onrender.com/api`

## Why this is the best “stable link” for you
- Frontend is static and fast on Netlify.
- Backend is a real server on Render.
- No need to keep your laptop on.
- Works with your existing `VITE_BASE_API` pattern.

## Repo deploy helpers (already added)
- `frontend/public/_redirects` — fixes SPA route refresh (no 404 on `/login`, `/dashboard`, etc.)
- `netlify.toml` — pre-fills Netlify build/publish config
- `render.yaml` — optional Render Blueprint for backend + Postgres

---

## Part A — Deploy Django backend to Render

### 1) Create Render service
- Go to Render → **New +** → **Web Service**
- Connect your GitHub repo
- **Root directory**: repo root (same folder as `manage.py`)

### 2) Build / start commands
- Build command:
  - `pip install -r requirements.txt`
- Start command (recommended):
  - `bash -lc "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn ib_project.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120"`

### 3) Environment variables (Render → Environment)
Set these:
- `DEBUG` = `False`
- `SECRET_KEY` = (Render can generate; or paste a long random string)
- `ALLOWED_HOSTS` = `*` (fastest for demo) OR `your-service.onrender.com`
- `DATABASE_URL` = (from Render Postgres; see below)
- `CSRF_TRUSTED_ORIGINS` = `https://<your-site>.netlify.app`
- `CORS_ALLOWED_ORIGINS` = `https://<your-site>.netlify.app`
- `FRONTEND_URL` = `https://<your-site>.netlify.app`

Important:
- This project supports `DATABASE_URL` in production now.

### 4) Add a Postgres database
- Render → **New +** → **PostgreSQL**
- Copy its **External Database URL** into the backend’s `DATABASE_URL`

### 5) Validate backend
Open:
- `https://<service>.onrender.com/api/health/`

You should see a healthy response.

---

## Part B — Deploy frontend to Netlify

### 1) Create site
- Netlify → **Add new site** → **Import from Git**
- Connect the same repo

### 2) Build settings
- Base directory: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `frontend/dist`

### 3) Environment variables
Netlify → Site settings → Environment variables:
- `VITE_BASE_API` = `https://<service>.onrender.com/api`

### 4) Deploy and validate
- Open the Netlify URL.
- Login with your demo users.

---

## If you still want a “temporary tunnel URL” too
Use the tunnel setup in `DEMO_TUNNEL.md` as a fallback.

Recommended workflow for tomorrow:
- Try Render+Netlify first (stable).
- Keep tunnel as a backup plan if a host has a cold start.
