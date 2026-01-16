# 🚀 FashionDeck Deployment Checklist

> **Step-by-step checklist for deploying FashionDeck to production**

---

## ✅ **Pre-Deployment (Complete These First)**

### **1. Accounts & Access**

- [ ] Railway account created (railway.app)
- [ ] Vercel account created (vercel.com)
- [ ] GitHub repository accessible
- [ ] OpenAI API key obtained (platform.openai.com)
- [ ] (Optional) Amazon Affiliate account
- [ ] (Optional) Flipkart Affiliate account
- [ ] (Optional) Sentry account for error tracking

### **2. Code Verification**

- [ ] All code committed to GitHub
- [ ] `.env` files NOT committed (in `.gitignore`)
- [ ] Dockerfiles tested locally (`docker-compose up`)
- [ ] No hardcoded secrets in code
- [ ] All environment variables documented in `.env.example`

### **3. Local Testing**

- [ ] Backend API starts successfully (`npm run dev`)
- [ ] ML Service starts successfully (`uvicorn app.main:app --reload`)
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Can make end-to-end request (prompt → outfits)
- [ ] Health endpoints return 200 OK

---

## 🗄️ **Phase 1: Database Setup (Railway)**

### **PostgreSQL with pgvector**

- [ ] Created PostgreSQL database on Railway
- [ ] Named: "fashiondeck-postgres"
- [ ] Copied `DATABASE_URL` from Railway
- [ ] Connected to database via psql or client
- [ ] Ran: `CREATE EXTENSION IF NOT EXISTS vector;`
- [ ] Verified: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- [ ] Ran migrations: `npm run migrate:up` (from local)
- [ ] Verified tables created: `\dt` shows `products`, `query_logs`
- [ ] Verified indexes created: `\di` shows vector indexes

### **Redis**

- [ ] Created Redis instance on Railway
- [ ] Named: "fashiondeck-redis"
- [ ] Copied `REDIS_URL` from Railway
- [ ] Tested connection: `redis-cli -u $REDIS_URL ping` returns `PONG`

---

## 🤖 **Phase 2: ML Service Deployment (Railway)**

### **Create Service**

- [ ] Created new service from GitHub repo
- [ ] Named: "fashiondeck-ml-service"
- [ ] Root directory: `/`
- [ ] Dockerfile path: `apps/ml-service/Dockerfile`

### **Environment Variables**

- [ ] `PYTHONUNBUFFERED=1`
- [ ] `PYTHONDONTWRITEBYTECODE=1`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `REDIS_URL=${{Redis.REDIS_URL}}`
- [ ] `OPENAI_API_KEY=sk-...` (YOUR KEY)
- [ ] `OPENAI_MODEL=gpt-4o-mini`
- [ ] `CLIP_MODEL_NAME=ViT-B/32`

### **Storage & Networking**

- [ ] Created volume for models: `/app/models_cache` (5GB)
- [ ] Generated public domain
- [ ] Copied ML service URL (e.g., `https://fashiondeck-ml.up.railway.app`)

### **Verification**

- [ ] Deployment successful (green checkmark)
- [ ] Health check passes: `curl https://your-ml-url.railway.app/health`
- [ ] Docs accessible: `curl https://your-ml-url.railway.app/docs`
- [ ] Logs show "Starting FashionDeck ML Service"
- [ ] No errors in logs

---

## 🔧 **Phase 3: Backend API Deployment (Railway)**

### **Create Service**

- [ ] Created new service from GitHub repo
- [ ] Named: "fashiondeck-api"
- [ ] Root directory: `/`
- [ ] Dockerfile path: `apps/api/Dockerfile`

### **Environment Variables**

- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `LOG_LEVEL=info`
- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `REDIS_URL=${{Redis.REDIS_URL}}`
- [ ] `ML_SERVICE_URL=https://your-ml-url.railway.app` (from Phase 2)
- [ ] `ML_SERVICE_TIMEOUT=5000`
- [ ] `RATE_LIMIT_WINDOW_MS=60000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=10`
- [ ] `CORS_ORIGIN=*` (temporary, will update after frontend deployment)
- [ ] `ENABLE_REQUEST_LOGGING=true`

### **Networking**

- [ ] Generated public domain
- [ ] Copied API URL (e.g., `https://fashiondeck-api.up.railway.app`)

### **Verification**

- [ ] Deployment successful (green checkmark)
- [ ] Health check passes: `curl https://your-api-url.railway.app/api/health`
- [ ] ML health check passes: `curl https://your-api-url.railway.app/api/ml/health`
- [ ] Circuit breaker state is CLOSED
- [ ] Logs show "🚀 FashionDeck API is running"
- [ ] No errors in logs

---

## 🌐 **Phase 4: Frontend Deployment (Vercel)**

### **Create Project**

- [ ] Imported GitHub repository to Vercel
- [ ] Framework preset: Next.js
- [ ] Root directory: `apps/web`
- [ ] Build command: `cd ../.. && npm run build --filter=@fashiondeck/web`
- [ ] Output directory: `apps/web/.next`
- [ ] Install command: `npm install`
- [ ] Node.js version: 20.x

### **Environment Variables**

- [ ] `NEXT_PUBLIC_API_URL=https://your-api-url.railway.app` (from Phase 3)

### **Deployment**

- [ ] Deployment successful
- [ ] Copied production URL (e.g., `https://fashiondeck.vercel.app`)

