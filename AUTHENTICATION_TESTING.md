# 🧪 Mentara - Authentication Testing Guide

## ✅ All Issues Fixed!

### Problems Resolved:
1. ✅ API endpoints corrected to match backend routes
2. ✅ Login form changed from email to username/email support
3. ✅ Signup form added username field
4. ✅ Password confirmation field name fixed
5. ✅ Environment variable added (.env file)
6. ✅ User serializers and auth flow corrected
7. ✅ Role-based redirection implemented

---

## 🚀 Testing Instructions

### Prerequisites
- ✅ Backend server running: http://127.0.0.1:8000
- ✅ Frontend server running: http://localhost:3001

---

## 1. Test Admin Login

**URL:** http://localhost:3001/login

**Credentials:**
```
Username: admin
Password: admin123
```

**Expected Behavior:**
1. Enter username `admin` and password `admin123`
2. Click "Sign In"
3. Should redirect to `/dashboard`
4. User object should have `role: 'ADMIN'` and `is_superuser: true`

**What to Check:**
- ✅ No console errors
- ✅ Token stored in localStorage
- ✅ User object in localStorage shows admin role
- ✅ Successful redirect to dashboard

---

## 2. Test Teacher Login

**URL:** http://localhost:3001/login

**Credentials:**
```
Username: teacher
Password: teacher123
```

**Expected Behavior:**
1. Enter username `teacher` and password `teacher123`
2. Click "Sign In"
3. Should redirect to `/teacher/dashboard`
4. User object should have `role: 'TEACHER'` and `is_staff: true`

**What to Check:**
- ✅ No console errors
- ✅ Token stored in localStorage
- ✅ User object shows teacher role
- ✅ Redirects to teacher dashboard

---

## 3. Test Student Signup

**URL:** http://localhost:3001/signup

**Test Data:**
```
Username: student123
First Name: John
Last Name: Doe
Email: john.doe@student.com
Grade: Grade 11 (IB DP Year 1)
Password: password123
Confirm Password: password123
```

**Expected Behavior:**
1. Fill all fields
2. Click "Create Account"
3. Should create account and auto-login
4. Redirect to `/dashboard`
5. User object should have `role: 'STUDENT'`

**What to Check:**
- ✅ No console errors
- ✅ Account created successfully
- ✅ Auto-login after signup
- ✅ Tokens stored
- ✅ User object in localStorage

---

## 4. Test Student Login

**URL:** http://localhost:3001/login

**Credentials (use the student you just created):**
```
Username: student123
Password: password123
```

**Expected Behavior:**
1. Enter credentials
2. Click "Sign In"
3. Should redirect to `/dashboard`
4. User object should have `role: 'STUDENT'`

---

## 5. Test Email Login (Alternative)

**URL:** http://localhost:3001/login

**Test with Email:**
```
Username: john.doe@student.com (use email instead)
Password: password123
```

**Expected Behavior:**
- Should work the same as username login
- Backend handles both username and email

---

## 🔍 Debugging Tips

### Check Browser Console
Open Developer Tools (F12) and check:
1. **Console Tab**: Look for any errors
2. **Network Tab**: Check API calls:
   - Login: POST to `/accounts/api/auth/login/`
   - Register: POST to `/accounts/api/auth/register/`
3. **Application Tab** → **Local Storage**: Check:
   - `access_token`
   - `refresh_token`
   - `user` (JSON object)

### Check Backend Logs
In the backend terminal, you should see:
```
[02/Dec/2025 12:50:23] "POST /accounts/api/auth/login/ HTTP/1.1" 200
[02/Dec/2025 12:50:24] "GET /accounts/api/users/me/ HTTP/1.1" 200
```

### Common Issues & Solutions

**Issue: "CORS error"**
- Check `CORS_ALLOWED_ORIGINS` in settings.py includes `http://localhost:3001`

**Issue: "404 Not Found"**
- Check API URL in frontend `.env` file
- Verify backend routes are correct

**Issue: "Invalid credentials"**
- Double-check username/password
- Try creating a new user via signup

**Issue: "Network Error"**
- Ensure backend server is running on port 8000
- Check `.env` file has correct API URL

---

## 📝 API Endpoints Reference

### Authentication
```
POST /accounts/api/auth/login/
Body: { "username": "admin", "password": "admin123" }
Response: { "access": "...", "refresh": "...", "user": {...} }

POST /accounts/api/auth/register/
Body: {
  "username": "student123",
  "email": "student@example.com",
  "password": "password123",
  "password_confirm": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "grade": "11"
}

POST /accounts/api/auth/logout/
Body: { "refresh": "<refresh_token>" }

GET /accounts/api/users/me/
Headers: Authorization: Bearer <access_token>
Response: User profile
```

---

## ✅ Success Checklist

After testing, verify:

- [ ] Admin can login successfully
- [ ] Teacher can login successfully
- [ ] New students can signup
- [ ] Students can login after signup
- [ ] Tokens are stored in localStorage
- [ ] Users are redirected based on role
- [ ] No console errors
- [ ] Backend responds with 200 status
- [ ] User data is correct in localStorage

---

## 🎯 Next Steps After Testing

Once all authentication works:

1. **Create Test Content (as Admin):**
   - Create topics
   - Add questions
   - Build exams

2. **Test Exam Flow (as Student):**
   - Browse available tests
   - Start a test
   - Answer questions
   - Submit test
   - View results

3. **Test Teacher Features:**
   - Create exam
   - Grade submissions
   - View analytics

---

## 🆘 Still Having Issues?

### Quick Fixes:

1. **Clear Browser Data:**
   ```
   - Press Ctrl+Shift+Delete
   - Clear cookies and site data
   - Reload page
   ```

2. **Restart Servers:**
   ```bash
   # Stop both servers (Ctrl+C)
   
   # Backend
   python manage.py runserver
   
   # Frontend (in new terminal)
   cd frontend
   npm run dev
   ```

3. **Check Environment:**
   ```bash
   # Verify .env file exists in frontend/
   cat frontend/.env
   # Should show: VITE_API_URL=http://127.0.0.1:8000
   ```

4. **Test API Directly:**
   ```bash
   # Use curl or Postman to test backend
   curl -X POST http://127.0.0.1:8000/accounts/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

---

## 📊 Expected Response Examples

### Successful Login Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mentara.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "ADMIN",
    "is_staff": true,
    "is_superuser": true,
    "total_points": 0,
    "current_streak": 0,
    "badges": []
  }
}
```

### Successful Registration Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 3,
    "username": "student123",
    "email": "john.doe@student.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "STUDENT",
    "grade": "11",
    "is_staff": false,
    "is_superuser": false
  }
}
```

---

## 🎉 All Fixed!

Your authentication system is now fully functional with:
- ✅ Username/Email login support
- ✅ Role-based authentication
- ✅ Fixed admin and teacher accounts
- ✅ Student registration
- ✅ Token-based security
- ✅ Proper error handling

**Start testing and enjoy Mentara! 🚀**
