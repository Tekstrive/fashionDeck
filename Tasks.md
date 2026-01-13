# FashionDeck Development Tasks

> **Development Roadmap**: Comprehensive task list for building FashionDeck MVP
>
> **Legend**: `[ ]` To Do | `[/]` In Progress | `[x]` Completed

---

## **Phase 1: Project Setup & Infrastructure**

### 1.1 Monorepo Initialization ✅

- [x] Initialize Git repository with `.gitignore` for Node.js, Python, and environment files
- [x] Set up Turborepo configuration (`turbo.json`)
  - [x] Define build pipeline with proper dependency ordering
  - [x] Configure cache settings for faster builds
  - [x] Set up output directories for each app
- [x] Create root `package.json` with npm workspaces
  - [x] Add workspace definitions for `apps/*` and `packages/*`
  - [x] Install Turborepo as dev dependency
  - [x] Add root-level scripts (dev, build, test, lint)
- [x] Create monorepo folder structure:
  ```
  apps/web, apps/api, apps/ml-service
  packages/types, packages/utils
  ```

### 1.2 Shared Packages Setup ✅

- [x] **packages/types** - Shared TypeScript types
  - [x] Create `package.json` with TypeScript configuration
  - [x] Define `Outfit` interface with all required fields
  - [x] Define `ProductItem` interface (category, title, price, image, urls, marketplace)
  - [x] Define `SearchQuery` interface (aesthetic, budget, size, gender, occasion, categories)
  - [x] Define `ProductResult` interface for marketplace adapters
  - [x] Define `ParsedPrompt` interface for LLM output
  - [x] Export all types from `index.ts`
  - [x] Set up build script to compile TypeScript
- [x] **packages/utils** - Shared utilities
  - [x] Create `package.json` with TypeScript configuration
  - [x] Add common validation functions
  - [x] Add price formatting utilities
  - [x] Add error handling utilities
  - [x] Export from `index.ts`

### 1.3 Docker & Local Development Environment ✅

- [x] Create `docker-compose.yml` at root
  - [x] Add PostgreSQL service with pgvector image (`ankane/pgvector:latest`)
  - [x] Add Redis service (redis:7-alpine)
  - [x] Add backend API service with build context
  - [x] Add ML service with build context
  - [x] Configure network and volume mounts
  - [x] Set environment variables for each service
- [x] Create `.env.example` files for each service
  - [x] Document all required environment variables
  - [x] Add placeholder values
- [x] Create `SETUP.md` with setup instructions
  - [x] Prerequisites (Node.js 20, Python 3.11, Docker)
  - [x] Installation steps
  - [x] Running local environment
  - [x] Troubleshooting guide

---

## **Phase 2: Database Setup**

### 2.1 PostgreSQL with pgvector ✅

- [x] Create database migration system
  - [x] Choose migration tool (node-pg-migrate or TypeORM migrations)
  - [x] Set up migration scripts folder
- [x] **Migration 001**: Initial schema
  - [x] Create `products` table with UUID primary key
  - [x] Add columns: marketplace, title, price, url, affiliate_url, sizes (JSONB), category, image_url
  - [x] Add vector columns: `image_embedding vector(512)`, `text_embedding vector(512)`
  - [x] Add timestamps: created_at, updated_at
  - [x] Create indexes on marketplace, category, price
  - [x] Create IVFFlat vector indexes for cosine similarity search
- [x] **Migration 002**: Query logs table (optional for MVP)
  - [x] Create table to track user queries for analytics
  - [x] Columns: id, prompt, parsed_json, response_time, created_at
- [x] Test pgvector functionality
  - [x] Insert sample product with embeddings
  - [x] Test cosine similarity queries
  - [x] Verify index performance

### 2.2 Redis Configuration ✅

- [x] Set up Redis connection module
- [x] Configure cache TTL strategies
  - [x] Product cache: 6-hour TTL
  - [x] Prompt pattern cache: 24-hour TTL
  - [x] Aesthetic embeddings: No expiry (manual refresh)
- [x] Set up BullMQ queues
  - [x] Product catalog refresh queue
  - [x] Embedding computation queue
  - [x] Analytics processing queue

