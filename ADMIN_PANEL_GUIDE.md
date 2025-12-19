# Mentara Admin Panel - Complete Guide

## 🎯 Overview

Mentara now features a comprehensive **Apple-inspired admin panel** that allows administrators to manage all aspects of the platform from a beautiful, intuitive interface.

## 🚀 Quick Start

### 1. Start the Backend Server
```powershell
cd C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django
python manage.py runserver
```
Backend will run on: **http://127.0.0.1:8000**

### 2. Start the Frontend Server
```powershell
cd frontend
npm run dev
```
Frontend will run on: **http://localhost:3001**

### 3. Login as Admin
- Navigate to: **http://localhost:3001/login**
- Username: `admin`
- Password: `admin123`
- You'll be automatically redirected to: **http://localhost:3001/admin/dashboard**

## 🎨 Admin Panel Features

### 1. **Overview Dashboard**
- **Real-time Statistics**: Total users, exams, questions, topics
- **Activity Monitoring**: Active attempts, completion rates, average scores
- **Quick Actions**: Create exam, add questions, create topics
- **Recent Activity Feed**: Latest user actions and submissions

### 2. **Topics & Folders Management** 📚
**Features:**
- ✅ Create hierarchical topic structure (Topics → Subtopics)
- ✅ Add emoji icons for visual organization
- ✅ Expandable tree view with smooth animations
- ✅ Edit and delete topics with referential integrity
- ✅ See question and exam counts for each topic
- ✅ Search and filter functionality

**How to Use:**
1. Click "Topics & Folders" in sidebar
2. Click "Create Topic" button
3. Fill in: Name, Description, Icon (emoji)
4. To create subtopic: Hover over parent → Click folder+ icon
5. Edit/Delete: Hover over topic → Click edit/trash icons

### 3. **Question Bank Management** 📝
**Features:**
- ✅ Create questions with multiple types:
  - Single Choice (MCQ)
  - Multiple Choice (checkbox)
  - Fill in the Blank
  - Structured/Essay (file upload)
- ✅ Set difficulty levels (Easy/Medium/Hard)
- ✅ Add estimated time and marks
- ✅ Attach images and files
- ✅ Bulk upload questions via CSV/JSON
- ✅ Tag questions for organization
- ✅ Search and filter by topic/difficulty

**How to Use:**
1. Click "Question Bank" in sidebar
2. Click "Add Question" button
3. Select topic and question type
4. Enter question statement
5. Add answer choices (for MCQ/Multi)
6. Set difficulty, marks, time
7. Optional: Add explanation
8. Click "Create"

**Bulk Upload:**
1. Click "Bulk Upload" button
2. Select topic
3. Download template CSV/JSON
4. Fill with questions
5. Upload file

### 4. **Exams & Papers Management** 📄
**Features:**
- ✅ Create comprehensive exams
- ✅ Set duration, total marks, passing marks
- ✅ Select questions from question bank
- ✅ Configure visibility (Public/Premium/Private)
- ✅ Shuffle questions for each student
- ✅ Add special instructions
- ✅ View attempt statistics
- ✅ Edit and delete exams

**How to Use:**
1. Click "Exams & Papers" in sidebar
2. Click "Create Exam" button
3. Fill in exam details:
   - Title and description
   - Select topic
   - Set duration (minutes)
   - Set total marks and passing marks
   - Add instructions
   - Enable/disable shuffle
4. Click "Next: Select Questions"
5. Check questions to include
6. Click "Create Exam"

### 5. **User Management** 👥
**Features:**
- ✅ View all users with roles
- ✅ Filter by role (Admin/Teacher/Student)
- ✅ Search by name, email, username
- ✅ See user statistics (points, streak)
- ✅ View join date and status
- ✅ Edit and delete users
- ✅ Monitor active/inactive accounts

**How to Use:**
1. Click "User Management" in sidebar
2. Use search bar or role filter
3. Click edit icon to modify user
4. Click trash icon to delete (with confirmation)

### 6. **Analytics Dashboard** 📊
**Features:**
- ✅ Active users tracking
- ✅ Completion rate monitoring
- ✅ Average score trends
- ✅ Total attempts statistics
- ✅ Top performing topics
- ✅ Visual charts (coming soon)
- ✅ Export capabilities

**Metrics Displayed:**
- Active Users (last 7 days)
- Average Completion Rate
- Average Score across all tests
- Total Attempts count
- Top 5 performing topics

## 🔐 Fixed Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@mentara.com
- **Access:** Full admin panel access

### Teacher Account
- **Username:** `teacher`
- **Password:** `teacher123`
- **Email:** teacher@mentara.com
- **Access:** Teacher dashboard (grading, content creation)

### Student Registration
- Students can sign up at: http://localhost:3001/signup
- Auto-assigned STUDENT role
- Access to test-taking interface

## 🎯 Workflow Examples

### Creating a Complete Test Series

#### Step 1: Create Topic Structure
1. Go to Topics & Folders
2. Create main topic: "Physics" (icon: 🔬)
3. Create subtopics:
   - Click folder+ on "Physics"
   - Add "Mechanics" (icon: ⚙️)
   - Add "Thermodynamics" (icon: 🔥)
   - Add "Electromagnetism" (icon: ⚡)

