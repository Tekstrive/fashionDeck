# FashionDeck Deployment Runbook

> **Operational guide for deploying, monitoring, and troubleshooting FashionDeck in production**

---

## 🚀 **Quick Deployment Commands**

### **Deploy Everything (First Time)**

```bash
# 1. Set up databases on Railway
# - Create PostgreSQL with pgvector
# - Create Redis
# - Run migrations

# 2. Deploy ML Service to Railway
# - Connect GitHub repo
# - Set environment variables
# - Deploy

# 3. Deploy Backend API to Railway
# - Connect GitHub repo
# - Set environment variables (including ML_SERVICE_URL)
# - Deploy

# 4. Deploy Frontend to Vercel
# - Connect GitHub repo
# - Set environment variables (including NEXT_PUBLIC_API_URL)
# - Deploy

# 5. Update CORS_ORIGIN in Backend API
# - Set to Vercel URL
# - Redeploy
```

### **Deploy Updates**

```bash
# Automatic deployment on git push to main
git add .
git commit -m "Your changes"
git push origin main

# Railway and Vercel will auto-deploy
```

---

## 📊 **Monitoring**

### **Health Checks**

```bash
# Backend API
curl https://your-api-url.railway.app/api/health

# ML Service
curl https://your-ml-service-url.railway.app/health

# Frontend
curl https://fashiondeck.vercel.app

# Circuit Breaker Status
curl https://your-api-url.railway.app/api/ml/health
```

### **View Logs**

```bash
# Railway (Backend API)
# 1. Go to Railway dashboard
# 2. Select "fashiondeck-api" service
# 3. Click "Deployments" → Latest deployment
# 4. View logs in real-time

# Railway (ML Service)
# Same process for "fashiondeck-ml-service"

# Vercel (Frontend)
# 1. Go to Vercel dashboard
# 2. Select project
# 3. Click "Deployments" → Latest deployment
# 4. View function logs
```

### **Key Metrics to Monitor**

1. **Response Times**
   - Target: p95 < 7 seconds
   - Check: Backend API logs

2. **Error Rates**
   - Target: < 1% error rate
   - Check: Sentry dashboard (if configured)

3. **Circuit Breaker State**
   - Target: CLOSED (healthy)
   - Check: `/api/ml/health` endpoint

4. **Database Connections**
   - Target: < 80% of pool size
   - Check: Railway PostgreSQL metrics

5. **Memory Usage**
   - Backend: < 512MB
   - ML Service: < 1GB
   - Check: Railway service metrics

---

## 🔧 **Common Operations**

### **Update Environment Variables**

```bash
# Railway
# 1. Go to service settings
# 2. Click "Variables"
# 3. Update variable
# 4. Service will auto-redeploy

# Vercel
# 1. Go to project settings
# 2. Click "Environment Variables"
# 3. Update variable
# 4. Redeploy from dashboard
```

### **Rollback Deployment**

```bash
# Railway
# 1. Go to service "Deployments"
# 2. Find previous successful deployment
# 3. Click "..." → "Redeploy"

# Vercel
# 1. Go to project "Deployments"
# 2. Find previous deployment
# 3. Click "..." → "Promote to Production"
```

### **Scale Services**

```bash
# Railway
# 1. Go to service settings
# 2. Click "Resources"
# 3. Adjust CPU/Memory
# 4. Save (service will restart)

# Note: Railway auto-scales based on usage
```

### **Run Database Migrations**

```bash
# From local machine
export DATABASE_URL="your-production-database-url"
cd apps/api
npm run migrate:up

# Or create a Railway service for migrations
# (one-time job that runs migrations)
```

---

## 🚨 **Incident Response**

### **Service Down**

1. **Check Health Endpoints**

   ```bash
   curl https://your-api-url.railway.app/api/health
   curl https://your-ml-service-url.railway.app/health
   ```

2. **Check Railway Status**
   - Visit: https://railway.app/status
   - Check for platform issues

3. **View Recent Logs**
   - Railway dashboard → Service → Logs
   - Look for error messages

4. **Check Environment Variables**
   - Verify all required variables are set
   - Check for typos or missing values

5. **Rollback if Needed**
   - Redeploy previous working version

### **High Error Rate**

1. **Check Sentry** (if configured)
   - Identify most common errors
   - Check error frequency

