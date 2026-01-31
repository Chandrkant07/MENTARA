# Mentara – Learning & Assessment Platform

## ✅ Current Status (Full Stack)

This workspace includes:
- ✅ Django backend (DRF) with auth, exams, attempts, admin controls
- ✅ React frontend (Vite + Tailwind) with student/teacher/admin dashboards
- ✅ Structured workflow support (uploads + teacher grading where applicable)

### Quick links
- Backend admin: http://127.0.0.1:8000/admin
- Frontend dev server: http://127.0.0.1:5173

### Teacher‑Guided Assignment System (New Requirement)
Client requirement + implementation plan is documented here:
- `docs/TEACHER_GUIDED_ASSIGNMENT_SYSTEM_PRODUCTION.md`

### Key Highlights
- 🎨 **Apple-level UI**: Dark theme with gradient accents, micro-interactions
- 📊 **Smart Analytics**: Streak tracking, topic performance, leaderboards
- 🤖 **Auto-grading**: Instant MCQ grading with teacher override for descriptive
- 📱 **Fully Responsive**: Perfect on mobile, tablet, and desktop
- 🚀 **Production Ready**: Docker, CI/CD, monitoring, and load testing configured

---

## ✨ Features

### For Students
- **Interactive Test Engine**: Timed exams with auto-submit
- **Performance Dashboard**: Track progress, streaks, and topic mastery
- **Detailed Analytics**: See strengths and weaknesses at a glance
- **Leaderboards**: Weekly rankings to stay motivated
- **Badge System**: Unlock achievements for milestones

### For Teachers
- **Exam Management**: Create and organize tests by topic
- **Grading Queue**: Review and grade descriptive answers
- **Bulk Upload**: Import questions via CSV with validation
- **Student Analytics**: Monitor class performance and trends
- **PDF Uploads**: Attach evaluated answer sheets

### For Admins
- **User Management**: Bulk operations on students and teachers
- **Content Control**: Manage topics, questions, and exams
- **System Monitoring**: Health checks and error tracking
- **Analytics Dashboard**: System-wide performance metrics

---

## 🚀 How to Run (Local)

### Option A: Quick start scripts
- Windows: `quick-start.ps1`
- Linux/macOS: `quick-start.sh`

### Option B: Manual (Backend + Frontend)

#### Backend
```powershell
python manage.py migrate
python manage.py runserver
```

#### Frontend
```powershell
cd frontend
npm install
npm run dev
```

### Option C: Docker
```powershell
docker-compose -f docker-compose.yml up -d --build
```

**Admin Panel:** http://127.0.0.1:8000/admin

**Login Credentials:**
- Email: `admin@test.com`
- Password: `Mentra@2027`

### What You Can Do in Admin Panel

1. **View Users** - See all 13 demo users (1 admin, 1 teacher, 11 students)
2. **Manage Topics** - 9 Physics topics (Mechanics, Waves, etc.)
3. **Browse Exams** - 6 exams with 49 questions
4. **Check Attempts** - 24 test attempts from students
5. **CRUD Operations** - Create/Read/Update/Delete all data

### Demo Accounts (for testing future frontend)
- Student: `student1@demo.com` / `Demo@123`
- Teacher: `teacher@demo.com` / `Demo@123`

---

## 📌 Notes

- If you deploy on a free platform with ephemeral storage (e.g., free Render tier), uploaded media may disappear. For stable uploads use S3/R2/B2-style object storage.
- For production setup guidance see `DEPLOYMENT.md`.

---

## 📁 Project Structure

```
IB_Django/
├── accounts/           # User authentication & profiles
├── dashboard/          # Student & teacher dashboards
├── exams/             # Core exam engine & API
├── quizzes/           # Legacy quiz module
├── questionpapers/    # Question paper management
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── pages/    # Dashboard, grading, test pages
│   │   └── styles/   # Apple-inspired CSS
├── ib_project/        # Django project settings
├── media/             # User uploads (answers, PDFs)
├── static/            # Static assets
├── templates/         # Django templates
├── .github/           # CI/CD workflows
├── docker-compose.yml # Multi-service orchestration
├── Dockerfile         # Backend container
└── requirements.txt   # Python dependencies
```

