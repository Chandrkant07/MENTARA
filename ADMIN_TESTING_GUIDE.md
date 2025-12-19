# 🧪 ADMIN FUNCTIONALITY TESTING GUIDE

**Product:** Mentara Admin Panel  
**Date:** December 2, 2025  
**Test Environment:** Local Development

---

## 🚀 QUICK START - Before Testing

### 1. Start Both Servers

**Terminal 1 - Backend:**
```powershell
cd C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django
python manage.py runserver
```
✅ Backend should run on: http://127.0.0.1:8000

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\dhiba\OneDrive\ALLDOCS\fr\fr\IB_Django\IB_Django\frontend
npm run dev
```
✅ Frontend should run on: http://localhost:3001

### 2. Fixed Admin Credentials
```
Username: admin
Password: admin123
```

---

## 📝 TEST SUITE 1: LOGIN & AUTHENTICATION

### Test Case 1.1: Admin Login
**Steps:**
1. Open browser: http://localhost:3001/login
2. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
3. Click "Login" button

**Expected Results:**
- ✅ Redirects to `/admin/dashboard`
- ✅ Shows "Welcome back, admin" message
- ✅ Admin sidebar visible with 6 sections

**Screenshot Checkpoints:**
- [ ] Login form displays correctly
- [ ] No console errors in browser DevTools (F12)
- [ ] Admin dashboard loads within 2 seconds

---

### Test Case 1.2: Invalid Login
**Steps:**
1. Go to http://localhost:3001/login
2. Enter wrong password: `wrongpass`
3. Click "Login"

**Expected Results:**
- ✅ Error toast: "Invalid credentials"
- ✅ Stays on login page
- ✅ No redirect occurs

---

### Test Case 1.3: JWT Token Refresh
**Steps:**
1. Login as admin
2. Wait 30 minutes (or change token expiry to 1 minute in settings)
3. Try navigating to any admin page

**Expected Results:**
- ✅ Token auto-refreshes via axios interceptor
- ✅ No logout or 401 error
- ✅ Seamless navigation

---

## 📊 TEST SUITE 2: OVERVIEW DASHBOARD

### Test Case 2.1: Real-Time Statistics
**Steps:**
1. Login as admin
2. Navigate to Overview section (default landing)
3. Verify all stat cards display numbers

**Expected Results:**
- ✅ Total Users count (should be ≥ 3)
- ✅ Total Students count
- ✅ Total Teachers count
- ✅ Total Topics count
- ✅ Total Questions count
- ✅ Total Exams count
- ✅ Active Attempts count
- ✅ Average Score percentage

**Data Verification:**
```powershell
# Run in backend terminal to verify counts
python manage.py shell

from accounts.models import CustomUser
from exams.models import Topic, Question, Exam, Attempt