### **Update Backend CORS**

- [ ] Went back to Railway Backend API
- [ ] Updated `CORS_ORIGIN=https://fashiondeck.vercel.app`
- [ ] Redeployed backend API

### **Verification**

- [ ] Frontend loads: Visit `https://fashiondeck.vercel.app`
- [ ] Landing page displays correctly
- [ ] Search page accessible
- [ ] Can enter a prompt
- [ ] Outfits are returned (end-to-end test)
- [ ] Affiliate links work
- [ ] No console errors
- [ ] Mobile responsive

---

## 🔄 **Phase 5: CI/CD Setup**

### **GitHub Actions**

- [ ] Created `.github/workflows/deploy.yml`
- [ ] Workflow file committed to repository
- [ ] Pushed to main branch
- [ ] GitHub Actions ran successfully
- [ ] All jobs passed (lint, test, build)

### **Auto-Deployment**

- [ ] Railway auto-deploys on push to main (verified)
- [ ] Vercel auto-deploys on push to main (verified)

---

## 📊 **Phase 6: Monitoring Setup**

### **Railway Monitoring**

- [ ] Enabled metrics in Railway dashboard
- [ ] Reviewed CPU/Memory usage
- [ ] Set up alerts for high resource usage (optional)

### **Sentry (Optional)**

- [ ] Created Sentry projects for each service
- [ ] Added `SENTRY_DSN` to environment variables
- [ ] Installed Sentry SDKs
- [ ] Verified errors are being captured

### **Uptime Monitoring (Optional)**

- [ ] Set up UptimeRobot or similar
- [ ] Monitoring backend health endpoint
- [ ] Monitoring ML service health endpoint
- [ ] Monitoring frontend
- [ ] Alert interval: 5 minutes

---

## 🧪 **Phase 7: Post-Deployment Testing**

### **Smoke Tests**

- [ ] Backend health: `curl https://your-api-url.railway.app/api/health` ✅
- [ ] ML service health: `curl https://your-ml-url.railway.app/health` ✅
- [ ] Frontend loads: Visit production URL ✅
- [ ] End-to-end flow works:
  - [ ] Enter prompt: "korean minimal fit size M under 1500"
  - [ ] Outfits returned
  - [ ] Images load
  - [ ] Prices displayed
  - [ ] Affiliate links work
- [ ] Error handling works:
  - [ ] Invalid prompt shows error
  - [ ] Network error shows retry button
  - [ ] Loading states display

### **Performance Testing (Optional)**

- [ ] Ran load test with k6
- [ ] p95 latency < 7 seconds
- [ ] No errors under 50 concurrent users
- [ ] Circuit breaker remains CLOSED

### **Security Testing**

- [ ] HTTPS enabled (automatic on Vercel/Railway) ✅
- [ ] CORS only allows production domain ✅
- [ ] Rate limiting works (tested with >10 requests/min)
- [ ] No secrets exposed in frontend code
- [ ] Security headers present (checked with securityheaders.com)

---

## 🔐 **Phase 8: Security Hardening**

### **Final Security Checks**

- [ ] All API keys in environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in git history
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers configured
- [ ] Non-root user in Docker containers
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified

### **Access Control**

- [ ] Railway project access limited to team
- [ ] Vercel project access limited to team
- [ ] GitHub repository access controlled
- [ ] API keys rotated if exposed

---

## 📝 **Phase 9: Documentation**

### **Documentation Complete**

- [ ] `DEPLOYMENT.md` created ✅
- [ ] `RUNBOOK.md` created ✅
- [ ] `README.md` updated with deployment info
- [ ] Environment variables documented in `.env.example`
- [ ] API documentation accessible at `/api/docs`
- [ ] ML service documentation accessible at `/docs`

### **Team Handoff**

- [ ] Deployment guide shared with team
- [ ] Runbook shared with team
- [ ] Access credentials shared securely
- [ ] Monitoring dashboards shared
- [ ] On-call rotation established (if applicable)

---

## ✅ **Deployment Complete!**

### **Production URLs**

- 🌐 **Frontend**: `https://fashiondeck.vercel.app`
- 🔧 **Backend API**: `https://your-api-url.railway.app`
- 🤖 **ML Service**: `https://your-ml-url.railway.app`
- 📚 **API Docs**: `https://your-api-url.railway.app/api/docs`
- 📖 **ML Docs**: `https://your-ml-url.railway.app/docs`

### **Next Steps**

1. [ ] Monitor logs for first 24 hours
2. [ ] Set up analytics (Google Analytics)
3. [ ] Configure custom domain (optional)
4. [ ] Set up backup strategy
5. [ ] Plan for scaling (if needed)
6. [ ] Schedule regular maintenance

### **Maintenance Schedule**

- **Daily**: Check error logs
- **Weekly**: Review metrics and performance
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Load testing, security audit

---

## 🚨 **Emergency Contacts**

- **Railway Support**: https://railway.app/help
- **Vercel Support**: support@vercel.com
- **OpenAI Support**: https://help.openai.com

---

## 📞 **Rollback Procedure**

If something goes wrong:

1. **Railway**: Go to Deployments → Previous deployment → Redeploy
2. **Vercel**: Go to Deployments → Previous deployment → Promote to Production
3. **Database**: Restore from latest backup (if needed)
4. **Notify team** of rollback and investigate issue

---

**Congratulations! Your FashionDeck application is now live in production! 🎉**