---

## **Phase 3: Backend API (NestJS)**

### 3.1 Project Initialization

- [ ] Create `apps/api` with NestJS CLI
  - [ ] Initialize with TypeScript strict mode
  - [ ] Configure tsconfig to use `@fashiondeck/types`
  - [ ] Set up environment variable validation (class-validator)
- [ ] Create Dockerfile for production deployment
  - [ ] Multi-stage build (dependencies → build → production)
  - [ ] Copy monorepo packages properly
  - [ ] Expose port 3001
- [ ] Set up base configuration
  - [ ] Database connection module (TypeORM or Prisma)
  - [ ] Redis connection module
  - [ ] HTTP client module (axios)
  - [ ] Logging configuration (structured JSON logs)

### 3.2 Core Modules

#### 3.2.1 Query Module (`/modules/query`)

- [ ] Create `QueryController` with POST `/api/query` endpoint
  - [ ] Accept `{ prompt: string }` in request body
  - [ ] Validate input (max length, required fields)
  - [ ] Add rate limiting (10 requests/minute per IP)
  - [ ] Return structured outfit response
- [ ] Create `QueryService` orchestration layer
  - [ ] Call ML service for prompt parsing
  - [ ] Trigger parallel processing (planning + pre-fetch)
  - [ ] Call outfit assembly service
  - [ ] Log query metrics (latency, success/failure)
- [ ] Create DTOs (Data Transfer Objects)
  - [ ] `QueryRequestDto` - validate prompt
  - [ ] `QueryResponseDto` - structure outfit response
- [ ] Add error handling
  - [ ] Handle ML service timeouts (fallback response)
  - [ ] Handle no results found (graceful degradation)
  - [ ] Handle marketplace API failures

#### 3.2.2 Marketplace Module (`/modules/marketplace`)

- [ ] Create `MarketplaceAdapter` interface
  - [ ] `search(query: SearchQuery): Promise<ProductResult[]>`
  - [ ] `getDetails(productId: string): Promise<ProductDetail>`
  - [ ] `generateAffiliateLink(productUrl: string): string`
- [ ] **Amazon Adapter** implementation
  - [ ] Research Amazon India affiliate API options
  - [ ] Implement search functionality (API or web scraping)
  - [ ] Parse product results into `ProductResult` schema
  - [ ] Generate Amazon affiliate links with tracking ID
  - [ ] Add error handling for API rate limits
  - [ ] Add retry logic with exponential backoff
- [ ] **Flipkart Adapter** implementation
  - [ ] Research Flipkart affiliate API options
  - [ ] Implement search functionality
  - [ ] Parse product results into `ProductResult` schema
  - [ ] Generate Flipkart affiliate links
  - [ ] Add error handling and retry logic
- [ ] Create `MarketplaceService`
  - [ ] Aggregate results from multiple marketplaces
  - [ ] Deduplicate similar products (by title similarity)
  - [ ] Filter by availability and size
  - [ ] Cache results in Redis (6-hour TTL)
- [ ] Create background job for catalog refresh
  - [ ] Cron job to refresh top 1000 products per category daily
  - [ ] Store in PostgreSQL with embeddings
  - [ ] Update affiliate links

#### 3.2.3 Outfit Module (`/modules/outfit`)

- [ ] Create `OutfitService` for outfit assembly
  - [ ] Take parsed query + product candidates
  - [ ] Call ML service for outfit planning
  - [ ] Assemble complete outfits (top + bottom + optional shoes/accessories)
  - [ ] Calculate total price for each outfit
  - [ ] Filter by budget constraint
- [ ] Create scoring and ranking logic
  - [ ] Call ML service for embedding scores
  - [ ] Call ML service for LLM coherence scoring
  - [ ] Combine scores (weighted average)
  - [ ] Sort outfits by final score
  - [ ] Return top 2-6 outfits
- [ ] Add outfit validation
  - [ ] Ensure all required categories present
  - [ ] Verify affiliate links are valid
  - [ ] Check total price within budget (+10% tolerance)