2. **Check Circuit Breaker**

   ```bash
   curl https://your-api-url.railway.app/api/ml/health
   ```

   - If OPEN, ML service may be down

3. **Check ML Service**
   - Verify OpenAI API key is valid
   - Check OpenAI API status
   - Verify ML service logs

4. **Check Database**
   - Verify connection pool not exhausted
   - Check for slow queries

### **Slow Response Times**

1. **Check Backend Logs**
   - Look for slow operations
   - Check database query times

2. **Check ML Service**
   - Verify LLM API response times
   - Check CLIP model loading

3. **Check Database**
   - Verify indexes are being used
   - Check connection pool usage

4. **Check External APIs**
   - OpenAI API status
   - Marketplace API status

### **Circuit Breaker Stuck Open**

1. **Check ML Service Health**

   ```bash
   curl https://your-ml-service-url.railway.app/health
   ```

2. **Check ML Service Logs**
   - Look for repeated errors
   - Check OpenAI API errors

3. **Verify Environment Variables**
   - `OPENAI_API_KEY` is correct
   - `DATABASE_URL` is correct

4. **Restart ML Service**
   - Railway dashboard → Redeploy

5. **Wait for Circuit to Close**
   - Circuit auto-closes after 30 seconds
   - Monitor `/api/ml/health`

---

## 📝 **Maintenance Tasks**

### **Weekly**

- [ ] Review error logs in Sentry
- [ ] Check response time metrics
- [ ] Verify all services healthy
- [ ] Check database size and growth

### **Monthly**

- [ ] Review and optimize slow queries
- [ ] Update dependencies (security patches)
- [ ] Review and clean up old logs
- [ ] Check Railway/Vercel usage and costs

### **Quarterly**

- [ ] Load testing
- [ ] Security audit
- [ ] Dependency updates (major versions)
- [ ] Review and update documentation

---

## 🔐 **Security Procedures**

### **Rotate API Keys**

1. **OpenAI API Key**

   ```bash
   # 1. Generate new key in OpenAI dashboard
   # 2. Update ML_SERVICE environment variable
   # 3. Redeploy ML service
   # 4. Revoke old key
   ```

2. **Database Credentials**
   ```bash
   # Railway handles this automatically
   # Or manually rotate in Railway dashboard
   ```

### **Review Access Logs**

```bash
# Check for suspicious activity
# - Unusual traffic patterns
# - High error rates from specific IPs
# - Failed authentication attempts (if auth is added)
```

### **Update Dependencies**

```bash
# Check for security vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Or update manually
npm update

# Commit and push
git add package-lock.json
git commit -m "chore: update dependencies"
git push
```

---

## 📞 **Escalation**

### **Critical Issues**

1. **Service completely down**
   - Check Railway status page
   - Check Vercel status page
   - Rollback to last working deployment

2. **Data breach or security incident**
   - Immediately rotate all API keys
   - Review access logs
   - Notify affected users (if applicable)
   - Document incident

3. **Database corruption**
   - Stop all services
   - Restore from latest backup
   - Run integrity checks
   - Restart services

### **Contact Information**

```bash
# Railway Support
# - Dashboard: https://railway.app
# - Discord: https://discord.gg/railway

# Vercel Support
# - Dashboard: https://vercel.com
# - Support: support@vercel.com

# OpenAI Support
# - Help: https://help.openai.com
```

---

## ✅ **Deployment Checklist**

### **Pre-Deployment**

- [ ] All tests passing locally
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Docker builds successful
- [ ] Security scan passed

### **Deployment**

- [ ] Database migrations run
- [ ] Services deployed in order (DB → ML → API → Frontend)
- [ ] Environment variables set correctly
- [ ] Health checks passing

### **Post-Deployment**

- [ ] Smoke tests passed
- [ ] Monitoring configured
- [ ] Logs flowing correctly
- [ ] Error tracking working
- [ ] Performance baseline measured

---

## 📚 **Additional Resources**

- **Deployment Guide**: `DEPLOYMENT.md`
- **Architecture**: `PRD.md`
- **Tasks**: `Tasks.md`
- **Environment Variables**: `.env.example`
- **API Documentation**: `https://your-api-url.railway.app/api/docs`
- **ML Service Documentation**: `https://your-ml-service-url.railway.app/docs`