print("Users:", CustomUser.objects.count())
print("Topics:", Topic.objects.count())
print("Questions:", Question.objects.count())
print("Exams:", Exam.objects.count())
print("Attempts:", Attempt.objects.count())
```

**Screenshot Checkpoints:**
- [ ] All 8 stat cards visible
- [ ] Numbers match database counts
- [ ] Icons display correctly (📊, 👥, 📚, etc.)
- [ ] No "0" values if data exists

---

### Test Case 2.2: Empty State Handling
**Steps:**
1. If Recent Activity is empty
2. Check for empty state message

**Expected Results:**
- ✅ Shows "No recent activity" message
- ✅ No console errors
- ✅ UI remains stable

---

## 📂 TEST SUITE 3: TOPIC MANAGER

### Test Case 3.1: Create Root Topic
**Steps:**
1. Click "Topics" in sidebar
2. Click "Add New Topic" button
3. Fill form:
   - Name: `Physics`
   - Description: `Science of matter and energy`
   - Icon: `⚛️`
   - Parent Topic: `None` (leave empty for root)
4. Click "Create"

**Expected Results:**
- ✅ Success toast: "Topic created successfully"
- ✅ New topic appears in list
- ✅ Topic card shows name and icon
- ✅ No page refresh (AJAX update)

**Screenshot Checkpoints:**
- [ ] Create form modal appears
- [ ] All fields editable
- [ ] Topic appears immediately after creation

---

### Test Case 3.2: Create Subtopic
**Steps:**
1. In Topics page, find "Physics" topic
2. Click "Add New Topic"
3. Fill form:
   - Name: `Mechanics`
   - Description: `Study of motion and forces`
   - Icon: `🔧`
   - Parent Topic: Select `Physics` from dropdown
4. Click "Create"

**Expected Results:**
- ✅ Subtopic created under Physics
- ✅ Tree view shows hierarchy:
  ```
  ⚛️ Physics
    └── 🔧 Mechanics
  ```
- ✅ Indentation visible in UI

---

### Test Case 3.3: Edit Topic
**Steps:**
1. Find "Physics" topic
2. Click "Edit" button (pencil icon)
3. Change name to: `Physics - Advanced`
4. Click "Update"

**Expected Results:**
- ✅ Topic name updates in list
- ✅ Success toast appears
- ✅ Changes persist after page refresh

---

### Test Case 3.4: Delete Topic
**Steps:**
1. Create a test topic: "Delete Me"
2. Click "Delete" button (trash icon)
3. Confirm deletion in modal

**Expected Results:**
- ✅ Confirmation modal appears
- ✅ Topic removed from list
- ✅ Success toast: "Topic deleted"
- ✅ Subtopics also deleted (cascade)

**⚠️ Warning Test:**
- Try deleting a topic with questions/exams
- Should show warning or prevent deletion

---

### Test Case 3.5: Search Topics
**Steps:**
1. Create 5+ topics with different names
2. Use search bar: type "Phys"

**Expected Results:**
- ✅ Filters topics in real-time
- ✅ Only matching topics shown
- ✅ Case-insensitive search

---

### Test Case 3.6: Topic Hierarchy Display
**Steps:**
1. Create structure:
   ```
   Physics
   ├── Mechanics
   │   └── Kinematics
   └── Thermodynamics
   Chemistry
   ```
2. View Topics page

**Expected Results:**
- ✅ Tree structure clearly visible
- ✅ Indentation shows depth
- ✅ Parent-child relationships correct

---

## ❓ TEST SUITE 4: QUESTION MANAGER

### Test Case 4.1: Create MCQ Question
**Steps:**
1. Click "Questions" in sidebar
2. Click "Add Question"
3. Fill form:
   - **Type:** MCQ (Single correct)
   - **Topic:** Select "Physics"
   - **Statement:** `What is the SI unit of force?`
   - **Choices:**
     - A: `Newton`
     - B: `Joule`
     - C: `Watt`
     - D: `Pascal`
   - **Correct Answer:** Select `A`
   - **Difficulty:** Medium
   - **Marks:** 1
   - **Estimated Time:** 30 seconds
4. Click "Create"

**Expected Results:**
- ✅ Question created successfully
- ✅ Appears in question list
- ✅ Shows type badge: "MCQ"
- ✅ Displays topic name

**Screenshot Checkpoints:**
- [ ] All 4 choices visible
- [ ] Correct answer highlighted in green
- [ ] Difficulty badge colored (Medium = Yellow)

---

### Test Case 4.2: Create Multi-Select Question
**Steps:**
1. Add Question → Type: MULTI
2. Statement: `Which are scalar quantities?`
3. Choices:
   - A: `Speed`
   - B: `Velocity`
   - C: `Distance`
   - D: `Acceleration`
4. Correct Answers: Select `A` AND `C` (checkbox)
5. Create

**Expected Results:**
- ✅ Multiple correct answers saved
- ✅ Type badge shows "MULTI"
- ✅ Both A and C marked correct

---

### Test Case 4.3: Create Fill-in-Blank Question
**Steps:**
1. Add Question → Type: FIB
2. Statement: `The acceleration due to gravity is _____ m/s²`
3. Correct Answer: `9.8` or `9.81`
4. Create

**Expected Results:**
- ✅ Single text input for answer
- ✅ Accepts multiple acceptable answers (array)

---

### Test Case 4.4: Create Structured Question
**Steps:**
1. Add Question → Type: STRUCT
2. Statement: `Derive the equation F = ma from Newton's laws`
3. Marks: 5
4. Create