#### 3.2.4 ML Communication Module (`/modules/ml`)

- [ ] Create `MLServiceClient`
  - [ ] HTTP client for FastAPI ML service
  - [ ] POST `/parse` - prompt parsing
  - [ ] POST `/plan` - outfit schema planning
  - [ ] POST `/score` - embedding scoring
  - [ ] POST `/rank` - LLM coherence ranking
- [ ] Add timeout configuration (5 seconds per call)
- [ ] Add retry logic for transient failures
- [ ] Add circuit breaker pattern (fail fast if ML service down)

### 3.3 API Documentation

- [ ] Set up Swagger/OpenAPI
  - [ ] Auto-generate API docs from decorators
  - [ ] Add example requests/responses
  - [ ] Document error codes and meanings
- [ ] Serve docs at `/api/docs`

### 3.4 Testing

- [ ] Unit tests for each service (80% coverage target)
  - [ ] Mock marketplace adapters
  - [ ] Mock ML service calls
  - [ ] Test error handling paths
- [ ] Integration tests
  - [ ] End-to-end query flow with test database
  - [ ] Marketplace adapter integration tests
- [ ] Performance tests
  - [ ] Load test with 100 concurrent requests
  - [ ] Measure p95 latency (target: ≤7s)

---

## **Phase 4: ML Microservice (FastAPI + Python)**

### 4.1 Project Setup

- [ ] Create `apps/ml-service` with FastAPI
  - [ ] Initialize Python virtual environment
  - [ ] Create `requirements.txt` with dependencies:
    - [ ] fastapi, uvicorn, pydantic
    - [ ] openai, anthropic (LLM SDKs)
    - [ ] transformers, torch (for CLIP)
    - [ ] psycopg2, redis (database clients)
    - [ ] pillow (image processing)
- [ ] Create Dockerfile
  - [ ] Use python:3.11-slim base image
  - [ ] Install dependencies
  - [ ] Copy application code
  - [ ] Expose port 8000
- [ ] Set up project structure
  ```
  app/
    main.py
    routes/ (API endpoints)
    services/ (business logic)
    embeddings/ (CLIP/OpenCLIP)
    prompts/ (LLM prompts)
    config.py
  ```

### 4.2 LLM Integration

#### 4.2.1 Prompt Parsing

- [ ] Create `routes/parse.py` with POST `/parse` endpoint
  - [ ] Accept `{ prompt: string }`
  - [ ] Return structured JSON: `{ aesthetic, budget, size, gender, occasion, categories }`
- [ ] Create `prompts/parse_prompt.txt` template
  - [ ] Design system prompt for extraction
  - [ ] Include examples (few-shot learning)
  - [ ] Enforce JSON output format
- [ ] Implement `services/parse_service.py`
  - [ ] Call GPT-4o-mini with structured output
  - [ ] Validate JSON response schema
  - [ ] Handle parsing errors (fallback to defaults)
- [ ] Add caching for identical prompts (Redis)

#### 4.2.2 Outfit Planning

- [ ] Create `routes/plan.py` with POST `/plan` endpoint
  - [ ] Accept parsed query JSON
  - [ ] Return outfit schema (e.g., ["oversized t-shirt", "straight pants", "white sneakers"])
- [ ] Create `prompts/plan_outfit.txt` template
  - [ ] Map aesthetic → item types
  - [ ] Examples for common aesthetics (korean minimal, streetwear, y2k, etc.)
  - [ ] Enforce 2-4 item limit
- [ ] Implement `services/plan_service.py`
  - [ ] Call GPT-4o-mini for planning
  - [ ] Validate item categories
  - [ ] Cache common aesthetic patterns

#### 4.2.3 Outfit Scoring

- [ ] Create `routes/score.py` with POST `/score` endpoint
  - [ ] Accept outfit candidates with product details
  - [ ] Return scores for each outfit (1-10)
- [ ] Create `prompts/score_outfit.txt` template
  - [ ] Criteria: color coherence, silhouette matching, trend alignment
  - [ ] Batch scoring (10 outfits per call for cost efficiency)
