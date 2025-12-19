# Client Demo Link (Tomorrow) — Fast Tunnel Setup (Windows)

Goal: give your client **one link** (frontend) they can open, while you keep your laptop running.

This uses **two tunnels**:
- one for backend `:8000` (used by the frontend internally)
- one for frontend `:3000` (this is the *only* link you send to the client)

## Option A (Recommended for speed): `localtunnel` via `npx`
No global installs needed (you already have Node for the frontend).

### 0) Open 4 terminals
You’ll keep them running the whole time.

### 1) Start Django backend (Terminal 1)
From repo root:

```powershell
Set-Location "C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django";
.\IBenv\Scripts\Activate.ps1;
$env:DEBUG = "True";
$env:ALLOWED_HOSTS = "*";
python manage.py migrate;
python manage.py runserver 127.0.0.1:8000
```

### 2) Create a public backend URL (Terminal 2)
From repo root:

```powershell
Set-Location "C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django";
npx localtunnel --port 8000
```

It prints a URL like:
- `https://something.loca.lt`

Your backend API base will be:
- `https://something.loca.lt/api`

### 3) Start Vite frontend using that backend URL (Terminal 3)
From `frontend/`:

```powershell
Set-Location "C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django\frontend";
$env:VITE_BASE_API = "https://something.loca.lt/api";  # <-- replace
npm install;
npm run dev -- --host 127.0.0.1 --port 3000
```

### 4) Create a public frontend URL (Terminal 4)
From `frontend/`:

```powershell
Set-Location "C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django\frontend";
npx localtunnel --port 3000
```

This prints a URL like:
- `https://your-frontend.loca.lt`

✅ Send **ONLY this frontend URL** to the client.

## Quick demo checklist (before you share)
- Open the frontend public URL yourself.
- Login as:
  - Admin: `admin / admin123`
  - Teacher: `teacher / teacher123`
  - Student: `student / student123`
- Confirm:
  - Student can start + submit exam
  - Teacher can grade + upload PDF

## Important notes
- Your laptop must stay online; don’t close the terminals.
- Free tunnels can be slow/cold-start occasionally; refresh once if needed.
- This is a demo setup (not recommended as a permanent production deployment).