**Expected Results:**
- ✅ No choices field (structured type)
- ✅ Requires teacher grading flag set
- ✅ Higher marks allowed (5)

---

### Test Case 4.5: Bulk Upload via CSV
**Preparation - Create CSV file:**
```csv
topic_id,type,statement,choices,correct_answers,difficulty,marks,estimated_time
1,MCQ,"What is 2+2?","2|3|4|5","C",Easy,1,15
1,MULTI,"Even numbers?","1|2|3|4","B|D",Medium,2,30
```

**Steps:**
1. Click "Bulk Upload" button
2. Select CSV file
3. Click "Upload"

**Expected Results:**
- ✅ Success message: "Created 2 questions"
- ✅ Both questions appear in list
- ✅ Error report if any row fails

**Error Handling Test:**
- Upload invalid CSV (missing columns)
- Should show: "CSV parse error: missing column 'topic_id'"

---

### Test Case 4.6: Filter Questions
**Steps:**
1. Create 10+ questions across different topics/difficulties
2. Use filters:
   - Filter by Topic: "Physics"
   - Filter by Difficulty: "Medium"

**Expected Results:**
- ✅ Only matching questions shown
- ✅ Filter count updates
- ✅ Clear filter button resets

---

### Test Case 4.7: Edit Question
**Steps:**
1. Find any question
2. Click "Edit" button
3. Change statement or choices
4. Click "Update"

**Expected Results:**
- ✅ Changes saved to database
- ✅ List updates immediately

---

### Test Case 4.8: Delete Question
**Steps:**
1. Select a question not used in any exam
2. Click "Delete"
3. Confirm

**Expected Results:**
- ✅ Question removed from list
- ✅ Database record deleted

**⚠️ Referential Integrity Test:**
- Try deleting a question used in an exam
- Should prevent deletion or show warning

---

## 📝 TEST SUITE 5: EXAM MANAGER

### Test Case 5.1: Create Exam - Step 1 (Metadata)
**Steps:**
1. Click "Exams" in sidebar
2. Click "Create Exam"
3. Fill metadata form:
   - **Title:** `Physics Midterm 2025`
   - **Topic:** Select "Physics"
   - **Duration:** 60 minutes
   - **Total Marks:** 50
   - **Shuffle Questions:** Checked
   - **Visibility:** Public
4. Click "Next"

**Expected Results:**
- ✅ Form validation passes
- ✅ Advances to Step 2 (Question Selection)
- ✅ Shows "Select Questions" interface

---

### Test Case 5.2: Create Exam - Step 2 (Question Selection)
**Steps:**
1. In Question Selection screen
2. Search/filter questions by topic "Physics"
3. Select 10 questions (checkboxes)
4. Verify total marks = 50
5. Click "Create Exam"

**Expected Results:**
- ✅ Exam created successfully
- ✅ Questions linked to exam via `ExamQuestion` model
- ✅ Appears in exam list
- ✅ Shows: "10 questions, 50 marks, 60 mins"

**Validation Tests:**
- Try creating exam with 0 questions → Should show error
- Try exceeding total marks → Should show warning

---

### Test Case 5.3: View Exam Details
**Steps:**
1. Click on "Physics Midterm 2025" exam
2. View details page

**Expected Results:**
- ✅ Shows exam metadata
- ✅ Lists all questions in order
- ✅ Shows question types and marks
- ✅ Edit/Delete buttons visible