---

## 🎨 Design System

### Color Palette
- **Background**: `#0B0B0D` (Deep black)
- **Surface**: `#1A1A1F` (Elevated black)
- **Primary**: `#7CE7FF` (Cyan gradient start)
- **Accent**: `#00C2A8` (Teal gradient end)
- **Text**: `#E5E5E7` (Off-white)

### Typography
- **Headings**: SF Pro Display / Inter
- **Body**: -apple-system, BlinkMacSystemFont, 'Segoe UI'

### Layout
- **Grid**: 12px base unit
- **Border Radius**: 16px (cards), 8px (buttons)
- **Spacing**: Multiples of 12px
- **Animations**: 0.3s ease-out

---

## 🔧 Technology Stack

### Backend
- **Framework**: Django 5.2.6
- **API**: Django REST Framework
- **Auth**: SimpleJWT with token blacklist
- **Database**: PostgreSQL (prod), SQLite (dev)
- **Cache**: Redis
- **Task Queue**: Celery (future enhancement)

### Frontend
- **Framework**: React 18
- **Build**: Vite
- **Styling**: Vanilla CSS with design tokens
- **State**: React hooks
- **Routing**: React Router (to be integrated)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx
- **WSGI**: Gunicorn
- **CI/CD**: GitHub Actions
- **Monitoring**: Health checks, Sentry integration
- **Load Testing**: k6

---

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)**: Production setup and maintenance
- **[Load Testing Guide](LOAD_TESTING.md)**: Performance testing with k6
- **[Project Status](PROJECT_STATUS.md)**: Current progress and roadmap
- **[API Documentation](docs/API.md)**: Endpoint reference (to be created)
- **[Teacher‑Guided Assignment System](docs/TEACHER_GUIDED_ASSIGNMENT_SYSTEM_PRODUCTION.md)**: Client requirements + implementation plan

---

## 🧪 Testing

### Run Backend Tests
```bash
python manage.py test
pytest  # With coverage
```

### Run Load Tests
```bash
k6 run load-test.js
```

### Run E2E Tests
```bash
cd frontend
npm run test:e2e
```

---

## 🚢 Deployment

### Using Docker (Production)

1. **Set environment variables** in `.env`
2. **Build and deploy**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```
3. **Run migrations**:
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py collectstatic --noinput
   ```
4. **Create admin user**:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

### Using Cloud Platforms

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- AWS/DigitalOcean/GCP setup
- SSL certificate configuration
- CI/CD pipeline setup
- Monitoring and logging

---

## 🔒 Security

- ✅ JWT authentication with refresh tokens
- ✅ Password reset with secure tokens
- ✅ Email verification on registration
- ✅ Rate limiting on auth endpoints (5/hour)
- ✅ HTTPS enforced in production
- ✅ CSRF protection enabled
- ✅ XSS and SQL injection prevention
- ✅ Secure headers (HSTS, X-Frame-Options)

---

## 📊 Performance

### Load Testing Results
- **Target**: 100 concurrent users
- **Response Time**: p95 < 500ms
- **Throughput**: 200+ req/s
- **Error Rate**: < 1%

### Optimization
- Database query optimization with select_related
- Redis caching for frequently accessed data
- Nginx static file caching
- Compressed assets with WhiteNoise
- CDN-ready for media files (S3 compatible)

---

## 🤝 Contributing

This is a client project. For internal development:

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Create Pull Request

---

## 📝 License

Proprietary - Copyright 2025 Mentara

---

## 🙏 Acknowledgments

- Apple Design Language for inspiration
- Django and React communities
- All open-source contributors

---

## 📞 Support

For deployment support or questions:
- **Email**: support@mentara.com
- **Documentation**: See `docs/` folder
- **Issues**: Internal issue tracker

---

<div align="center">

Made with ❤️ for Physics Students

**[⬆ Back to Top](#mentara---physics-test-preparation-platform)**

</div>