- [ ] Implement `services/score_service.py`
  - [ ] Call Claude 3 Haiku for ranking (better at comparison tasks)
  - [ ] Parse numeric scores from response
  - [ ] Combine with embedding scores (weighted average: 60% LLM, 40% embeddings)

### 4.3 Embedding System

#### 4.3.1 Setup CLIP/OpenCLIP

- [ ] Download and cache CLIP model (ViT-B/32 or ViT-L/14)
  - [ ] Store model in `/models` directory
  - [ ] Load model on service startup
- [ ] Create `embeddings/clip_service.py`
  - [ ] `encode_image(image_url) → vector[512]`
  - [ ] `encode_text(text) → vector[512]`
  - [ ] Batch processing support
- [ ] Test embedding generation
  - [ ] Verify output dimensions (512)
  - [ ] Test cosine similarity calculations

#### 4.3.2 Product Embedding Pipeline

- [ ] Create `routes/embed.py` with POST `/embed` endpoint
  - [ ] Accept product ID or image URL
  - [ ] Return image + text embeddings
- [ ] Implement `services/embed_service.py`
  - [ ] Download product image
  - [ ] Generate image embedding via CLIP
  - [ ] Generate text embedding from title + category
  - [ ] Store embeddings in PostgreSQL
- [ ] Create background worker for bulk embedding
  - [ ] Process new products from queue
  - [ ] Batch embed 32 images at a time

#### 4.3.3 Similarity Search

- [ ] Create `services/similarity_service.py`
  - [ ] Query pgvector for nearest neighbors
  - [ ] Filter by category, price range
  - [ ] Return top K similar products
- [ ] Implement style coherence scoring
  - [ ] Calculate pairwise similarity between outfit items
  - [ ] Penalize low coherence (<0.6 similarity)

### 4.4 Pre-computed Aesthetic Embeddings

- [ ] Create script to pre-compute common aesthetics
  - [ ] List of 20-30 popular aesthetics (korean minimal, streetwear, y2k, cottagecore, etc.)
  - [ ] Generate text embeddings for each
  - [ ] Store in Redis with no expiry
- [ ] Use aesthetic embeddings for faster search
  - [ ] Semantic search: user prompt → nearest aesthetic
  - [ ] Filter products by aesthetic similarity

### 4.5 API Documentation & Testing

- [ ] Set up FastAPI automatic OpenAPI docs (available at `/docs`)
- [ ] Add request/response examples to all endpoints
- [ ] Unit tests for each service
  - [ ] Mock LLM API calls
  - [ ] Mock CLIP model outputs
  - [ ] Test error handling
- [ ] Integration tests
  - [ ] Test full pipeline: parse → plan → score
  - [ ] Test with real LLM calls (use test API keys)

---

## **Phase 5: Frontend (Next.js)**

### 5.1 Project Setup

- [ ] Create `apps/web` with Next.js 14 (App Router)
  - [ ] Initialize with TypeScript
  - [ ] Configure `next.config.js` for monorepo paths
  - [ ] Add `@fashiondeck/types` to dependencies
- [ ] Set up TailwindCSS
  - [ ] Install tailwindcss, postcss, autoprefixer
  - [ ] Configure `tailwind.config.js` with custom theme
  - [ ] Create design tokens (colors, spacing, typography)
- [ ] Install UI libraries
  - [ ] Headless UI or Radix UI for components
  - [ ] Lucide React for icons
- [ ] Set up fonts
  - [ ] Load Google Fonts (Inter or Outfit for modern look)
  - [ ] Configure in layout.tsx

### 5.2 Core Pages

#### 5.2.1 Landing Page (`app/page.tsx`)

- [ ] Create hero section
  - [ ] Headline: Clear value proposition
  - [ ] Subheadline: Explain how it works
  - [ ] CTA button to `/search`
- [ ] Add "How It Works" section (3 steps)
  - [ ] 1. Describe your style
  - [ ] 2. Get curated outfits
  - [ ] 3. Shop instantly
