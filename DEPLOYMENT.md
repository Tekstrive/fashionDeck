# FashionDeck Deployment Guide

> **Complete deployment guide for FashionDeck to Vercel (Frontend) and Railway (Backend, ML Service, Databases)**

---

## 📋 **Pre-Deployment Checklist**

### ✅ **Code Readiness**

- [x] All environment variables use `process.env` (no hardcoded secrets)
- [x] Global exception handling implemented
- [x] Rate limiting configured
- [x] Security headers (helmet) enabled
- [x] Circuit breakers for external APIs
- [x] Retry logic with exponential backoff
- [x] Dockerfiles optimized (multi-stage builds, non-root user)
- [x] Health check endpoints implemented

### 📦 **Required Accounts**

- [ ] Vercel account (for frontend)
- [ ] Railway account (for backend, ML service, databases)
- [ ] GitHub repository (for CI/CD)
- [ ] OpenAI API key (for GPT-4o-mini)
- [ ] Amazon Affiliate account (optional for MVP)
- [ ] Flipkart Affiliate account (optional for MVP)

---

## 🗄️ **Phase 1: Database Setup (Railway)**

### **1.1 PostgreSQL with pgvector**

1. **Create PostgreSQL Database**

   ```bash
   # In Railway dashboard:
   # 1. Click "New Project"
   # 2. Select "Provision PostgreSQL"
   # 3. Name it: "fashiondeck-postgres"
   ```

2. **Enable pgvector Extension**

   ```sql
   -- Connect to database via Railway's psql or any PostgreSQL client
   CREATE EXTENSION IF NOT EXISTS vector;

   -- Verify installation
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

3. **Run Migrations**

   ```bash
   # Set DATABASE_URL from Railway
   export DATABASE_URL="postgresql://user:pass@host:port/db"

   # Run migrations from local machine
   cd apps/api
   npm run migrate:up
   ```

4. **Verify Tables Created**

   ```sql
   -- Check tables
   \dt

   -- Should see: products, query_logs

   -- Check indexes
   \di

   -- Should see vector indexes on image_embedding and text_embedding
   ```

5. **Copy Connection String**
   - Save the `DATABASE_URL` from Railway dashboard
   - Format: `postgresql://user:password@host:port/database`

### **1.2 Redis Setup**

1. **Create Redis Instance**

   ```bash
   # In Railway dashboard:
   # 1. In same project, click "New"
   # 2. Select "Provision Redis"
   # 3. Name it: "fashiondeck-redis"
   ```

2. **Copy Connection String**
   - Save the `REDIS_URL` from Railway dashboard
   - Format: `redis://default:password@host:port`

3. **Test Connection** (optional)
   ```bash
   # Using redis-cli
   redis-cli -u $REDIS_URL ping
   # Should return: PONG
   ```

---

## 🚀 **Phase 2: Backend API Deployment (Railway)**

### **2.1 Create Railway Service**

1. **New Service from GitHub**

   ```bash
   # In Railway dashboard:
   # 1. Click "New" → "GitHub Repo"
   # 2. Select your FashionDeck repository
   # 3. Name: "fashiondeck-api"
   ```

2. **Configure Build Settings**

   ```yaml
   # Railway will auto-detect Dockerfile
   # Verify settings:
   Root Directory: /
   Dockerfile Path: apps/api/Dockerfile
   ```

3. **Set Environment Variables**

   ```bash
   # In Railway service settings → Variables:

   NODE_ENV=production
   PORT=3001
   LOG_LEVEL=info

   # Database (from Phase 1)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DB_POOL_MIN=2
   DB_POOL_MAX=10

   # Redis (from Phase 1)
   REDIS_URL=${{Redis.REDIS_URL}}
   REDIS_TTL_PRODUCTS=21600
   REDIS_TTL_PROMPTS=86400

   # ML Service (will be set after Phase 3)
   ML_SERVICE_URL=${{ML_SERVICE.RAILWAY_PUBLIC_DOMAIN}}
   ML_SERVICE_TIMEOUT=5000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=10

   # CORS (will be set after Phase 4)
   CORS_ORIGIN=${{Web.VERCEL_URL}}

   # Monitoring (optional)
   # SENTRY_DSN=your-sentry-dsn
   ENABLE_REQUEST_LOGGING=true

   # Marketplace APIs (optional for MVP)
   # AMAZON_AFFILIATE_TAG=your-tag
   # AMAZON_ACCESS_KEY=your-key
   # AMAZON_SECRET_KEY=your-secret
   # FLIPKART_AFFILIATE_ID=your-id
   # FLIPKART_AFFILIATE_TOKEN=your-token
   ```

