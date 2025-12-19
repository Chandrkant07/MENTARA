# Pre-Deployment Checklist for Mentara

Use this checklist before deploying to production to ensure everything is configured correctly.

## 🔒 Security Configuration

### Environment Variables
- [ ] `.env` file created from `.env.example`
- [ ] `SECRET_KEY` changed to a strong random value (50+ characters)
- [ ] `DEBUG=False` set for production
- [ ] `ALLOWED_HOSTS` configured with your domain
- [ ] `CSRF_TRUSTED_ORIGINS` includes your domain
- [ ] Database password is strong and secure
- [ ] Redis password configured (if using external Redis)

### SSL/HTTPS
- [ ] SSL certificates obtained (Let's Encrypt or commercial)
- [ ] Certificates copied to `./ssl/` directory
- [ ] Nginx SSL configuration uncommented
- [ ] HTTPS redirect enabled in Nginx
- [ ] HSTS headers configured

### Email Configuration
- [ ] SMTP host configured
- [ ] SMTP credentials set (use App Password for Gmail)
- [ ] `DEFAULT_FROM_EMAIL` set to valid address
- [ ] Test email sending works

### Admin Account
- [ ] Default admin password changed
- [ ] Admin email updated to real address
- [ ] Superuser created with strong password

## 🐳 Docker & Services

### Docker Setup
- [ ] Docker and Docker Compose installed on server
- [ ] All required ports open (80, 443, optionally 5432 for PostgreSQL)
- [ ] Firewall configured (block direct database access)
- [ ] Docker images build successfully
- [ ] All containers start without errors

### Database
- [ ] PostgreSQL container starts successfully
- [ ] Database migrations run without errors
- [ ] Database connection from backend works
- [ ] Database backups scheduled (cron job)
- [ ] Connection pooling configured (CONN_MAX_AGE)

### Redis
- [ ] Redis container starts successfully
- [ ] Backend can connect to Redis
- [ ] Cache configuration tested

### Nginx
- [ ] Nginx configuration syntax valid
- [ ] Static files served correctly
- [ ] Media files served correctly
- [ ] API proxying works
- [ ] Rate limiting configured

## 📁 Application Configuration

### Django Settings
- [ ] Static files collected (`collectstatic` run)
- [ ] Media directory created and writable
- [ ] Database connection tested
- [ ] All apps listed in INSTALLED_APPS
- [ ] Middleware order correct
- [ ] CORS settings configured for production

### Frontend
- [ ] Environment variables set (`VITE_BASE_API`)
- [ ] Build process completes successfully
- [ ] Assets optimized (minified, compressed)
- [ ] API endpoints correctly configured
- [ ] Error handling implemented

## 🧪 Testing

### Functional Tests
- [ ] User registration works
- [ ] Email verification works
- [ ] Login/logout works
- [ ] Password reset works
- [ ] Student can take exam
- [ ] Teacher can grade submissions
- [ ] Admin can manage users
- [ ] File uploads work (CSV, PDFs)

### Performance Tests
- [ ] Load test run successfully (k6)
- [ ] Response times acceptable (p95 < 500ms)
- [ ] No memory leaks under load
- [ ] Database queries optimized
- [ ] Static assets cached properly

### Security Tests
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF protection working
- [ ] Rate limiting active
- [ ] Unauthorized access blocked

## 📊 Monitoring & Logging

### Health Checks
- [ ] Health endpoint responding (`/api/health/`)
- [ ] Database check passing
- [ ] Redis check passing (if configured)

### Logging
- [ ] Error logs directory created
- [ ] Log rotation configured
- [ ] Critical errors logged
- [ ] Log file permissions correct

### Monitoring (Optional)
- [ ] Sentry configured for error tracking
- [ ] Uptime monitoring set up
- [ ] Performance monitoring enabled
- [ ] Alerts configured for critical issues

## 💾 Backup & Recovery

### Backup Strategy
- [ ] Database backup script created
- [ ] Media files backup configured
- [ ] Backup schedule set (daily recommended)
- [ ] Backup verification tested
- [ ] Off-site backup storage configured
- [ ] Restore procedure documented and tested

### Disaster Recovery
- [ ] Recovery procedure documented
- [ ] Emergency contacts list created
- [ ] Rollback plan prepared

## 📚 Documentation

### User Documentation
- [ ] Admin guide completed
- [ ] Teacher guide completed (if needed)
- [ ] Student guide completed (if needed)
- [ ] FAQ document created

### Technical Documentation
- [ ] Deployment guide reviewed
- [ ] Architecture documented
- [ ] API endpoints documented
- [ ] Database schema documented
- [ ] Environment variables documented

### Handover
- [ ] Access credentials documented (securely)
- [ ] Repository access granted
- [ ] Server access configured
- [ ] Support contacts provided

## 🚀 Deployment Steps

### Pre-deployment
- [ ] All checklist items above completed
- [ ] Staging environment tested
- [ ] Deployment scheduled during low-traffic time
- [ ] Team notified of deployment
- [ ] Rollback plan reviewed

### During Deployment
- [ ] Code pulled from main branch
- [ ] Containers built successfully
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] Services restarted
- [ ] Health checks passing

### Post-deployment
- [ ] Application accessible via domain
- [ ] All major features tested
- [ ] Error logs checked (no critical errors)
- [ ] Performance metrics normal
- [ ] Monitoring active
- [ ] Team notified of successful deployment

## 🎯 Client Handover

### Demo Preparation
- [ ] Demo data seeded (`seed_demo_data`)
- [ ] Sample exams created
- [ ] Test accounts created (student, teacher, admin)
- [ ] Demo script prepared
- [ ] Presentation materials ready

### Training
- [ ] Admin trained on user management
- [ ] Admin trained on content management
- [ ] Admin trained on system monitoring
- [ ] Admin trained on backup/restore
- [ ] Q&A session completed

### Final Acceptance
- [ ] Client walkthrough completed
- [ ] All requirements verified against SRS
- [ ] Client sign-off obtained
- [ ] Support plan agreed
- [ ] Maintenance schedule set

## 📝 Notes

### Known Issues (if any)
_Document any known limitations or issues that don't block deployment:_

---

### Deployment Date
**Date**: _____________  
**Deployed By**: _____________  
**Client Sign-off**: _____________  

---

## ✅ Approval

- [ ] Technical Lead Approved
- [ ] Security Review Passed
- [ ] Client Approval Received
- [ ] Production Deployment Authorized

**Signature**: _________________  
**Date**: _____________________

---

**Last Updated**: January 2025  
**Version**: 1.0