- [ ] Add "Outfit Inspiration Gallery"
  - [ ] Pre-generated outfits for 6-8 popular aesthetics
  - [ ] Click to auto-fill search prompt
  - [ ] Use generate_image tool to create mockup outfit images
- [ ] Add footer
  - [ ] Links (About, Contact, Privacy, Terms)
  - [ ] Social media links
  - [ ] Copyright notice
- [ ] SEO optimization
  - [ ] Title tag: "FashionDeck - AI-Powered Outfit Recommendations"
  - [ ] Meta description (compelling, 155 chars)
  - [ ] Open Graph tags for social sharing
  - [ ] Structured data (JSON-LD schema.org)

#### 5.2.2 Search Page (`app/search/page.tsx`)

- [ ] Create search input component
  - [ ] Large text input with placeholder examples
  - [ ] Real-time character count
  - [ ] Submit button with loading state
- [ ] Add optional filters (progressive disclosure)
  - [ ] Toggle to show advanced options
  - [ ] Dropdowns for: size, gender, occasion
  - [ ] Price range slider
- [ ] Implement search submission
  - [ ] POST to `/api/query` via fetch/axios
  - [ ] Show loading skeleton while waiting
  - [ ] Handle errors gracefully (toast notifications)
- [ ] Display results (outfit cards)
  - [ ] Grid layout (2 columns on mobile, 3-4 on desktop)
  - [ ] Each card shows: outfit preview, total price, aesthetic label
  - [ ] Hover effects, smooth animations

### 5.3 Components

#### 5.3.1 PromptInput Component

- [ ] Create `components/PromptInput.tsx`
  - [ ] Controlled input with state management
  - [ ] Auto-focus on mount
  - [ ] Keyboard shortcuts (Cmd/Ctrl+Enter to submit)
  - [ ] Suggested prompts (chips below input)
- [ ] Add validation
  - [ ] Min 10 characters
  - [ ] Max 200 characters
  - [ ] Show error states

#### 5.3.2 OutfitCard Component

- [ ] Create `components/OutfitCard.tsx`
  - [ ] Props: `outfit: Outfit` from shared types
  - [ ] Display all outfit items in grid
  - [ ] Show total price prominently
  - [ ] Show aesthetic label badge
  - [ ] "View Items" button to expand details
- [ ] Add glassmorphism styling
  - [ ] Semi-transparent background
  - [ ] Backdrop blur effect
  - [ ] Subtle border with gradient

#### 5.3.3 ItemCard Component

- [ ] Create `components/ItemCard.tsx`
  - [ ] Props: `item: ProductItem`
  - [ ] Display product image (Next.js Image component)
  - [ ] Show title, price, category
  - [ ] Marketplace badge (Amazon/Flipkart logo)
  - [ ] "Buy Now" button → opens affiliate link in new tab
- [ ] Add hover effects
  - [ ] Scale up image slightly
  - [ ] Show quick preview overlay
  - [ ] Smooth transitions

#### 5.3.4 LoadingSkeleton Component

- [ ] Create `components/LoadingSkeleton.tsx`
  - [ ] Shimmer animation effect
  - [ ] Placeholder cards matching OutfitCard layout
  - [ ] Show 4-6 skeleton cards

#### 5.3.5 MarketplaceBadge Component

- [ ] Create `components/MarketplaceBadge.tsx`
  - [ ] Display Amazon or Flipkart logo
  - [ ] Tooltip with marketplace name
  - [ ] Color coding (Amazon orange, Flipkart yellow)

### 5.4 Streaming Responses (Advanced)

- [ ] Implement Server-Sent Events (SSE) or streaming fetch
  - [ ] Backend sends outfits as they're ready
  - [ ] Frontend displays progressively
  - [ ] First outfit appears in ~3s
- [ ] Update UI progressively
  - [ ] Show first outfit immediately
  - [ ] Append additional outfits as they stream in
  - [ ] Visual indicator: "Loading more outfits..."

### 5.5 Design & UX Polish

- [ ] Implement dark mode
  - [ ] Use CSS variables for theming
  - [ ] Theme toggle in header
  - [ ] Persist preference in localStorage