---

### Test Case 5.4: Edit Exam
**Steps:**
1. Click "Edit" on any exam
2. Change duration to 90 minutes
3. Add/remove questions
4. Click "Update"

**Expected Results:**
- ✅ Changes saved
- ✅ Question order updated
- ✅ Total marks recalculated

---

### Test Case 5.5: Delete Exam
**Steps:**
1. Create a test exam
2. Click "Delete"
3. Confirm deletion

**Expected Results:**
- ✅ Exam removed from list
- ✅ `ExamQuestion` records cascade deleted
- ✅ Attempts remain (for data integrity)

**⚠️ Safety Test:**
- Try deleting exam with student attempts
- Should show warning: "X students have taken this exam"

---

### Test Case 5.6: Question Order Management
**Steps:**
1. Edit an exam
2. Drag-and-drop questions to reorder
3. Save

**Expected Results:**
- ✅ New order persists
- ✅ `order` field in `ExamQuestion` updated

---

## 👥 TEST SUITE 6: USER MANAGER

### Test Case 6.1: View All Users
**Steps:**
1. Click "Users" in sidebar
2. View user list table

**Expected Results:**
- ✅ Shows all users in table format
- ✅ Columns: Username, Email, Name, Role, Status, Date Joined
- ✅ Role badges colored:
  - Admin: Red
  - Teacher: Blue
  - Student: Green

---

### Test Case 6.2: Filter Users by Role
**Steps:**
1. Click "All Roles" dropdown
2. Select "Students"

**Expected Results:**
- ✅ Only student users shown
- ✅ Count updates
- ✅ Other roles hidden

**Repeat for:**
- Filter by Teachers
- Filter by Admins

---

### Test Case 6.3: Search Users
**Steps:**
1. Type "adm" in search bar

**Expected Results:**
- ✅ Filters users by username/email/name
- ✅ Real-time search (debounced)
- ✅ Case-insensitive

---

### Test Case 6.4: View User Details
**Steps:**
1. Click on any user row
2. View modal/details panel

**Expected Results:**
- ✅ Shows full user profile
- ✅ Displays:
  - Username, Email, Name
  - Role, Join Date
  - Total Points, Current Streak
  - Premium Status
  - Tests Taken count

---

### Test Case 6.5: Edit User
**Steps:**
1. Click "Edit" on a student user
2. Change role to "Teacher"
3. Save

**Expected Results:**
- ✅ Role updated in database
- ✅ User added to "Teachers" group
- ✅ Table updates immediately

---

### Test Case 6.6: Delete User
**Steps:**
1. Create a test user via Django admin or API
2. In User Manager, click "Delete"
3. Confirm

**Expected Results:**
- ✅ User removed from list
- ✅ Database record deleted
- ✅ Related attempts preserved (soft delete recommended)

**⚠️ Safety Tests:**
- Try deleting yourself (logged-in admin) → Should prevent
- Try deleting user with exam attempts → Should warn

---

### Test Case 6.7: Pagination
**Steps:**
1. If more than 20 users, check pagination
2. Click "Next Page"

**Expected Results:**
- ✅ Shows next 20 users
- ✅ Page number updates
- ✅ Prev/Next buttons work

---

## 📈 TEST SUITE 7: ANALYTICS PANEL

### Test Case 7.1: View Analytics Dashboard
**Steps:**
1. Click "Analytics" in sidebar
2. View analytics page

**Expected Results:**
- ✅ Shows 4 key metrics:
  - Active Users (last 7 days)
  - Completion Rate %
  - Average Score %
  - Total Attempts
- ✅ All values are real numbers (not 0)

---

### Test Case 7.2: Top Topics Performance
**Steps:**
1. Scroll to "Top Topics" section
2. View list of topics with attempt counts

**Expected Results:**
- ✅ Topics ordered by attempt count (descending)
- ✅ Shows topic name, attempts, avg score
- ✅ Maximum 10 topics displayed
- ✅ Empty state if no data: "No topic data available"

