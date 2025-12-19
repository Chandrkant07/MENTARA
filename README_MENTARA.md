# 🎯 Mentara - Premium Test Prep Platform

<div align="center">

![Mentara Logo](https://via.placeholder.com/150x150/7CE7FF/0B0B0D?text=M)

**India's #1 AI-Powered Test Preparation Platform**

[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[🚀 Live Demo](#) | [📖 Documentation](#features) | [🎨 Screenshots](#screenshots)

</div>

---

## ✨ Overview

**Mentara** is a premium, Apple-inspired test preparation platform designed to revolutionize how students prepare for exams. Built with cutting-edge technology and a focus on user experience, Mentara provides:

- 🎯 **Smart Test Engine** with adaptive difficulty
- 📊 **Advanced Analytics** with detailed performance insights
- ⏱️ **Real-time Testing** with auto-save and timer
- 🏆 **Gamification** with badges, streaks, and leaderboards
- 👨‍🏫 **Teacher Support** with grading and feedback tools
- 🌙 **Dark Mode First** premium UI/UX

---

## 🎨 Screenshots

<div align="center">

### Landing Page
![Landing](https://via.placeholder.com/800x400/0B0B0D/7CE7FF?text=Premium+Landing+Page)

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/111216/A6FFCB?text=Student+Dashboard)

### Test Taking
![Test Taking](https://via.placeholder.com/800x400/0B0B0D/7CE7FF?text=Test+Taking+Interface)

</div>

---

## 🚀 Features

### For Students
- ✅ **10,000+ Practice Questions** across multiple subjects
- ✅ **Personalized Dashboard** with progress tracking
- ✅ **Real-time Timer** with per-question tracking
- ✅ **Auto-save Functionality** - never lose your progress
- ✅ **Instant Results** with detailed explanations
- ✅ **Performance Analytics** by topic and difficulty
- ✅ **Leaderboard & Rankings** to compete with peers
- ✅ **Badges & Achievements** for motivation
- ✅ **Streak System** to build consistent study habits

### For Teachers
- ✅ **Easy Content Management** - create topics, subtopics, questions
- ✅ **Bulk Upload** - CSV/JSON import for questions
- ✅ **Exam Builder** with question bank
- ✅ **Student Monitoring** - track class performance
- ✅ **Manual Grading** for structured questions
- ✅ **PDF Upload** for evaluated answer sheets
- ✅ **Feedback System** with remarks

### For Admins
- ✅ **Complete Control** over platform content
- ✅ **User Management** - manage students and teachers
- ✅ **Analytics Dashboard** - platform-wide insights
- ✅ **Content Moderation** - approve/reject questions
- ✅ **System Settings** - configure platform behavior

---

## 🛠️ Tech Stack

### Backend
- **Django 4.2** - Python web framework
- **Django REST Framework** - API development
- **Simple JWT** - Authentication
- **PostgreSQL** (Production) / **SQLite** (Development)
- **Redis** - Caching and sessions

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library
- **Recharts** - Data visualization
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **GitHub Actions** - CI/CD

---

## 📦 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/mentara.git
cd mentara
```

2. **Create virtual environment**
```bash
python -m venv IBenv
# Windows
IBenv\Scripts\activate
# Mac/Linux
source IBenv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Create fixed admin and teacher accounts**
```bash
python manage.py setup_fixed_users
```

This will create:
- **Admin**: username=`admin`, password=`admin123`
- **Teacher**: username=`teacher`, password=`teacher123`

⚠️ **Important**: Change these passwords after first login!

6. **Start development server**
```bash
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

4. **Start development server**
```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

---

## 🎯 Quick Start Guide

### 1. Access the Platform

Visit `http://localhost:3000` in your browser

### 2. Login Options

**As Admin:**
- Username: `admin`
- Password: `admin123`
- Access: Full platform control + teacher + student features

**As Teacher:**
- Username: `teacher`
- Password: `teacher123`
- Access: Create content + grade tests + view analytics

**As Student:**
- Sign up with a new account
- Access: Take tests + view results + track progress

### 3. Admin Tasks

1. **Create Topics**
   - Go to Admin Dashboard → Topics
   - Click "Create Topic"
   - Add name, description, and icon

2. **Add Questions**
   - Select a topic
   - Click "Add Question"
   - Choose question type (MCQ, Multi-select, Fill-in-blank, Structured)
   - Add statement, choices, correct answer, difficulty, marks

3. **Bulk Upload Questions**
   - Download CSV template
   - Fill in questions
   - Upload CSV file

4. **Create Exams**
   - Go to Exams → Create Exam
   - Select topic and questions
   - Set duration and total marks
   - Publish exam

### 4. Teacher Tasks

1. **Monitor Students**
   - View class performance
   - Track individual progress
   - Identify weak areas

2. **Grade Submissions**
   - Go to Grading Dashboard
   - Select pending submissions
   - Add marks and feedback
   - Upload evaluated PDFs

### 5. Student Tasks

1. **Browse Tests**
   - Explore available tests by topic
   - View difficulty and duration

2. **Take Test**
   - Click "Start Test"
   - Answer questions (auto-saves every 10s)
   - Use navigation to move between questions
   - Flag questions for review
   - Submit test

3. **View Results**
   - Instant score display
   - Per-question breakdown
   - Topic-wise analysis
   - Compare with peers

4. **Track Progress**
   - Dashboard shows overall stats
   - View badges and achievements
   - Check current streak
   - See weak topics for improvement

---

## 🎨 Design System

### Color Palette

```css
/* Dark Theme */
--dark-base: #0B0B0D;
--dark-surface: #111216;
--dark-elevated: #1A1B20;

/* Primary (Icy Blue) */
--primary-200: #7CE7FF;
--primary-500: #00B8E6;

/* Secondary (Mint Green) */
--secondary-200: #A6FFCB;
--secondary-500: #00E676;

/* Status */
--success: #4ADE80;
--danger: #FB7185;
--warning: #FBBF24;
```

### Typography
- **Font**: Inter, SF Pro Display
- **Heading 1**: 60px, Bold
- **Heading 2**: 48px, Bold
- **Body**: 16px, Regular

### Components
- **Buttons**: 24px border radius, smooth hover effects
- **Cards**: 16px border radius, soft shadows
- **Inputs**: 12px border radius, focus states

---

## 📊 API Documentation

### Authentication

**Register**
```http
POST /api/accounts/api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "password_confirm": "secure_password",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Login**
```http
POST /api/accounts/api/auth/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "STUDENT",
    ...
  }
}
```

### Exams

**Start Exam**
```http
GET /api/exams/{exam_id}/start/
Authorization: Bearer {access_token}

Response:
{
  "attempt_id": 123,
  "expires_at": "2025-12-02T18:00:00Z",
  "questions": [...]
}
```

**Submit Exam**
```http
POST /api/exams/{exam_id}/submit/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "attempt_id": 123,
  "responses": [
    {
      "question_id": 1,
      "answer_payload": {"answer": "A"},
      "time_spent_seconds": 45
    }
  ]
}
```

[📖 Full API Documentation](./docs/API.md)

---

## 🧪 Testing

### Run Backend Tests
```bash
python manage.py test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run E2E Tests
```bash
cd frontend
npx playwright test
```

---

## 🚀 Deployment

### Docker Deployment

1. **Build images**
```bash
docker-compose build
```

2. **Run containers**
```bash
docker-compose up -d
```

3. **Access application**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Admin: `http://localhost:8000/admin`

### Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

---

## 📝 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost:5432/mentara
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Design Inspiration**: Apple, Testbook, Duolingo
- **Icons**: Lucide Icons
- **Fonts**: Inter (Google Fonts)
- **UI Components**: Tailwind CSS

---

## 📞 Support

Need help? Reach out to us:

- 📧 Email: support@mentara.com
- 💬 Discord: [Join our community](https://discord.gg/mentara)
- 🐦 Twitter: [@MentaraApp](https://twitter.com/MentaraApp)
- 📚 Documentation: [docs.mentara.com](https://docs.mentara.com)

---

## 🗺️ Roadmap

### Q1 2025
- [ ] Google OAuth integration
- [ ] Mobile app (React Native)
- [ ] Adaptive testing algorithm
- [ ] WhatsApp notifications

### Q2 2025
- [ ] Live proctoring
- [ ] Video explanations
- [ ] Discussion forums
- [ ] AI-powered recommendations

### Q3 2025
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Custom branding for institutions
- [ ] Integration with LMS platforms

---

<div align="center">

**Built with ❤️ by DJ Brothers**

⭐ Star us on GitHub — it motivates us a lot!

[Website](https://mentara.com) • [Documentation](https://docs.mentara.com) • [Blog](https://blog.mentara.com)

</div>