4. **Configure Networking**

   ```bash
   # In Railway service settings:
   # 1. Click "Settings" → "Networking"
   # 2. Click "Generate Domain"
   # 3. Copy the public URL (e.g., fashiondeck-api.up.railway.app)
   ```

5. **Deploy**

   ```bash
   # Railway will automatically deploy on git push
   # Or click "Deploy" in dashboard

   # Monitor logs in Railway dashboard
   ```

6. **Verify Deployment**

   ```bash
   # Test health endpoint
   curl https://your-api-url.railway.app/api/health

   # Should return:
   # {"status":"healthy","timestamp":"..."}
   ```

---

## 🤖 **Phase 3: ML Service Deployment (Railway)**

### **3.1 Create Railway Service**

1. **New Service from GitHub**

   ```bash
   # In same Railway project:
   # 1. Click "New" → "GitHub Repo"
   # 2. Select your FashionDeck repository
   # 3. Name: "fashiondeck-ml-service"
   ```

2. **Configure Build Settings**

   ```yaml
   Root Directory: /
   Dockerfile Path: apps/ml-service/Dockerfile
   ```

3. **Set Environment Variables**

   ```bash
   # In Railway service settings → Variables:

   PYTHONUNBUFFERED=1
   PYTHONDONTWRITEBYTECODE=1

   # Database (from Phase 1)
   DATABASE_URL=${{Postgres.DATABASE_URL}}

   # Redis (from Phase 1)
   REDIS_URL=${{Redis.REDIS_URL}}

   # OpenAI API (REQUIRED)
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_MODEL=gpt-4o-mini
   OPENAI_MAX_TOKENS=500
   OPENAI_TEMPERATURE=0.7

   # Anthropic API (optional, for Claude scoring)
   # ANTHROPIC_API_KEY=sk-ant-your-key-here

   # CLIP Model
   CLIP_MODEL_NAME=ViT-B/32
   CLIP_PRETRAINED=openai

   # Timeouts
   LLM_TIMEOUT=10
   EMBEDDING_TIMEOUT=5
   ```

4. **Configure Persistent Storage for Models**

   ```bash
   # In Railway service settings:
   # 1. Click "Settings" → "Volumes"
   # 2. Click "New Volume"
   # 3. Mount Path: /app/models_cache
   # 4. Size: 5GB
   ```

5. **Generate Public Domain**

   ```bash
   # In Railway service settings → Networking
   # Generate domain (e.g., fashiondeck-ml.up.railway.app)
   ```

6. **Update Backend API ML_SERVICE_URL**

   ```bash
   # Go back to Backend API service
   # Update environment variable:
   ML_SERVICE_URL=https://fashiondeck-ml.up.railway.app

   # Redeploy backend API
   ```

7. **Verify Deployment**

   ```bash
   # Test health endpoint
   curl https://your-ml-service-url.railway.app/health

   # Test docs
   curl https://your-ml-service-url.railway.app/docs
   ```

---

## 🌐 **Phase 4: Frontend Deployment (Vercel)**

### **4.1 Create Vercel Project**

1. **Import GitHub Repository**

   ```bash
   # 1. Go to vercel.com
   # 2. Click "Add New" → "Project"
   # 3. Import your FashionDeck GitHub repository
   ```

2. **Configure Project Settings**

   ```yaml
   Framework Preset: Next.js
   Root Directory: apps/web
   Build Command: cd ../.. && npm run build --filter=@fashiondeck/web
   Output Directory: apps/web/.next
   Install Command: npm install
   Node.js Version: 20.x
   ```

3. **Set Environment Variables**

   ```bash
   # In Vercel project settings → Environment Variables:

   # Backend API URL (from Phase 2)
   NEXT_PUBLIC_API_URL=https://your-api-url.railway.app

   # Optional: Analytics
   # NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

4. **Deploy**

   ```bash
   # Vercel will automatically deploy
   # Or click "Deploy" in dashboard
   ```

5. **Get Deployment URL**

   ```bash
   # Copy the production URL from Vercel
   # (e.g., fashiondeck.vercel.app)
   ```

6. **Update Backend CORS_ORIGIN**

   ```bash
   # Go to Railway Backend API service
   # Update environment variable:
   CORS_ORIGIN=https://fashiondeck.vercel.app

   # For multiple origins (production + preview):
   CORS_ORIGIN=https://fashiondeck.vercel.app,https://*.vercel.app

   # Redeploy backend API
   ```

7. **Verify Deployment**
   ```bash
   # Visit your Vercel URL
   # Test the application end-to-end
   ```

---

## 🔄 **Phase 5: CI/CD Setup (GitHub Actions)**

### **5.1 Create GitHub Actions Workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy FashionDeck

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linters
        run: npm run lint

      - name: Type check
        run: npm run type-check

      # Uncomment when tests are ready
      # - name: Run tests
      #   run: npm test

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push to main"

  deploy-ml-service:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push to main"

  deploy-frontend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: echo "Vercel auto-deploys on push to main"
```