**Data Verification:**
```python
# Run in Django shell
from exams.models import Topic
from django.db.models import Count, Avg, Q

top_topics = Topic.objects.annotate(
    attempt_count=Count('exams__attempts', filter=Q(exams__attempts__status='COMPLETED')),
    avg_score=Avg('exams__attempts__percentage', filter=Q(exams__attempts__status='COMPLETED'))
).filter(attempt_count__gt=0).order_by('-attempt_count')[:10]

for t in top_topics:
    print(f"{t.name}: {t.attempt_count} attempts, {t.avg_score:.2f}% avg")
```

---

### Test Case 7.3: Real-Time Data Update
**Steps:**
1. Note current "Total Attempts" count
2. Open another browser tab
3. Login as student and take a test
4. Return to Analytics page
5. Refresh

**Expected Results:**
- ✅ Attempt count increases by 1
- ✅ Average score recalculated
- ✅ Completion rate updates

---

### Test Case 7.4: Empty State Handling
**Steps:**
1. If no attempts exist in database
2. View Analytics page

**Expected Results:**
- ✅ Shows "0" for counts (not errors)
- ✅ Top Topics shows: "No topic data available"
- ✅ No console errors

---

## 🔐 TEST SUITE 8: SECURITY & PERMISSIONS

### Test Case 8.1: Non-Admin Access Prevention
**Steps:**
1. Logout from admin account
2. Login as student: `student` / `student123`
3. Try accessing: http://localhost:3001/admin/dashboard

**Expected Results:**
- ✅ Redirects to login or 403 error
- ✅ Message: "Admin access required"
- ✅ Cannot see admin panel

---

### Test Case 8.2: JWT Token Expiry
**Steps:**
1. Login as admin
2. In DevTools Console, run:
   ```javascript
   localStorage.setItem('access_token', 'invalid_token')
   ```
3. Try navigating to Topics page

**Expected Results:**
- ✅ Redirects to login
- ✅ Message: "Session expired, please login"

---