- [ ] Add micro-animations
  - [ ] Button hover effects
  - [ ] Card entrance animations (stagger effect)
  - [ ] Smooth page transitions
- [ ] Responsive design
  - [ ] Mobile-first approach
  - [ ] Test on multiple breakpoints (sm, md, lg, xl)
  - [ ] Touch-friendly UI elements
- [ ] Accessibility
  - [ ] Semantic HTML
  - [ ] ARIA labels for interactive elements
  - [ ] Keyboard navigation support
  - [ ] Screen reader testing

### 5.6 Performance Optimization

- [ ] Next.js Image optimization
  - [ ] Use `next/image` for all product images
  - [ ] Lazy loading below the fold
  - [ ] Responsive image sizes
- [ ] Code splitting
  - [ ] Dynamic imports for heavy components
  - [ ] Route-based splitting
- [ ] Prefetching
  - [ ] Prefetch search page on landing
  - [ ] Prefetch affiliate links on hover

### 5.7 Analytics & Monitoring

- [ ] Add Google Analytics 4
  - [ ] Track page views
  - [ ] Track search queries (anonymized)
  - [ ] Track affiliate link clicks (conversion tracking)
- [ ] Add error tracking (Sentry)
  - [ ] Capture frontend errors
  - [ ] Track API failures
  - [ ] User session recording (optional)

---

## **Phase 6: Integration & End-to-End Testing**

### 6.1 Service Integration

- [ ] Connect frontend → backend API
  - [ ] Configure API endpoint URL (environment variable)
  - [ ] Test POST `/api/query` from frontend
  - [ ] Verify response format matches types
- [ ] Connect backend → ML service
  - [ ] Configure ML service URL (environment variable)
  - [ ] Test all ML endpoints (parse, plan, score)
  - [ ] Add retry logic for failures
- [ ] Connect backend → marketplaces
  - [ ] Test Amazon adapter with real searches
  - [ ] Test Flipkart adapter with real searches
  - [ ] Verify affiliate link generation

### 6.2 Database Integration

- [ ] Test product insertion and retrieval
- [ ] Test embedding storage and vector search
- [ ] Test Redis caching
  - [ ] Verify cache hits/misses
  - [ ] Test TTL expiry

### 6.3 End-to-End Testing

- [ ] Create E2E test suite (Playwright or Cypress)
  - [ ] Test: User lands on homepage → clicks CTA → enters prompt → sees outfits → clicks buy
  - [ ] Test: Use inspiration gallery to auto-fill prompt
  - [ ] Test: Apply filters (budget, size) and get filtered results
  - [ ] Test: Error handling (invalid prompt, no results, API timeout)
- [ ] Performance testing
  - [ ] Use Lighthouse for frontend performance audit
  - [ ] Use k6 or Artillery for backend load testing
  - [ ] Measure p95 latency end-to-end (target: ≤7s)

### 6.4 Cross-Browser Testing

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile browsers (iOS Safari, Chrome Mobile)
- [ ] Fix any browser-specific issues

---

## **Phase 7: Deployment**

### 7.1 Environment Configuration

- [ ] Set up production environment variables
  - [ ] Database connection strings
  - [ ] API keys (OpenAI, Anthropic, Affiliate programs)
  - [ ] Redis connection URL
  - [ ] Frontend API endpoint
- [ ] Create `.env.production` files for each service
- [ ] Set up secrets management (Railway secrets, Vercel env vars)

### 7.2 Frontend Deployment (Vercel)

- [ ] Create Vercel project
- [ ] Connect GitHub repository
- [ ] Configure build settings
  - [ ] Root Directory: `apps/web`
  - [ ] Build Command: `cd ../.. && npm run build --filter=web`
  - [ ] Output Directory: `apps/web/.next`
- [ ] Set environment variables in Vercel dashboard
- [ ] Deploy and test production build
- [ ] Set up custom domain (optional)

### 7.3 Backend API Deployment (Railway)

- [ ] Create Railway project for backend
- [ ] Connect GitHub repository
- [ ] Configure service from Dockerfile
  - [ ] Dockerfile path: `apps/api/Dockerfile`
  - [ ] Port: 3001