---

## 📊 **Phase 6: Monitoring & Observability**

### **6.1 Railway Monitoring**

1. **Enable Metrics**
   - Railway automatically provides CPU, Memory, Network metrics
   - View in service dashboard

2. **Set Up Alerts** (optional)
   - Configure alerts for high CPU/memory usage
   - Set up webhook notifications

### **6.2 Sentry Integration** (optional)

1. **Create Sentry Project**

   ```bash
   # 1. Go to sentry.io
   # 2. Create new project for each service
   # 3. Get DSN for each
   ```

2. **Add Sentry DSN to Environment Variables**

   ```bash
   # Backend API
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

   # ML Service
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

   # Frontend (Next.js)
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

3. **Install Sentry SDKs**

   ```bash
   # Backend
   npm install @sentry/node --workspace=@fashiondeck/api

   # ML Service
   pip install sentry-sdk[fastapi]

   # Frontend
   npm install @sentry/nextjs --workspace=@fashiondeck/web
   ```

### **6.3 Uptime Monitoring** (optional)

Use UptimeRobot or similar:

- Monitor: `https://your-api-url.railway.app/api/health`
- Monitor: `https://your-ml-service-url.railway.app/health`
- Monitor: `https://fashiondeck.vercel.app`
- Alert interval: 5 minutes

---

## 🧪 **Phase 7: Post-Deployment Testing**

### **7.1 Smoke Tests**

```bash
# 1. Test Backend Health
curl https://your-api-url.railway.app/api/health

# 2. Test ML Service Health
curl https://your-ml-service-url.railway.app/health

# 3. Test Frontend
curl https://fashiondeck.vercel.app

# 4. Test End-to-End Flow
# - Visit frontend
# - Enter a prompt: "korean minimal fit size M under 1500"
# - Verify outfits are returned
# - Check affiliate links work
```

### **7.2 Load Testing** (optional)

```bash
# Install k6
brew install k6  # macOS
# or download from k6.io

# Create load test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.post(
    'https://your-api-url.railway.app/api/query',
    JSON.stringify({ prompt: 'korean minimal fit size M under 1500' }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 7s': (r) => r.timings.duration < 7000,
  });

  sleep(1);
}
EOF

# Run load test
k6 run load-test.js
```

---

## 🔐 **Security Checklist**

- [x] All secrets in environment variables (not in code)
- [x] HTTPS enabled (automatic on Vercel/Railway)
- [x] CORS configured for production domain only
- [x] Rate limiting enabled (10 req/min)
- [x] Helmet security headers configured
- [x] Non-root user in Docker containers
- [x] Health checks configured
- [ ] Database connection pooling configured
- [ ] SQL injection prevention verified (TypeORM parameterized queries)
- [ ] Input validation on all endpoints

---

## 📝 **Environment Variables Summary**

### **Backend API (Railway)**

```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
ML_SERVICE_URL=${{ML_SERVICE.RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=${{Web.VERCEL_URL}}
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### **ML Service (Railway)**

```bash
PYTHONUNBUFFERED=1
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
```

### **Frontend (Vercel)**

```bash
NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend can't connect to database**
   - Verify `DATABASE_URL` is correct
   - Check Railway network connectivity
   - Verify pgvector extension is installed

2. **ML Service fails to start**
   - Check `OPENAI_API_KEY` is set
   - Verify Python dependencies installed
   - Check logs for CLIP model download issues

3. **Frontend can't reach backend**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS configuration in backend
   - Verify backend is deployed and healthy

4. **Circuit breaker keeps opening**
   - Check ML service logs for errors
   - Verify OpenAI API key is valid and has credits
   - Check network connectivity between services

---

## ✅ **Deployment Complete!**

Your FashionDeck application is now live:

- 🌐 Frontend: `https://fashiondeck.vercel.app`
- 🔧 Backend API: `https://your-api-url.railway.app`
- 🤖 ML Service: `https://your-ml-service-url.railway.app`

**Next Steps:**

1. Monitor logs for errors
2. Set up Sentry for error tracking
3. Configure custom domain (optional)
4. Set up analytics (Google Analytics)
5. Monitor performance and optimize as needed
