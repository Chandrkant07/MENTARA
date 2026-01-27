# Teacher‑Guided Learning Assignment System – Implementation + Production Plan

Date: 2026-01-26  
Audience: Client + Dev/ops

## 1) Executive Summary
This system is a **hybrid institution workflow**:
- **Admin** owns and standardizes content (materials + question bank).
- **Teachers** personalize learning (create mock tests from admin questions + assign materials/tests in sequence).
- **Students** only see what is assigned, in a guided timeline.

This document explains:
1) What the client wants (requirements distilled)
2) Recommended data model + API + UI behavior
3) A production structure under a tight budget
4) A **₹600-ish workaround** to make uploads work even on Render free tier

---

## 2) Roles & Permissions (RBAC)

### Admin
**Owns content + global control**
- Create/manage teachers and students
- Upload/manage learning materials (PDF/video/image/notes/links)
- Create/maintain Question Bank
- Create admin-level mock tests
- Assign materials/tests to **teachers** and/or **students**

**Rules**
- Admin-assigned items can be marked **Mandatory** and override locks.

### Teacher
**Learning designer**
- Read-only access to admin question bank
- Build mock tests using admin questions only
- Assign mock tests/materials to students with start/end windows + sequence
- View analytics

**Cannot**
- Create/edit/delete questions

### Student
- Sees only assigned items (admin + teacher)
- Sees items only when **unlocked** (time window reached or manually unlocked)
- Attempts tests, uploads structured submissions, sees results according to grading rules

---

## 3) Core Objects (Data Model Recommendation)

### 3.1 Material
A single table for all learning resources.

Suggested fields:
- `id`
- `title`
- `type`: `PDF | VIDEO | IMAGE | NOTES | EXTERNAL_LINK`
- `file` (optional) / `url` (optional)
- `description`
- `curriculum`, `subject`, `chapter`, `topic` (or curriculum + topic tree)
- `created_by` (admin)
- `created_at`

### 3.2 Question Bank (Admin only)
You already support questions; ensure every question is tagged well:
- `type`: `MCQ | NUMERICAL | SHORT | LONG | STRUCT` (or your existing types)
- `curriculum/topic/difficulty`

Teachers get **read-only** API access.

### 3.3 Exam / Mock Test
- Admin can create a test (optional or mandatory)
- Teacher can create a test **only from admin questions**

Store:
- time limit, marks, etc.
- links to questions (with order)

### 3.4 Assignment (the missing “workflow engine”)
This is the key to match the client’s “guided sequence” requirement.

**Table: `LearningAssignment`**
- `id`
- `assigned_by` (FK User)
- `assigned_by_role`: `ADMIN | TEACHER`
- `assigned_to` (FK Student)
- `assignment_type`: `MATERIAL | MOCK_TEST`
- `material` (FK Material, nullable)
- `exam` (FK Exam, nullable)
- `start_at` (datetime)
- `end_at` (datetime)
- `sequence_order` (int)
- `priority`: `MANDATORY | OPTIONAL`
- `status`: `LOCKED | PENDING | COMPLETED | EXPIRED`
- `unlock_override` (bool)  ← for manual unlock
- `created_at`, `updated_at`

**Constraints**
- Exactly one of `material` or `exam` must be present.
- Teachers can only assign within their allowed curriculum/subjects (if you enforce).

### 3.5 Student progress
Progress can be derived, or stored:
- `AssignmentProgress` (optional): `assignment_id`, `student_id`, `completed_at`, `notes`

For tests, attempts already exist — connect the attempt to the assignment.

---

## 4) Assignment Locking Rules (Must Match Client)

### 4.1 Visibility to student
An assignment is visible if:
- It belongs to the student, AND
- It is within time window (`start_at <= now <= end_at`) OR `unlock_override=true`, AND
- If sequence enforcement is enabled, all prior required items are completed.

### 4.2 Sequence + time window
- Students **cannot access future content** unless:
  - Time window starts, OR
  - Teacher/Admin unlocks manually.

### 4.3 Admin override
- Admin mandatory assignments can override locks (configurable), e.g. show even if previous teacher items not complete.

---

## 5) API Endpoints (Suggested)

### Admin
- `POST /materials/` upload/create
- `POST /questions/` create question
- `POST /exams/` create admin exam
- `POST /assignments/` assign material/test to student (mandatory/optional)

