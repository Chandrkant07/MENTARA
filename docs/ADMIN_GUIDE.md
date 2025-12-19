# Admin User Guide - Mentara Platform

## 🎯 Overview

This guide will help you manage the Mentara platform effectively as an administrator.

## 📋 Table of Contents

1. [First Time Setup](#first-time-setup)
2. [Managing Users](#managing-users)
3. [Managing Topics](#managing-topics)
4. [Managing Exams](#managing-exams)
5. [Bulk Operations](#bulk-operations)
6. [Monitoring System Health](#monitoring-system-health)
7. [Backup and Recovery](#backup-and-recovery)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 First Time Setup

### 1. Access Admin Panel

Navigate to: `https://your-domain.com/admin`

**Default Credentials** (change immediately):
- Email: admin@mentara.com
- Password: (set during deployment)

### 2. Create Demo Data (Optional)

For testing or demo purposes:

```bash
python manage.py seed_demo_data
```

This creates:
- 1 admin, 1 teacher, 9 students
- 8 physics topics
- 5 sample exams with questions
- Sample attempts with realistic data

### 3. Configure Email Settings

1. Go to Django Admin → Settings
2. Update SMTP credentials:
   - Email Host: `smtp.gmail.com`
   - Email Port: `587`
   - Email User: `your-email@gmail.com`
   - Email Password: `your-app-password`

**Note**: Use Gmail App Password, not your regular password.

---

## 👥 Managing Users

### Creating a New User

**Method 1: Admin Panel**
1. Go to **Users** → **Add User**
2. Fill required fields:
   - Email (unique)
   - Username
   - Password
   - First Name & Last Name
   - Role (Student/Teacher/Admin)
3. Click **Save**

**Method 2: Bulk CSV Upload**
1. Prepare CSV with columns: `email,username,first_name,last_name,role,password`
2. Go to **Users** → **Import**
3. Upload CSV file
4. Review validation errors
5. Confirm import

### Editing User Details

1. Go to **Users** → Find user
2. Click on username
3. Update fields
4. **Save**

### Resetting User Password

1. Find user in admin panel
2. Scroll to **Password** section
3. Enter new password twice
4. **Save**

Or use command:
```bash
python manage.py changepassword username
```

### Deactivating a User

1. Edit user
2. Uncheck **Active** status
3. **Save**

**Note**: Deactivated users cannot login but data is preserved.

---

## 📚 Managing Topics

### Creating a Topic

1. Go to **Topics** → **Add Topic**
2. Fill details:
   - **Name**: Topic name (e.g., "Mechanics")
   - **Description**: Brief overview
   - **Order**: Display sequence (optional)
3. **Save**

### Reordering Topics

Topics are displayed in ascending order by `order` field.

1. Edit each topic
2. Set `order` value (1, 2, 3...)
3. **Save**

### Deleting a Topic

⚠️ **Warning**: This will cascade delete all related exams and questions!

1. Select topic
2. Choose **Delete** from actions
3. Confirm deletion

**Recommended**: Mark as inactive instead of deleting.

---

## 📝 Managing Exams

### Creating an Exam

1. Go to **Exams** → **Add Exam**
2. Fill details:
   - **Title**: Exam name
   - **Level**: SL or HL
   - **Paper Number**: 1, 2, or 3
   - **Topic**: Select from dropdown
   - **Duration**: Minutes
   - **Created By**: Select teacher
3. **Save**

### Adding Questions to Exam

**Method 1: Manual Entry**
1. Open exam
2. Scroll to **Questions** section
3. Click **Add Question**
4. Fill question details:
   - **Type**: MCQ or Descriptive
   - **Statement**: Question text
   - **Choices** (MCQ only): Pipe-separated `Option A|Option B|Option C|Option D`
   - **Correct Answers**: Index (0,1,2,3) or pipe-separated for multiple
   - **Difficulty**: Easy/Medium/Hard
   - **Marks**: Points awarded
   - **Estimated Time**: Minutes
5. **Save**

**Method 2: Bulk CSV Upload**
1. Download template from **Questions** → **Bulk Upload**
2. Fill CSV:
   ```csv
   topic_id,type,statement,choices,correct_answers,difficulty,marks,estimated_time,tags
   1,mcq,"What is F=ma?","Newton's 2nd|Newton's 1st|Gravity|Momentum",0,medium,1,2,"mechanics|forces"
   ```
3. Upload file
4. Review results (created count and errors)

### Publishing an Exam

1. Edit exam
2. Check **Published** checkbox
3. **Save**

**Note**: Only published exams are visible to students.

---

## 📊 Bulk Operations

### Bulk User Import

**CSV Format**:
```csv
email,username,first_name,last_name,role,password
john@example.com,john_smith,John,Smith,student,SecurePass123
```

**Steps**:
1. Prepare CSV file
2. Go to **Users** → **Import CSV**
3. Upload file
4. Review validation messages
5. Confirm import

**Error Handling**:
- Duplicate emails: Skip row, log error
- Invalid role: Skip row, log error
- Missing required fields: Skip row, log error

### Bulk Question Import

**CSV Format**:
```csv
topic_id,type,statement,choices,correct_answers,difficulty,marks,estimated_time,tags
1,mcq,"Question text","A|B|C|D",0,medium,1,2,"tag1|tag2"
2,descriptive,"Essay question",,0,hard,5,10,"essay"
```

**Steps**:
1. Download template
2. Fill question data
3. Go to **Questions** → **Bulk Upload**
4. Upload CSV
5. Review created/failed counts

---

## 🏥 Monitoring System Health

### Health Check Endpoint

Access: `https://your-domain.com/api/health/`

**Response**:
```json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok"
  },
  "version": "1.0.0"
}
```

### Viewing Logs

**Container logs**:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Error logs** (if file logging enabled):
```bash
tail -f /var/log/mentara/error.log
```

### Database Statistics

Access Django Admin dashboard for:
- Total users by role
- Total exams and questions
- Total attempts
- Average scores

---

## 💾 Backup and Recovery

### Database Backup

**PostgreSQL**:
```bash
docker-compose exec db pg_dump -U postgres mentara_db > backup_$(date +%Y%m%d).sql
```

**Schedule with cron**:
```bash
0 2 * * * cd /opt/mentara && docker-compose exec -T db pg_dump -U postgres mentara_db > /backups/db_$(date +\%Y\%m\%d).sql
```

### Database Restore

```bash
docker-compose exec -T db psql -U postgres mentara_db < backup_20250101.sql
```

### Media Files Backup

```bash
tar -czf media_backup_$(date +%Y%m%d).tar.gz media/
```

**Restore**:
```bash
tar -xzf media_backup_20250101.tar.gz
```

### Automated Backups

Use cloud storage:
- AWS S3
- Google Cloud Storage
- DigitalOcean Spaces

**Setup S3 sync**:
```bash
aws s3 sync ./media/ s3://mentara-backups/media/ --delete
```

---

## 🔧 Troubleshooting

### Users Can't Login

**Check**:
1. User is active: Admin → Users → Check "Active" status
2. Email verified: Check "Email verified" field
3. Password correct: Reset password via admin
4. JWT tokens valid: Clear token blacklist if needed

**Solution**:
```bash
# Clear expired tokens
python manage.py flushexpiredtokens
```

### Slow Performance

**Diagnosis**:
1. Check database queries: Enable Django Debug Toolbar
2. Check Redis connection: `redis-cli ping`
3. Check server resources: `docker stats`

**Solutions**:
- Add database indexes
- Enable Redis caching
- Increase worker count in Gunicorn
- Optimize queries with `select_related()`

### Email Not Sending

**Check**:
1. SMTP credentials correct
2. Gmail "Less secure apps" or App Password enabled
3. Email backend configured correctly

**Test**:
```bash
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Message', 'from@example.com', ['to@example.com'])
```

### File Upload Errors

**Check**:
1. Media directory writable
2. Nginx client_max_body_size sufficient
3. File size within limits

**Solution**:
```nginx
# In nginx.conf
client_max_body_size 20M;
```

### Docker Container Issues

**Restart containers**:
```bash
docker-compose restart
```

**Rebuild from scratch**:
```bash
docker-compose down -v
docker-compose up --build
```

**View container logs**:
```bash
docker-compose logs backend
```

---

## 📈 Best Practices

### Security
- ✅ Change default admin password immediately
- ✅ Use strong passwords (12+ chars, mixed case, numbers, symbols)
- ✅ Enable two-factor authentication (future enhancement)
- ✅ Regularly update dependencies
- ✅ Monitor failed login attempts
- ✅ Keep backups off-site

### Performance
- ✅ Run database migrations during low-traffic periods
- ✅ Monitor disk space for media uploads
- ✅ Clean up old logs regularly
- ✅ Archive old attempts/data periodically
- ✅ Use CDN for static assets in production

### User Management
- ✅ Verify teacher accounts manually
- ✅ Set up email notifications for new registrations
- ✅ Regularly audit inactive users
- ✅ Document role permissions clearly

---

## 📞 Getting Help

**Technical Issues**:
- Check logs: `docker-compose logs`
- Review error messages in browser console
- Test health endpoint: `/api/health/`

**Feature Requests**:
- Document request with use case
- Contact development team
- Check project roadmap

**Emergency Support**:
- Email: support@mentara.com
- Phone: [To be configured]

---

## 🎓 Quick Reference

### Common Commands

```bash
# Seed demo data
python manage.py seed_demo_data

# Create superuser
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Flush expired tokens
python manage.py flushexpiredtokens

# Shell access
python manage.py shell

# Database backup
docker-compose exec db pg_dump -U postgres mentara_db > backup.sql
```

### Important URLs

- Admin Panel: `/admin`
- API Health: `/api/health/`
- API Docs: `/api/docs/` (future)
- Student Dashboard: `/dashboard/student/`
- Teacher Dashboard: `/dashboard/teacher/`

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Contact**: admin@mentara.com