- [ ] Set environment variables
- [ ] Deploy and test health endpoint
- [ ] Get public URL for API

### 7.4 ML Service Deployment (Railway)

- [ ] Create Railway project for ML service
- [ ] Connect GitHub repository
- [ ] Configure service from Dockerfile
  - [ ] Dockerfile path: `apps/ml-service/Dockerfile`
  - [ ] Port: 8000
- [ ] Set environment variables (LLM API keys)
- [ ] Deploy and test `/docs` endpoint
- [ ] Monitor cold start times

### 7.5 Database Deployment (Railway)

- [ ] Create PostgreSQL database on Railway
  - [ ] Select PostgreSQL with pgvector plugin
  - [ ] Note connection string
- [ ] Run migrations on production database
  - [ ] Execute migration scripts
  - [ ] Verify tables and indexes created
- [ ] Create Redis instance on Railway
  - [ ] Note connection URL
  - [ ] Test connection from backend

### 7.6 CI/CD Pipeline

- [ ] Create `.github/workflows/deploy.yml`
  - [ ] Trigger on push to `main` branch
  - [ ] Run tests before deployment
  - [ ] Deploy frontend to Vercel (if `apps/web` changed)
  - [ ] Deploy backend to Railway (if `apps/api` changed)
  - [ ] Deploy ML service to Railway (if `apps/ml-service` changed)
- [ ] Add deployment status checks
- [ ] Set up notifications (Slack/Discord) for deployment results

### 7.7 Monitoring & Observability

- [ ] Set up Sentry for error tracking
  - [ ] Frontend integration
  - [ ] Backend integration
  - [ ] Alert on critical errors
- [ ] Set up structured logging
  - [ ] All services log to stdout in JSON format
  - [ ] Railway automatically captures logs
- [ ] Create uptime monitoring (optional)
  - [ ] Use Checkly or UptimeRobot
  - [ ] Ping `/api/health` every 5 minutes
  - [ ] Alert if service down

---

## **Phase 8: Optimization & Polish**

### 8.1 Performance Tuning

- [ ] Implement parallel processing in backend
  - [ ] Run marketplace fetches in parallel
  - [ ] Run LLM plan + pre-fetch concurrently
- [ ] Optimize database queries
  - [ ] Add indexes for common queries
  - [ ] Use connection pooling
- [ ] Optimize ML service
  - [ ] Batch API calls where possible
  - [ ] Cache model outputs in Redis
- [ ] Measure and optimize latency
  - [ ] Profile slow endpoints
  - [ ] Target p95 latency ≤5s (stretch goal from 7s)

### 8.2 Cost Optimization

- [ ] Implement LLM cost controls
  - [ ] Use GPT-4o-mini for parsing/planning
  - [ ] Use Claude 3 Haiku for scoring
  - [ ] Batch scoring calls (10 outfits per call)
- [ ] Optimize embedding costs
  - [ ] Cache embeddings for all products
  - [ ] Only recompute when product changes
- [ ] Monitor infrastructure costs
  - [ ] Track Railway usage
  - [ ] Optimize Redis memory usage
  - [ ] Set up budget alerts

### 8.3 Feature Flags

- [ ] Set up Vercel Feature Flags or LaunchDarkly
- [ ] Create flags for:
  - [ ] Streaming responses (enable/disable)
  - [ ] New marketplace (gradual rollout)
  - [ ] Advanced filters (beta testing)
- [ ] Implement kill switches for expensive features

### 8.4 SEO Enhancements

- [ ] Create sitemap.xml
  - [ ] Include landing page, search page
  - [ ] Submit to Google Search Console
- [ ] Create robots.txt
- [ ] Add schema.org structured data
  - [ ] Product schema for outfit items
  - [ ] FAQPage schema for landing
- [ ] Optimize meta tags for all pages
- [ ] Ensure fast Core Web Vitals
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### 8.5 User Feedback & Iteration

- [ ] Add feedback mechanism
  - [ ] "Was this helpful?" thumbs up/down on results
  - [ ] Optional text feedback form
  - [ ] Store feedback for analysis