#### Step 2: Add Questions
1. Go to Question Bank
2. Click "Add Question"
3. Create questions for each subtopic:
   ```
   Example MCQ:
   Topic: Mechanics
   Statement: "What is Newton's First Law?"
   Choices: 
     - An object in motion stays in motion
     - Force = Mass × Acceleration
     - Every action has equal reaction
     - Energy cannot be created
   Correct Answer: An object in motion stays in motion
   Difficulty: Easy
   Marks: 1
   Time: 30 seconds
   ```
4. Repeat for 20-30 questions

**Or use Bulk Upload:**
1. Download CSV template
2. Fill with format:
   ```csv
   topic_id,type,statement,choices,correct_answer,difficulty,marks,estimated_time
   1,MCQ,"What is Newton's First Law?","['A','B','C','D']","A",EASY,1,30
   ```
3. Upload file

#### Step 3: Create Exam
1. Go to Exams & Papers
2. Click "Create Exam"
3. Fill details:
   - Title: "Physics Mid-Term Exam"
   - Topic: Physics > Mechanics
   - Duration: 60 minutes
   - Total Marks: 50
   - Passing Marks: 20
   - Visibility: Public
4. Select 50 questions from question bank
5. Click "Create Exam"

#### Step 4: Monitor & Grade
1. Students take the test
2. View submissions in Analytics
3. Teachers grade structured responses
4. System auto-calculates scores and percentiles

## 🎨 Design System

### Color Palette
- **Primary Blue:** #7CE7FF (Icy Blue)
- **Secondary Mint:** #A6FFCB (Mint Green)
- **Background Dark:** #0A0A0C
- **Surface:** #111216
- **Text Primary:** #FFFFFF
- **Text Secondary:** #9CA3AF

### Components
- **Cards:** Elevated with soft shadows, rounded corners
- **Buttons:** Primary (gradient), Secondary (outline), Ghost
- **Inputs:** Dark theme with focus states
- **Modals:** Backdrop blur with smooth animations
- **Tables:** Hover states, responsive

### Animations
- **Page Transitions:** 200ms ease-out
- **Modal Open:** Scale + Fade (160ms)
- **Hover Effects:** Lift + Shadow grow
- **Loading States:** Skeleton screens

## 📱 Responsive Design

### Desktop (1920px+)
- Full sidebar visible
- 4-column grid for cards
- Expanded table view
- Large modal dialogs

### Tablet (768px - 1919px)
- Collapsible sidebar
- 2-3 column grids
- Responsive tables
- Medium modals

### Mobile (< 768px)
- Hamburger menu
- Single column layout
- Touch-optimized buttons
- Full-screen modals
- Bottom sheet navigation

## 🔧 API Endpoints

### Admin APIs
```
GET  /api/admin/overview/          # Dashboard stats
GET  /api/admin/users/             # All users list
DELETE /api/admin/users/{id}/      # Delete user
GET  /api/admin/analytics/         # Analytics data
```

### Content Management
```
GET    /api/topics/                # List topics
POST   /api/topics/                # Create topic
PUT    /api/topics/{id}/           # Update topic
DELETE /api/topics/{id}/           # Delete topic

GET    /api/questions/             # List questions
POST   /api/questions/             # Create question
POST   /api/questions/bulk/        # Bulk upload
PUT    /api/questions/{id}/        # Update question
DELETE /api/questions/{id}/        # Delete question

GET    /api/exams/                 # List exams
POST   /api/exams/                 # Create exam
POST   /api/exams/{id}/add-questions/  # Add questions to exam
PUT    /api/exams/{id}/            # Update exam
DELETE /api/exams/{id}/            # Delete exam
```

## 🐛 Troubleshooting

### Issue: Admin panel not loading
**Solution:**
1. Check both servers are running
2. Verify you're logged in as admin
3. Check browser console for errors
4. Clear browser cache

### Issue: Can't create topics/questions
**Solution:**
1. Verify admin authentication
2. Check backend console for errors
3. Ensure database migrations are applied
4. Check CORS settings

### Issue: Bulk upload fails
**Solution:**
1. Use correct CSV/JSON format
2. Ensure topic exists
3. Check file encoding (UTF-8)
4. Verify all required fields present

### Issue: Users not appearing
**Solution:**
1. Run: `python manage.py setup_fixed_users`
2. Check database connectivity
3. Verify API endpoint: /api/admin/users/

## 🚀 Next Steps

### Immediate Priorities
1. ✅ Admin panel complete
2. ⏳ Teacher grading interface
3. ⏳ Student test-taking engine with timer
4. ⏳ Leaderboard and gamification
5. ⏳ Analytics charts (Recharts integration)

### Future Enhancements
- Real-time notifications (WebSocket)
- Advanced analytics with graphs
- Bulk user import
- Email notifications
- PDF report generation
- Mobile app (React Native)

## 📞 Support

For issues or questions:
1. Check UNDERSTANDING_THE_CODE.md
2. Review AUTHENTICATION_TESTING.md
3. Check backend logs
4. Check frontend console

## 🎉 Success Checklist

- ✅ Admin can login and access panel
- ✅ Topics can be created with hierarchy
- ✅ Questions can be added (manual + bulk)
- ✅ Exams can be created with question selection
- ✅ Users can be viewed and managed
- ✅ Analytics dashboard shows statistics
- ✅ All CRUD operations work smoothly
- ✅ UI is responsive and beautiful
- ✅ Animations are smooth and professional

**Congratulations! Your Mentara admin panel is fully operational! 🎊**
