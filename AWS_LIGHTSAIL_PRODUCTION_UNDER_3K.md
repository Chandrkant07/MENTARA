
# AWS Lightsail Production (Under ~₹3,000/month) — Mentara (Django + React)

This document explains a practical, budget-friendly production structure for this project, plus a quick fix for **Render free-tier media uploads** (ephemeral disk).

## Goals

- Full product works in production (Admin/Teacher/Student dashboards, exams, uploads).
- Monthly infra cost target: **~₹3,000/month** (initial phase).
- Simple to understand and explain to a client.

## Recommended Architecture (Best Under Budget)

**Single server on AWS Lightsail (Ubuntu) with Docker Compose**

Runs on one instance:
- **Nginx**: reverse proxy + HTTPS + serve frontend build
- **Django**: Gunicorn
- **PostgreSQL**: on the same instance (budget-friendly)
- **Media uploads**: stored on the same server disk initially OR on S3-compatible storage

Why this works well under budget:
- One predictable monthly cost (Lightsail)
- No load balancer / RDS / ECS costs
- Easy deployment and rollback

## AWS Service Choices

### Compute
- **AWS Lightsail** (recommended for low budget)

Suggested instance sizes:
- Start: **2GB RAM** (recommended minimum for Django + Postgres + Nginx)
- Upgrade path: **4GB RAM** when traffic grows

### Domain
- Buy from any registrar (often cheaper than AWS Route 53).
- Point the domain to the Lightsail **Static IP**.

### SSL
- Use **Let’s Encrypt (Certbot)** → free

### Backups
- Use Lightsail **Snapshots** (weekly/daily based on risk tolerance)
- Optional: a daily **Postgres dump** to a backup folder (or to object storage)

## Traffic Expectation Guidance (Client-Friendly)

For “~50 users/day” typical coaching/edtech usage:
- 2GB RAM single-server is generally OK if concurrent usage is modest.
- If you get many simultaneous test takers (e.g., 30+ at the same time), consider 4GB.

## Upload Sizing Ranges (Low → High)

Use this to discuss storage needs with your client.

Assume “submission uploads” include PDFs/images.

**Low**
- 20 uploads/day × 2 MB average = 40 MB/day (~1.2 GB/month)

**Medium (common)**
- 50 uploads/day × 5 MB average = 250 MB/day (~7.5 GB/month)

**High**
- 100 uploads/day × 10 MB average = 1,000 MB/day (~30 GB/month)

Notes:
- If students upload multiple files per attempt, multiply accordingly.
- Videos increase size dramatically; avoid video uploads on the budget plan.

---

# Quick Fix: “Uploads not showing on Render Free” (Budget ~₹0–₹600)

## Why uploads disappear on Render Free

Render free services have **ephemeral filesystem**:
- files written to `/media` can be wiped on redeploy/restart
- even if upload succeeds, the file won’t be reliably accessible later

## Cheapest reliable solution: use S3-compatible object storage

Good news: this project already supports it.

In [ib_project/settings.py](ib_project/settings.py) there is built-in support:
- `USE_S3=True`
- `DEFAULT_FILE_STORAGE = storages.backends.s3boto3.S3Boto3Storage`
- Optional `AWS_S3_ENDPOINT_URL` (for S3-compatible providers)
- Optional `AWS_S3_CUSTOM_DOMAIN` (for public URLs)

### Option A (Recommended under ₹600): Cloudflare R2 (S3-compatible)

Pros:
- very low cost
- generous included storage/requests depending on plan

Cons:
- usually requires adding a payment method
- for public access you may need to expose a public bucket or custom domain

You will create:
- an R2 bucket (e.g. `mentara-media`)
- R2 access key/secret
- R2 endpoint URL

Then set Render Environment Variables (Render dashboard → Environment):

- `USE_S3=True`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `AWS_STORAGE_BUCKET_NAME=mentara-media`
- `AWS_S3_REGION_NAME=auto`
- `AWS_S3_ENDPOINT_URL=https://<accountid>.r2.cloudflarestorage.com`

For URLs to work publicly, set one of these:
- `AWS_S3_CUSTOM_DOMAIN=<your-public-domain-for-bucket>` (recommended if you configure it)

If you don’t set `AWS_S3_CUSTOM_DOMAIN`, the project falls back to AWS-style URLs.

### Option B: AWS S3 (Simple, predictable)

Pros:
- standard S3 works everywhere
- simplest public URL behavior

Cons:
- may be slightly higher cost long term than R2

Set Render env vars:

- `USE_S3=True`
- `AWS_ACCESS_KEY_ID=...`
- `AWS_SECRET_ACCESS_KEY=...`
- `AWS_STORAGE_BUCKET_NAME=mentara-media`
- `AWS_S3_REGION_NAME=ap-south-1` (Mumbai region recommended)

## Verify media works (production test checklist)

After setting env vars and redeploying:
- Upload a topic image / question image / attempt submission
- Open the uploaded file link from the UI
- Confirm the URL is an S3/R2 URL (not `/media/...`)

If links are still `/media/...`:
- confirm `USE_S3=True` is actually present in Render env
- redeploy the service (Render)

## Alternative (fastest demo): Cloudinary Free

If you want the easiest 1-month client demo without worrying about Render disks or S3 endpoints, use Cloudinary.

Render env vars:
- `USE_CLOUDINARY=True`
- `CLOUDINARY_CLOUD_NAME=...`
- `CLOUDINARY_API_KEY=...`
- `CLOUDINARY_API_SECRET=...`

Notes:
- Cloudinary free tier is usually enough for ~10–15 users and image/PDF uploads for a demo period.
- If you hit limits, upgrade Cloudinary later.

## Important: CORS

Most uploads are server-side (Django → S3), so CORS is usually not a blocker.
But if you ever start direct-to-S3 uploads from the browser, you must configure bucket CORS.

---

# Full Production Plan (Lightsail)

## Step 1 — Create Lightsail Instance

- OS: Ubuntu LTS
- Attach a **Static IP**
- Open ports:
	- 22 (SSH)
	- 80 (HTTP)
	- 443 (HTTPS)

## Step 2 — Deploy with Docker Compose

This repo includes:
- [docker-compose.yml](docker-compose.yml)
- [Dockerfile](Dockerfile)
- [nginx.conf](nginx.conf)

High level:
- Nginx handles HTTPS and routes `/api` to Django
- Django serves API and writes media to disk or S3
- Postgres stores data

## Step 3 — Production Environment Variables

Minimum required:

- `DEBUG=False`
- `SECRET_KEY=<strong-random>`
- `ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com`
- `CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `FRONTEND_URL=https://yourdomain.com`
- Database:
	- `DB_NAME=...`
	- `DB_USER=...`
	- `DB_PASSWORD=...`
	- `DB_HOST=...`
	- `DB_PORT=5432`

Media (choose one):
- Local disk: set `MEDIA_ROOT=/opt/mentara/media` (example)
- OR object storage: set `USE_S3=True` + keys (see Render section)

## Step 4 — SSL (Let’s Encrypt)

- Point domain to Static IP (A record)
- Install certbot + issue certificate
- Configure Nginx for SSL
- Enable auto-renew

## Step 5 — Backups

Minimum:
- Weekly Lightsail snapshot

Recommended:
- Daily snapshot during active development
- Daily Postgres dump (kept for 7–14 days)

---

# Upgrade Path (When Budget Increases)

1) Move media to S3/R2 permanently
2) Upgrade Lightsail RAM
3) Move database to managed DB (RDS)
4) Add CDN (CloudFront)
5) Run multiple app instances behind a load balancer