- [ ] A/B testing setup
  - [ ] Test different prompt examples
  - [ ] Test outfit card layouts
  - [ ] Test CTA button copy
- [ ] Analytics review
  - [ ] Analyze top queries
  - [ ] Identify failed searches (no results)
  - [ ] Track affiliate conversion rate

---

## **Phase 9: Documentation & Handoff**

### 9.1 Technical Documentation

- [ ] Update README.md at root
  - [ ] Project overview
  - [ ] Architecture diagram
  - [ ] Setup instructions
  - [ ] Deployment guide
- [ ] Document each service
  - [ ] API documentation (Swagger/OpenAPI)
  - [ ] Code comments for complex logic
  - [ ] Environment variable reference
- [ ] Create troubleshooting guide
  - [ ] Common errors and solutions
  - [ ] How to debug issues
  - [ ] Contact information

### 9.2 User Documentation

- [ ] Create FAQ page
  - [ ] How does it work?
  - [ ] How accurate are the recommendations?
  - [ ] How do affiliate links work?
  - [ ] Privacy policy
- [ ] Create Terms of Service
- [ ] Create Privacy Policy
  - [ ] Data collection disclosure
  - [ ] Cookie usage
  - [ ] Affiliate link disclosure

### 9.3 Runbook for Operations

- [ ] How to deploy updates
- [ ] How to rollback deployments
- [ ] How to monitor service health
- [ ] How to handle incidents
- [ ] How to scale services

---

## **Phase 10: Launch Preparation**

### 10.1 Pre-Launch Checklist

- [ ] Security audit
  - [ ] No API keys in code (all in env vars)
  - [ ] Rate limiting enabled
  - [ ] Input validation on all endpoints
  - [ ] CORS properly configured
- [ ] Performance audit
  - [ ] Run load tests
  - [ ] Ensure caching working correctly
  - [ ] Verify database indexes performant
- [ ] Legal compliance
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] Affiliate disclosure visible
  - [ ] Cookie consent (if applicable)

### 10.2 Soft Launch

- [ ] Launch to small group (friends, beta testers)
- [ ] Monitor for errors and issues
- [ ] Gather initial feedback
- [ ] Fix critical bugs

### 10.3 Public Launch

- [ ] Announce on social media
- [ ] Submit to product directories (Product Hunt, etc.)
- [ ] Monitor server load and scale if needed
- [ ] Respond to user feedback

### 10.4 Post-Launch Monitoring

- [ ] Daily monitoring of key metrics
  - [ ] User queries per day
  - [ ] Success rate (queries with results)
  - [ ] Affiliate click-through rate
  - [ ] Error rate
  - [ ] Average latency
- [ ] Weekly analytics review
- [ ] Monthly cost review
- [ ] Continuous iteration based on data

---

## **Future Enhancements (Post-MVP)**

These are explicitly out of scope for MVP but documented for future reference:

- [ ] User accounts & profiles
  - [ ] Save favorite outfits
  - [ ] Size preferences stored
  - [ ] Purchase history
- [ ] Social features
  - [ ] Share outfits
  - [ ] Creator boards/lookbooks
  - [ ] Community voting
- [ ] Wardrobe upload
  - [ ] Upload existing clothes
  - [ ] Get outfit suggestions with owned items
- [ ] International expansion
  - [ ] Support for US, UK retailers
  - [ ] Multi-currency support
  - [ ] Localization
- [ ] Admin panel
  - [ ] Manage products manually
  - [ ] View analytics dashboard
  - [ ] Moderate user content
- [ ] Mobile app
  - [ ] React Native or Flutter
  - [ ] Push notifications
  - [ ] Camera integration for style capture

---

## **Notes**

- **Task Dependencies**: Many tasks can be parallelized, but follow phase order for dependencies
- **Estimated Timeline**: MVP can be completed in 8-12 weeks with 1-2 developers
- **Priority**: Focus on core flow first (Phase 1-7), optimization can be iterative
- **Testing**: Write tests as you build, not after (easier to maintain)
- **Documentation**: Update docs as code changes, not as a final step