### Teacher
- `GET /questions/` read-only
- `POST /exams/` create teacher exam (server validates: question IDs are from admin bank)
- `POST /assignments/` assign to student
- `PATCH /assignments/:id/unlock/` manual unlock

### Student
- `GET /my/assignments/` returns only visible items with status
- `POST /assignments/:id/complete/` mark material as completed
- `POST /attempts/:attemptId/upload-submission/` structured upload (already implemented)

---

## 6) Dashboard Requirements (UI)

### Admin dashboard
- Material management
- Question bank
- Create/mock tests
- Assign to teachers/students
- Global analytics

### Teacher dashboard
- Read-only question bank
- Mock test builder
- Learning plan creator (assignments with sequence + time windows)
- Student analytics

### Student dashboard
- Mandatory (admin) assignments
- Teacher assignments
- Locked/active/completed sections
- Test attempt CTA
- Upload submission UI for structured

---

## 7) Analytics
Minimum analytics to satisfy client:
- Test scores (already)
- Topic-wise accuracy
- Completion rate for assignments

Implementation approach:
- For tests: from `Attempt` + `Response`
- For materials: from `AssignmentProgress` or completion events

---

## 8) Production Under Budget (Best Practical Option)

### Recommended: AWS Lightsail + Docker Compose (single server)
**Reason**: fits budget, stable, predictable.

**Components**
- Nginx (SSL termination + static)
- Django + Gunicorn
- PostgreSQL (same server)
- React build served by Nginx
- Object storage for uploads (recommended even on Lightsail): S3-compatible

**Minimum instance**
- 2GB RAM (recommended)
- 50–60GB SSD

### Upgrade path
- Move uploads to S3/R2 first
- Increase RAM to 4GB if slow
- Later: RDS + multi-app instances (will exceed ₹3k/month)

---

## 9) Client Testing on Render (₹0–₹600 workaround for uploads)
Render free tier has **ephemeral disk**, so uploaded files disappear.

### Best cheap fix: put uploads on object storage
Options (choose 1):

#### Option A: AWS S3 (best compatibility)
- Pros: standard, works with Django easily
- Cons: costs if you exceed free tier
- If your AWS account qualifies for free tier, it can be near ₹0 for small usage.

#### Option B: Cloudflare R2 (often cheapest)
- Pros: very low storage cost
- Cons: requires S3-compatible config

#### Option C: Backblaze B2
- Pros: cheap storage
- Cons: slightly more setup

**Recommendation for ₹600-ish**: start with **AWS S3 free-tier if available**. If free-tier is not available, use R2.

### Upload volume guidance (so client understands “low to max”)
These are rough planning buckets:

- **Low**: 10 students/day upload, 1–3 files each, ~2–5 MB each
  - Daily data: ~20–150 MB
  - Monthly storage growth: ~0.6–4.5 GB

- **Normal (your ~50/day)**: 50 students/day upload, 1–5 files, ~2–10 MB each
  - Daily data: ~100 MB–2.5 GB
  - Monthly storage growth: ~3–75 GB

- **High**: 200/day upload, 3–10 files, 5–20 MB each
  - Daily data: ~3–40 GB
  - Monthly storage growth: ~90–1200 GB

If you are in the **Normal** range and keep PDFs/images small, S3/R2 costs can remain low.

### Render configuration (high level)
- Store files using S3-compatible backend
- Set these environment variables on Render:
  - `DEFAULT_FILE_STORAGE` or an internal toggle like `USE_S3=true`
  - Bucket name
  - Access key / secret
  - Region
  - Public media base URL

Your app then serves media URLs that do not depend on Render disk.

---

## 10) Final Recommendation to Client
For smooth production and easy traffic handling:
1) Start with **Lightsail 2GB + Postgres + Nginx + Docker**
2) Put uploads on **S3-compatible storage** from day 1
3) Add backups + monitoring
4) When traffic grows, scale to 4GB then separate DB (RDS)

---

## 11) Next Development Steps (to fully match the requirement doc)
If not implemented yet, build:
1) `Material` module (upload + metadata + curriculum/topic tagging)
2) `LearningAssignment` module (sequence + start/end + status + unlock)
3) Student assignment feed (`/my/assignments/`) that enforces lock rules
4) Teacher learning plan UI (assign content in order)
5) Completion tracking + analytics