### Test Case 8.3: CSRF Protection
**Steps:**
1. Try making POST request without CSRF token
2. Use Postman/curl:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/topics/ -H "Content-Type: application/json" -d '{"name":"Test"}'
   ```

**Expected Results:**
- ✅ Returns 403 Forbidden
- ✅ Message: "CSRF verification failed"

---

### Test Case 8.4: SQL Injection Prevention
**Steps:**
1. In Topics search bar, enter:
   ```
   Physics' OR '1'='1
   ```
2. Search

**Expected Results:**
- ✅ No SQL injection occurs
- ✅ Treated as literal string search
- ✅ No database error

---

## 🚨 TEST SUITE 9: ERROR HANDLING

### Test Case 9.1: Network Error Simulation
**Steps:**
1. Stop backend server (Ctrl+C in backend terminal)
2. Try creating a topic in admin panel

**Expected Results:**
- ✅ Error toast: "Network error, please try again"
- ✅ No crash or blank page
- ✅ Form data preserved

---

### Test Case 9.2: 500 Server Error
**Steps:**
1. Temporarily break backend code (e.g., typo in views.py)
2. Try loading Topics page

**Expected Results:**
- ✅ Error message displayed
- ✅ User not logged out
- ✅ Can retry/navigate back

---

### Test Case 9.3: Validation Errors
**Steps:**
1. Try creating topic with empty name
2. Submit form

**Expected Results:**
- ✅ Frontend validation prevents submit
- ✅ Red border on empty field
- ✅ Error message: "Name is required"

---

### Test Case 9.4: Duplicate Entry
**Steps:**
1. Create topic "Physics"
2. Try creating another topic "Physics"

**Expected Results:**
- ✅ Backend returns 400 error
- ✅ Toast: "Topic with this name already exists"

---

## 📱 TEST SUITE 10: RESPONSIVENESS

### Test Case 10.1: Mobile View (375px)
**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone SE (375px width)
4. Navigate through admin panel

**Expected Results:**
- ✅ Sidebar collapses to hamburger menu
- ✅ Tables scroll horizontally
- ✅ Forms stack vertically
- ✅ All buttons clickable

---

### Test Case 10.2: Tablet View (768px)
**Steps:**
1. Set viewport to iPad (768px)
2. Test all pages

**Expected Results:**
- ✅ Sidebar visible (narrow)
- ✅ Content responsive
- ✅ No horizontal scroll

---

### Test Case 10.3: Desktop View (1920px)
**Steps:**
1. Test on large monitor

**Expected Results:**
- ✅ Content centered (max-width)
- ✅ Proper whitespace
- ✅ No elements cut off

---

## 🎯 TEST SUITE 11: PERFORMANCE

### Test Case 11.1: Page Load Time
**Steps:**
1. Open DevTools → Network tab
2. Clear cache (Ctrl+Shift+Delete)
3. Navigate to Admin Dashboard
4. Check load time

**Expected Results:**
- ✅ Initial load < 2 seconds
- ✅ Dashboard data loads < 1 second
- ✅ No 404 errors in Network tab

---

### Test Case 11.2: Bulk Operations
**Steps:**
1. Upload CSV with 100 questions
2. Monitor response time

**Expected Results:**
- ✅ Completes in < 5 seconds
- ✅ No timeout errors
- ✅ Success report shows count

---

### Test Case 11.3: Large Data Set
**Steps:**
1. Create 50+ topics
2. Navigate to Topics page
3. Check render time

**Expected Results:**
- ✅ Renders in < 1 second
- ✅ Smooth scrolling
- ✅ Search filters fast

---

## ✅ FINAL CHECKLIST

### Pre-Testing Setup
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3001
- [ ] Database has test data
- [ ] Admin user exists (admin/admin123)

### Core Functionality Tests
- [ ] Login/Logout works
- [ ] Overview dashboard loads
- [ ] Topics CRUD complete
- [ ] Questions CRUD complete
- [ ] Exams CRUD complete
- [ ] Users management works
- [ ] Analytics displays data

### Data Integrity Tests
- [ ] Real-time stats accurate
- [ ] No static/mock data
- [ ] Database queries optimized
- [ ] Relationships maintained

### Security Tests
- [ ] Non-admin blocked
- [ ] JWT tokens work
- [ ] CSRF protection active
- [ ] SQL injection prevented

### UI/UX Tests
- [ ] Dark theme consistent
- [ ] Animations smooth
- [ ] Toast notifications work
- [ ] Mobile responsive

### Performance Tests
- [ ] Load time < 2 seconds
- [ ] No memory leaks
- [ ] API responses fast
- [ ] No console errors

---

## 🐛 BUG REPORTING TEMPLATE

If you find issues, document them:

```markdown
**Bug ID:** ADMIN-001
**Title:** Topics page not loading
**Severity:** High / Medium / Low
**Steps to Reproduce:**
1. Login as admin
2. Click Topics
3. Page shows loading forever

**Expected:** Topics list should display
**Actual:** Infinite loading spinner

**Console Errors:**
```
Error: Network Error at axios.js:123
```

**Screenshot:** [Attach screenshot]
**Browser:** Chrome 120
**OS:** Windows 11
```

---

## 📞 SUPPORT

**Issues Found?** Check:
1. Backend logs in terminal
2. Browser console (F12)
3. Network tab for failed requests
4. Database data exists

**Common Fixes:**
- Clear browser cache (Ctrl+Shift+Delete)
- Restart both servers
- Run migrations: `python manage.py migrate`
- Check CORS settings

---

**Test Completed By:** _________________  
**Date:** _________________  
**Overall Result:** PASS / FAIL  
**Notes:** _________________

---

**END OF TESTING GUIDE** ✅
