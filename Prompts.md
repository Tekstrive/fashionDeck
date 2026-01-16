# FashionDeck Development Prompts

> **Purpose**: Context-aware prompts to guide AI assistant through each development task without losing context or encountering errors.
>
> **Usage**: Copy the relevant prompt and provide it to the AI assistant when starting each task phase.

---

## **📋 General Context Prompt (Use Before Every Session)**

```
I'm working on FashionDeck, an AI-powered fashion outfit recommendation platform.

**Project Context:**
- Monorepo structure with Turborepo (apps/web, apps/api, apps/ml-service, packages/types, packages/utils)
- Tech Stack: Next.js 14, NestJS, FastAPI, PostgreSQL+pgvector, Redis
- Goal: Users input natural language prompts → receive 2-6 curated outfits from Amazon/Flipkart
- Target latency: ≤7 seconds p95

**Current Status:**
- We are on Phase [X], Task [X.X] from Tasks.md
- Previous completed tasks: [list key completed tasks]
- Current blockers: [list any blockers or issues]

**Files to Reference:**
- PRD.md - Full product requirements
- Tasks.md - Detailed task breakdown
- Prompts.md - This file with execution prompts

Please review the PRD.md and Tasks.md before proceeding.
```

---

## **Phase 1: Project Setup & Infrastructure**

### **Prompt 1.1: Monorepo Initialization**

```
Task: Initialize the FashionDeck monorepo with Turborepo.

**Context:**
- Working directory: c:\Users\Bharath Kannan\OneDrive\Desktop\work\FashionDeck
- This is a fresh project start
- Need to set up: Turborepo, npm workspaces, folder structure

**Requirements:**
1. Initialize Git repository with proper .gitignore (Node.js, Python, .env files)
2. Create root package.json with npm workspaces for apps/* and packages/*
3. Install and configure Turborepo (turbo.json)
4. Create folder structure:
   - apps/web (Next.js frontend)
   - apps/api (NestJS backend)
   - apps/ml-service (FastAPI ML service)
   - packages/types (shared TypeScript types)
   - packages/utils (shared utilities)
5. Add root-level scripts: dev, build, test, lint

**Success Criteria:**
- `npm install` runs without errors
- Folder structure matches PRD Section 11
- turbo.json properly configured with build pipeline

**Reference:** PRD.md Section 6.1, 11

Please execute this task step-by-step, showing all commands and file contents.
```

### **Prompt 1.2: Shared Packages Setup**

```
Task: Create shared TypeScript packages for types and utilities.

**Context:**
- Monorepo is initialized (Task 1.1 completed)
- Need to create packages that will be used by web, api, and ml-service

**Requirements:**
1. Create packages/types with:
   - Outfit interface (aesthetic, totalPrice, items[])
   - ProductItem interface (category, title, price, image, url, affiliateUrl, marketplace)
   - SearchQuery interface (aesthetic, budget, size, gender, occasion, categories)
   - ProductResult interface (for marketplace adapters)
   - ParsedPrompt interface (for LLM output)
2. Create packages/utils with:
   - Price formatting utilities
   - Validation functions
   - Error handling utilities
3. Each package needs package.json with TypeScript build config
4. Export all types/utils from index.ts

**Success Criteria:**
- Both packages build successfully with `npm run build`
- Types are importable as `@fashiondeck/types`
- No TypeScript errors

**Reference:** PRD.md Section 11.1, Tasks.md Phase 1.2

Show me the complete interface definitions and package.json files.
```

### **Prompt 1.3: Docker & Local Development Environment**

```
Task: Set up Docker Compose for local development environment.

**Context:**
- Monorepo structure is ready (Tasks 1.1, 1.2 completed)
- Need local PostgreSQL with pgvector, Redis, and service containers

**Requirements:**
1. Create docker-compose.yml at root with services:
   - postgres (ankane/pgvector:latest) on port 5432
   - redis (redis:7-alpine) on port 6379
   - api (build from apps/api) on port 3001
   - ml-service (build from apps/ml-service) on port 8000
2. Create .env.example files for each service
3. Create comprehensive README.md with:
   - Prerequisites (Node.js 20, Python 3.11, Docker)
   - Installation steps
   - How to run: `docker-compose up`
   - Troubleshooting common issues

**Success Criteria:**
- `docker-compose up` starts all services without errors
- PostgreSQL accessible with pgvector extension enabled
- Redis accessible and responding to PING

**Reference:** PRD.md Section 14.3, Tasks.md Phase 1.3

Provide the complete docker-compose.yml and .env.example files.
```

---

## **Phase 2: Database Setup**

### **Prompt 2.1: PostgreSQL with pgvector**

```
Task: Set up PostgreSQL database schema with pgvector for embeddings.

**Context:**
- Docker environment is running (Task 1.3 completed)
- PostgreSQL with pgvector extension is available
- Need to create products table with vector columns

**Requirements:**
1. Choose migration tool (recommend node-pg-migrate for NestJS compatibility)
2. Create Migration 001 - Initial schema:
   - products table with UUID primary key
   - Columns: marketplace, title, price, url, affiliate_url, sizes (JSONB), category, image_url
   - Vector columns: image_embedding vector(512), text_embedding vector(512)
   - Timestamps: created_at, updated_at
   - Indexes: marketplace, category, price
   - IVFFlat vector indexes for cosine similarity
3. Create Migration 002 - Query logs table (optional):
   - Track user queries for analytics
   - Columns: id, prompt, parsed_json, response_time, created_at

**Success Criteria:**
- Migrations run successfully: `npm run migrate`
- pgvector extension is enabled
- Can insert sample product with embeddings
- Vector similarity queries work correctly

**Reference:** PRD.md Section 13, Tasks.md Phase 2.1

Show me the migration files and test queries to verify vector search.
```

### **Prompt 2.2: Redis Configuration**

```
Task: Configure Redis for caching and message queues.

**Context:**
- Redis is running in Docker (Task 1.3 completed)
- Need to set up caching strategies and BullMQ queues

**Requirements:**
1. Create Redis connection module for NestJS backend
2. Configure cache TTL strategies:
   - Product cache: 6-hour TTL
   - Prompt pattern cache: 24-hour TTL
   - Aesthetic embeddings: No expiry (manual refresh)
3. Set up BullMQ queues:
   - Product catalog refresh queue
   - Embedding computation queue
   - Analytics processing queue

**Success Criteria:**
- Redis connection established from backend
- Cache set/get operations work
- BullMQ queues can accept and process jobs

**Reference:** PRD.md Section 6.5, Tasks.md Phase 2.2

Provide the Redis module code and queue configurations.
```

---

## **Phase 3: Backend API (NestJS)**

### **Prompt 3.1: NestJS Project Initialization**

```
Task: Initialize NestJS backend API in apps/api.

**Context:**
- Monorepo is set up (Phase 1 completed)
- Database is configured (Phase 2 completed)
- Working in apps/api directory

**Requirements:**
1. Initialize NestJS project with TypeScript strict mode
2. Configure tsconfig to use @fashiondeck/types package
3. Set up environment variable validation (class-validator)
4. Create Dockerfile for production deployment:
   - Multi-stage build
   - Copy monorepo packages properly
   - Expose port 3001
5. Configure base modules:
   - Database connection (TypeORM or Prisma)
   - Redis connection
   - HTTP client (axios)
   - Structured logging (JSON format)

**Success Criteria:**
- `npm run dev` starts NestJS server on port 3001
- Can import types from @fashiondeck/types
- Environment variables validated on startup
- Health check endpoint responds: GET /health

**Reference:** PRD.md Section 6.3, Tasks.md Phase 3.1

Show me the main.ts, app.module.ts, and Dockerfile.
```

### **Prompt 3.2.1: Query Module Implementation**

```
Task: Implement the Query module for handling user search requests.

**Context:**
- NestJS backend is initialized (Task 3.1 completed)
- This is the main entry point for user queries
- Need to orchestrate: ML service → marketplace → outfit assembly

**Requirements:**
1. Create QueryController with POST /api/query endpoint:
   - Accept { prompt: string } in request body
   - Validate input (max 200 chars, min 10 chars)
   - Add rate limiting (10 requests/minute per IP)
   - Return structured outfit response
2. Create QueryService orchestration:
   - Call ML service for prompt parsing
   - Trigger parallel processing (planning + pre-fetch)
   - Call outfit assembly service
   - Log query metrics (latency, success/failure)
3. Create DTOs:
   - QueryRequestDto with validation
   - QueryResponseDto matching Outfit[] type
4. Add comprehensive error handling:
   - ML service timeouts → fallback response
   - No results found → graceful message
   - Marketplace failures → retry logic

**Success Criteria:**
- POST /api/query accepts prompt and returns outfits
- Rate limiting works (429 error after 10 requests)
- Errors return proper HTTP status codes and messages
- Response time logged for each query

**Reference:** PRD.md Section 9.1, Tasks.md Phase 3.2.1

Provide the complete controller, service, and DTO files.
```

### **Prompt 3.2.2: Marketplace Module - Amazon Adapter**

```
Task: Implement Amazon India marketplace adapter.

**Context:**
- Query module is ready (Task 3.2.1 completed)
- Need to fetch products from Amazon India
- Must implement MarketplaceAdapter interface

**Requirements:**
1. Create MarketplaceAdapter interface:
   - search(query: SearchQuery): Promise<ProductResult[]>
   - getDetails(productId: string): Promise<ProductDetail>
   - generateAffiliateLink(productUrl: string): string
2. Implement AmazonAdapter:
   - Research Amazon India affiliate API (Amazon Associates or Product Advertising API)
   - Implement search functionality
   - Parse results into ProductResult schema
   - Generate affiliate links with tracking ID
   - Add error handling for rate limits
   - Add retry logic with exponential backoff (3 retries)
3. Add caching:
   - Cache search results in Redis (6-hour TTL)
   - Cache key: hash of search query

**Success Criteria:**
- Can search Amazon for "korean minimal t-shirt" and get results
- Results match ProductResult interface
- Affiliate links include tracking ID
- Cached results return faster on second call

**Reference:** PRD.md Section 7, Tasks.md Phase 3.2.2

**Important:** If Amazon API requires paid subscription, implement web scraping fallback with proper error handling.

Show me the adapter implementation and test results.
```

### **Prompt 3.2.3: Marketplace Module - Flipkart Adapter**

```
Task: Implement Flipkart marketplace adapter.

**Context:**
- Amazon adapter is complete (Task 3.2.2 completed)
- Same interface, different marketplace
- Flipkart Affiliate API available

**Requirements:**
1. Implement FlipkartAdapter using same MarketplaceAdapter interface
2. Research Flipkart Affiliate API
3. Implement search, getDetails, generateAffiliateLink
4. Add same error handling and caching as Amazon adapter
5. Create MarketplaceService to aggregate both:
   - Call Amazon and Flipkart in parallel
   - Deduplicate similar products (title similarity >80%)
   - Filter by availability and size
   - Return combined results

**Success Criteria:**
- Flipkart search works independently
- MarketplaceService returns combined results from both
- Deduplication removes obvious duplicates
- Parallel calls complete faster than sequential

**Reference:** PRD.md Section 7, Tasks.md Phase 3.2.2

Show me FlipkartAdapter and MarketplaceService implementations.
```

### **Prompt 3.2.4: Outfit Module Implementation**

```
Task: Implement outfit assembly, scoring, and ranking.

**Context:**
- Marketplace adapters are ready (Tasks 3.2.2, 3.2.3 completed)
- ML service will provide scores (to be built in Phase 4)
- For now, mock ML service responses

**Requirements:**
1. Create OutfitService:
   - Take parsed query + product candidates
   - Assemble complete outfits (top + bottom + optional shoes/accessories)
   - Calculate total price for each outfit
   - Filter by budget constraint (+10% tolerance)
2. Implement scoring and ranking:
   - Call ML service for embedding scores (mock for now)
   - Call ML service for LLM coherence scores (mock for now)
   - Combine scores: weighted average (60% LLM, 40% embeddings)
   - Sort by final score descending
   - Return top 2-6 outfits
3. Add outfit validation:
   - Ensure required categories present (at least top + bottom)
   - Verify affiliate links are valid URLs
   - Check total price within budget

**Success Criteria:**
- Can assemble outfits from product list
- Outfits sorted by score (highest first)
- Budget filtering works correctly
- Returns 2-6 outfits as specified

**Reference:** PRD.md Section 4.2, Tasks.md Phase 3.2.3

**Note:** Use mock ML scores for now. We'll integrate real ML service in Phase 4.

Show me the OutfitService implementation.
```

### **Prompt 3.2.5: ML Communication Module**

```
Task: Create ML service client for backend-to-ML communication.

**Context:**
- Backend modules are ready (Tasks 3.2.1-3.2.4 completed)
- ML service will be built in Phase 4
- Need HTTP client to communicate with FastAPI ML service

**Requirements:**
1. Create MLServiceClient with methods:
   - parsePrompt(prompt: string): Promise<ParsedPrompt>
   - planOutfit(query: ParsedPrompt): Promise<string[]>
   - scoreEmbeddings(outfits: Outfit[]): Promise<number[]>
   - rankOutfits(outfits: Outfit[]): Promise<number[]>
2. Configure HTTP client:
   - Base URL from environment variable (ML_SERVICE_URL)
   - Timeout: 5 seconds per call
   - Retry logic for transient failures (3 retries)
3. Add circuit breaker pattern:
   - If ML service fails 5 times in 1 minute, open circuit
   - Return fallback responses when circuit open
   - Auto-close circuit after 30 seconds

**Success Criteria:**
- Client can make HTTP calls to ML service endpoints
- Timeouts work correctly (5s max)
- Circuit breaker prevents cascading failures
- Fallback responses allow graceful degradation

**Reference:** PRD.md Section 5.2, Tasks.md Phase 3.2.4

Show me the MLServiceClient implementation with circuit breaker.
```

---

## **Phase 4: ML Microservice (FastAPI + Python)**

### **Prompt 4.1: FastAPI Project Setup**

```
Task: Initialize FastAPI ML microservice in apps/ml-service.

**Context:**
- Backend is complete and waiting for ML service (Phase 3 completed)
- Working in apps/ml-service directory
- Python 3.11 required

**Requirements:**
1. Create Python project structure:
   - app/main.py (FastAPI app)
   - app/routes/ (API endpoints)
   - app/services/ (business logic)
   - app/embeddings/ (CLIP/OpenCLIP)
   - app/prompts/ (LLM prompt templates)
   - app/config.py (environment config)
2. Create requirements.txt with:
   - fastapi, uvicorn, pydantic
   - openai (LLM SDK)
   - transformers, torch (for CLIP)
   - psycopg2, redis (database clients)
   - pillow (image processing)
3. Create Dockerfile:
   - python:3.11-slim base
   - Install dependencies
   - Copy app code
   - Expose port 8000
4. Create main.py with health check endpoint

**Success Criteria:**
- `uvicorn app.main:app --reload` starts server on port 8000
- GET /health returns 200 OK
- All dependencies install without errors
- Docker build succeeds

**Reference:** PRD.md Section 6.4, Tasks.md Phase 4.1

Show me the project structure, requirements.txt, and main.py.
```

### **Prompt 4.2.1: Prompt Parsing with LLM**

```
Task: Implement natural language prompt parsing using GPT-4o-mini.

**Context:**
- FastAPI service is running (Task 4.1 completed)
- Need to convert "korean minimal fit size M under 1500" → structured JSON
- Using OpenAI GPT-4o-mini for cost efficiency

**Requirements:**
1. Create POST /parse endpoint in app/routes/parse.py:
   - Accept { "prompt": string }
   - Return ParsedPrompt JSON
2. Create prompt template in app/prompts/parse_prompt.txt:
   - System prompt for extraction task
   - Few-shot examples (3-5 examples)
   - Enforce JSON output format with schema
3. Implement app/services/parse_service.py:
   - Call OpenAI API with GPT-4o-mini
   - Use structured output mode (JSON schema)
   - Validate response matches ParsedPrompt interface
   - Handle parsing errors (fallback to defaults)
4. Add Redis caching:
   - Cache identical prompts (24-hour TTL)
   - Cache key: hash of prompt text

**Success Criteria:**
- "korean minimal fit size M under 1500" → { aesthetic: "korean minimal", budget: 1500, size: "M", ... }
- JSON validation passes
- Cached prompts return instantly
- Handles edge cases (missing budget, unclear aesthetic)

**Reference:** PRD.md Section 8.1, Tasks.md Phase 4.2.1

**API Key:** Use environment variable OPENAI_API_KEY

Show me the endpoint, prompt template, and service implementation.
```

### **Prompt 4.2.2: Outfit Planning with LLM**

```
Task: Implement outfit schema planning using GPT-4o-mini.

**Context:**
- Prompt parsing works (Task 4.2.1 completed)
- Need to generate outfit schema: ["oversized t-shirt", "straight pants", "white sneakers"]
- Maps aesthetic → specific item types

**Requirements:**
1. Create POST /plan endpoint in app/routes/plan.py:
   - Accept ParsedPrompt JSON
   - Return string[] of item descriptions
2. Create prompt template in app/prompts/plan_outfit.txt:
   - Map aesthetics to item types
   - Examples for common aesthetics:
     * korean minimal → oversized tee, straight pants, minimal sneakers
     * streetwear → graphic hoodie, cargo pants, chunky sneakers
     * y2k → crop top, low-rise jeans, platform shoes
   - Enforce 2-4 item limit
3. Implement app/services/plan_service.py:
   - Call GPT-4o-mini
   - Validate item categories (top, bottom, shoes, accessories)
   - Cache common aesthetic patterns (Redis, no expiry)

**Success Criteria:**
- "korean minimal" → ["oversized t-shirt", "straight pants", "white sneakers"]
- Returns 2-4 items consistently
- Common aesthetics cached and return instantly
- Handles unknown aesthetics gracefully

**Reference:** PRD.md Section 8.2, Tasks.md Phase 4.2.2

Show me the planning prompt template and service code.
```

### **Prompt 4.2.3: Outfit Scoring with LLM**

```
Task: Implement outfit coherence scoring using GPT-4o-mini.

**Context:**
- Planning works (Task 4.2.2 completed)
- Need to score assembled outfits 1-10 based on coherence
- Using GPT-4o-mini for cost efficiency and low latency

**Requirements:**
1. Create POST /score endpoint in app/routes/score.py:
   - Accept array of outfits with product details
   - Return array of scores (1-10)
2. Create prompt template in app/prompts/score_outfit.txt:
   - Scoring criteria: color coherence, silhouette matching, trend alignment
   - Batch scoring (10 outfits per call for cost efficiency)
   - Output format: JSON array of scores
3. Implement app/services/score_service.py:
   - Call OpenAI API with GPT-4o-mini
   - Parse numeric scores from response
   - Validate scores are 1-10
   - Handle API errors gracefully

**Success Criteria:**
- Can score 10 outfits in single API call
- Scores are numeric 1-10
- Higher scores for coherent outfits
- Batch processing reduces cost vs individual calls

**Reference:** PRD.md Section 8.5, Tasks.md Phase 4.2.3

**API Key:** Use environment variable OPENAI_API_KEY

Show me the scoring prompt and service implementation.
```

### **Prompt 4.3: CLIP Embedding System**

```
Task: Set up CLIP/OpenCLIP for image and text embeddings.

**Context:**
- LLM services are complete (Tasks 4.2.1-4.2.3 completed)
- Need embeddings for similarity search
- Using OpenCLIP ViT-B/32 model (512-dim vectors)

**Requirements:**
1. Download and cache CLIP model:
   - Model: ViT-B/32 or ViT-L/14
   - Store in app/models/ directory
   - Load on service startup (not per request)
2. Create app/embeddings/clip_service.py:
   - encode_image(image_url: str) → np.ndarray[512]
   - encode_text(text: str) → np.ndarray[512]
   - Batch processing support (32 images at once)
3. Create POST /embed endpoint:
   - Accept product ID or image URL
   - Return { image_embedding: float[], text_embedding: float[] }
4. Implement caching:
   - Cache embeddings in PostgreSQL (permanent)
   - Only recompute if product image changes

**Success Criteria:**
- Model loads successfully on startup
- Can generate 512-dim embeddings for images and text
- Batch processing works (32 images in ~2 seconds)
- Embeddings are deterministic (same input → same output)

**Reference:** PRD.md Section 8.4, Tasks.md Phase 4.3.1

**Note:** Use CPU inference for MVP. GPU optimization can come later.

Show me the CLIP service implementation and embedding endpoint.
```

---

## **Phase 5: Frontend (Next.js)**

### **Prompt 5.1: Next.js Project Setup**

```
Task: Initialize Next.js 14 frontend in apps/web.

**Context:**
- Backend and ML services are complete (Phases 3-4 completed)
- Working in apps/web directory
- Using App Router (not Pages Router)

**Requirements:**
1. Initialize Next.js 14 with TypeScript:
   - Use App Router
   - Configure next.config.js for monorepo
   - Add @fashiondeck/types to dependencies
2. Set up TailwindCSS:
   - Install tailwindcss, postcss, autoprefixer
   - Create custom theme in tailwind.config.js:
     * Colors: vibrant palette (not plain red/blue/green)
     * Typography: Google Font (Inter or Outfit)
     * Spacing, border radius, shadows
3. Install UI libraries:
   - Headless UI or Radix UI
   - Lucide React (icons)
4. Configure fonts in app/layout.tsx:
   - Load Google Font
   - Apply globally

**Success Criteria:**
- `npm run dev` starts Next.js on port 3000
- TailwindCSS classes work
- Can import types from @fashiondeck/types
- Custom theme colors applied

**Reference:** PRD.md Section 6.2, Tasks.md Phase 5.1

Show me next.config.js, tailwind.config.js, and layout.tsx.
```

### **Prompt 5.2.1: Landing Page Implementation**

```
Task: Create stunning landing page with hero, how-it-works, and inspiration gallery.

**Context:**
- Next.js is set up (Task 5.1 completed)
- This is the first page users see (app/page.tsx)
- Must WOW users with premium design

**Requirements:**
1. Create hero section:
   - Headline: "Find Your Perfect Outfit in Seconds"
   - Subheadline: "Describe your style, get curated outfits from Amazon & Flipkart"
   - CTA button → /search (vibrant, animated)
   - Background: gradient or subtle pattern
2. Create "How It Works" section (3 steps):
   - Icons + text for each step
   - Smooth scroll animations
3. Create "Outfit Inspiration Gallery":
   - 6-8 pre-generated outfit cards
   - Each card shows aesthetic + sample outfit
   - Click to auto-fill search prompt
   - Use placeholder images (we'll generate real ones later)
4. Add footer:
   - Links, social media, copyright
5. SEO optimization:
   - Title: "FashionDeck - AI-Powered Outfit Recommendations"
   - Meta description (compelling, 155 chars)
   - Open Graph tags

**Success Criteria:**
- Landing page looks premium and modern
- Smooth animations on scroll
- CTA button prominent and clickable
- Mobile responsive
- Lighthouse score >90

**Reference:** PRD.md Section 10, Tasks.md Phase 5.2.1

**Design Requirements:**
- Use vibrant colors, gradients, glassmorphism
- Modern typography
- Micro-animations on hover
- NO generic blue/red colors

Show me the complete landing page code.
```

### **Prompt 5.2.2: Search Page Implementation**

```
Task: Create search page with input, filters, and results display.

**Context:**
- Landing page is complete (Task 5.2.1 completed)
- This is app/search/page.tsx
- Main user interaction page

**Requirements:**
1. Create search input:
   - Large text input with placeholder: "korean minimal fit, size M, under ₹1500"
   - Character count (10-200 chars)
   - Submit button with loading state
2. Add optional filters (progressive disclosure):
   - "Advanced" toggle to show/hide
   - Dropdowns: size (S/M/L/XL), gender (M/F/Unisex), occasion
   - Price range slider (₹500-₹5000)
3. Implement search submission:
   - POST to backend API /api/query
   - Show loading skeleton while waiting
   - Handle errors (toast notifications)
4. Display results:
   - Grid layout (2 cols mobile, 3-4 cols desktop)
   - OutfitCard components
   - Smooth entrance animations (stagger effect)

**Success Criteria:**
- Search submits to backend and receives outfits
- Loading state shows skeleton cards
- Results display in grid with animations
- Filters modify search query
- Mobile responsive

**Reference:** PRD.md Section 10, Tasks.md Phase 5.2.2

Show me the search page implementation.
```

### **Prompt 5.3: Core Components**

```
Task: Create reusable components (OutfitCard, ItemCard, PromptInput, etc.).

**Context:**
- Pages are structured (Tasks 5.2.1, 5.2.2 completed)
- Need polished, reusable components
- All components in app/components/

**Requirements:**
1. PromptInput component:
   - Controlled input with validation
   - Auto-focus on mount
   - Keyboard shortcut (Cmd/Ctrl+Enter to submit)
   - Suggested prompts (chips below input)
2. OutfitCard component:
   - Props: outfit: Outfit
   - Display items in grid
   - Show total price, aesthetic badge
   - "View Items" button to expand
   - Glassmorphism styling
3. ItemCard component:
   - Props: item: ProductItem
   - Next.js Image for product image
   - Show title, price, category
   - Marketplace badge (Amazon/Flipkart logo)
   - "Buy Now" button → affiliate link (new tab)
   - Hover effects (scale, overlay)
4. LoadingSkeleton component:
   - Shimmer animation
   - Matches OutfitCard layout
5. MarketplaceBadge component:
   - Display logo based on marketplace
   - Tooltip with name

**Success Criteria:**
- All components are reusable and typed
- Hover effects smooth (60fps)
- Images lazy load
- Components match design system

**Reference:** PRD.md Section 10, Tasks.md Phase 5.3

**Design:** Premium, modern, with micro-animations

Show me all component implementations.
```

---

## **Testing Prompts**

### **Unit Testing Prompt**

```
Task: Write comprehensive unit tests for [MODULE_NAME].

**Context:**
- Module [MODULE_NAME] is implemented
- Need unit tests with 80% coverage target
- Using Jest for Node.js, pytest for Python

**Requirements:**
1. Test all public methods/functions
2. Mock external dependencies (database, APIs, ML service)
3. Test error handling paths
4. Test edge cases (null inputs, empty arrays, etc.)
5. Test validation logic

**Success Criteria:**
- All tests pass: `npm test` or `pytest`
- Coverage ≥80%
- No flaky tests (run 10 times, all pass)

**Reference:** Tasks.md Phase [X].4

Show me the test files with comprehensive coverage.
```

### **Integration Testing Prompt**

```
Task: Write integration tests for [FEATURE_NAME] end-to-end flow.

**Context:**
- Feature [FEATURE_NAME] is complete
- Need to test full flow with real database (test DB)
- Using test containers or Docker Compose

**Requirements:**
1. Set up test database (PostgreSQL + Redis)
2. Test complete user flow:
   - [Step 1]
   - [Step 2]
   - [Step 3]
3. Verify data persistence
4. Test error scenarios
5. Clean up test data after each test

**Success Criteria:**
- Integration tests pass consistently
- Test database isolated from dev/prod
- Tests run in CI/CD pipeline

**Reference:** Tasks.md Phase 6.3

Show me the integration test suite.
```

### **Performance Testing Prompt**

```
Task: Conduct performance testing for [ENDPOINT/FEATURE].

**Context:**
- Feature is functionally complete
- Need to verify latency and throughput targets
- Target: p95 latency ≤7s, handle 100 concurrent requests

**Requirements:**
1. Set up load testing tool (k6, Artillery, or JMeter)
2. Create test scenarios:
   - Single user: measure baseline latency
   - 10 concurrent users: measure p50, p95, p99
   - 100 concurrent users: measure throughput
3. Identify bottlenecks:
   - Database queries
   - External API calls
   - ML service processing
4. Generate performance report

**Success Criteria:**
- p95 latency ≤7 seconds
- No errors under 100 concurrent users
- Bottlenecks identified and documented

**Reference:** PRD.md Section 4.3, Tasks.md Phase 6.3

Show me the load test script and results.
```

---

## **Context-Aware Prompts**

### **Error Recovery Prompt**

```
I encountered an error while working on [TASK_NAME]:

**Error Message:**
[paste full error message]

**Context:**
- Current task: [task number and name]
- What I was trying to do: [description]
- Files involved: [list files]
- Previous successful step: [last working state]

**Environment:**
- Node.js version: [version]
- Python version: [version]
- OS: Windows

Please help me:
1. Understand what caused this error
2. Provide a fix with explanation
3. Suggest how to prevent similar errors
4. Verify the fix works

**Reference:** Tasks.md Phase [X], PRD.md Section [Y]
```

### **Code Review Prompt**

```
Please review the code I just wrote for [TASK_NAME].

**Files Changed:**
[list files with brief description of changes]

**What to Review:**
1. Code quality and best practices
2. TypeScript type safety
3. Error handling completeness
4. Performance considerations
5. Security issues (SQL injection, XSS, etc.)
6. Alignment with PRD requirements

**Context:**
- This code implements: [feature description]
- It integrates with: [other modules]
- Expected behavior: [what it should do]

**Reference:** Tasks.md Phase [X], PRD.md Section [Y]

Please provide specific feedback and suggest improvements.
```

### **Debugging Prompt**

```
I need help debugging [FEATURE_NAME] which is not working as expected.

**Expected Behavior:**
[what should happen]

**Actual Behavior:**
[what is happening instead]

**Steps to Reproduce:**
1. [step 1]
2. [step 2]
3. [step 3]

**Relevant Code:**
[paste relevant code snippets or file paths]

**Logs/Errors:**
[paste any error messages or logs]

**What I've Tried:**
[list debugging steps already attempted]

**Context:**
- Task: [task number and name]
- Related tasks completed: [list]
- Environment: [dev/staging/production]

Please help me:
1. Identify the root cause
2. Provide a fix
3. Explain why it wasn't working
4. Suggest tests to prevent regression

**Reference:** Tasks.md Phase [X], PRD.md Section [Y]
```

### **Refactoring Prompt**

```
I need to refactor [CODE_SECTION] to improve [ASPECT].

**Current Code:**
[file path or code snippet]

**Issues:**
- [issue 1]
- [issue 2]
- [issue 3]

**Goals:**
- [goal 1: e.g., reduce duplication]
- [goal 2: e.g., improve readability]
- [goal 3: e.g., better error handling]

**Constraints:**
- Must maintain backward compatibility: [yes/no]
- Must not break existing tests: [yes]
- Performance must not degrade: [yes]

**Context:**
- This code is used by: [list dependent modules]
- Current test coverage: [X%]

Please provide:
1. Refactored code
2. Explanation of changes
3. Migration guide (if breaking changes)
4. Updated tests

**Reference:** Tasks.md Phase [X], PRD.md Section [Y]
```

### **Deployment Troubleshooting Prompt**

```
Deployment to [PLATFORM] is failing for [SERVICE_NAME].

**Error:**
[paste deployment error]

**Deployment Config:**
- Platform: [Vercel/Railway/etc.]
- Service: [web/api/ml-service]
- Branch: [main/dev]
- Commit: [commit hash]

**What's Working:**
- [list what works]

**What's Failing:**
- [list what fails]

**Environment Variables:**
- [list env vars set, without values]

**Build Logs:**
[paste relevant build logs]

**Context:**
- Last successful deployment: [date/commit]
- Changes since then: [summary]
- Local environment: [works/doesn't work]

Please help me:
1. Identify deployment issue
2. Fix configuration
3. Verify deployment succeeds
4. Document solution for future

**Reference:** Tasks.md Phase 7, PRD.md Section 14
```

---

## **Phase Transition Prompt**

```
I have completed Phase [X]: [PHASE_NAME].

**Completed Tasks:**
- [x] Task X.1: [name]
- [x] Task X.2: [name]
- [x] Task X.3: [name]

**Verification:**
- All tests passing: [yes/no]
- No critical errors: [yes/no]
- Documentation updated: [yes/no]
- Code reviewed: [yes/no]

**Ready to Start Phase [X+1]: [NEXT_PHASE_NAME]**

Please:
1. Review my completion of Phase [X]
2. Confirm I'm ready for Phase [X+1]
3. Provide the first task prompt for Phase [X+1]
4. Highlight any dependencies or prerequisites

**Reference:** Tasks.md Phases [X] and [X+1]
```

---

## **Daily Standup Prompt**

```
Daily standup for FashionDeck development.

**Yesterday:**
- Completed: [list tasks completed]
- Challenges: [list any blockers or issues]

**Today:**
- Planning to work on: [list tasks]
- Estimated completion: [X tasks]

**Blockers:**
- [list any blockers or questions]

**Current Status:**
- Phase: [X]
- Overall progress: [X%]
- Days since start: [X]
- Target completion: [date]

**Context Refresh Needed:**
- Please remind me of: [any context I might have forgotten]

**Reference:** Tasks.md Phase [X]

Please provide:
1. Confirmation of plan
2. Any warnings or suggestions
3. Relevant context from PRD
```

---

## **Quick Reference**

### **File Locations**

- PRD: `c:\Users\Bharath Kannan\OneDrive\Desktop\work\FashionDeck\PRD.md`
- Tasks: `c:\Users\Bharath Kannan\OneDrive\Desktop\work\FashionDeck\Tasks.md`
- Prompts: `c:\Users\Bharath Kannan\OneDrive\Desktop\work\FashionDeck\Prompts.md`

### **Key Commands**

- Start all services: `docker-compose up`
- Run frontend: `cd apps/web && npm run dev`
- Run backend: `cd apps/api && npm run dev`
- Run ML service: `cd apps/ml-service && uvicorn app.main:app --reload`
- Run tests: `npm test` or `pytest`
- Build all: `npm run build`

### **Environment Variables**

- Backend: `apps/api/.env`
- ML Service: `apps/ml-service/.env`
- Frontend: `apps/web/.env.local`

---

## **Usage Tips**

1. **Always start with General Context Prompt** when beginning a new session
2. **Use specific task prompts** for each task in Tasks.md
3. **Use testing prompts** after completing each module
4. **Use context-aware prompts** when encountering issues
5. **Update this file** if you discover better prompts during development

**Remember:** The goal is zero context loss and zero errors. Be explicit, provide context, reference PRD/Tasks.md.

---

## **PRODUCTION READINESS PROMPT**

````
Task: Make the FashionDeck application production-ready for deployment.

**Context:**
- Project: FashionDeck - AI-powered fashion outfit recommendation platform
- Current State: Development complete through Phase 4 (Backend API, ML Service, Frontend partially complete)
- Monorepo structure with Turborepo (apps/api, apps/ml-service, apps/web, packages/types, packages/utils)
- Tech Stack: Next.js 14, NestJS, FastAPI, PostgreSQL with pgvector, Redis
- Target Deployment: Vercel (Frontend), Railway (Backend API, ML Service, Databases)
- Reference: PRD.md, Tasks.md, SETUP.md

**Objective:**
Transform the current development codebase into a production-ready application that can be deployed to Vercel and Railway with confidence. This includes security hardening, performance optimization, comprehensive testing, proper error handling, monitoring setup, and deployment configuration.

---

### **PHASE 1: SECURITY HARDENING**

#### 1.1 Environment Variables & Secrets Management

- [ ] **Audit all environment variables**
  - Review all `.env` files across services
  - Ensure NO API keys, secrets, or credentials are hardcoded in source code
  - Verify all sensitive data is loaded from environment variables
  - Check for accidental commits of `.env` files in git history

- [ ] **Create production environment templates**
  - Update `.env.example` for each service (apps/api, apps/ml-service, apps/web)
  - Document all required environment variables with descriptions
  - Specify which variables are required vs optional
  - Add validation for required environment variables on startup

- [ ] **Implement environment variable validation**
  - Backend API: Use class-validator to validate all env vars on startup
  - ML Service: Add Pydantic settings validation
  - Frontend: Validate NEXT_PUBLIC_ variables
  - Fail fast with clear error messages if required vars missing

#### 1.2 API Security

- [ ] **Implement rate limiting**
  - Add rate limiting to POST /api/query endpoint (10 requests/minute per IP)
  - Add global rate limiting (100 requests/minute per IP)
  - Use Redis for distributed rate limiting
  - Return proper 429 Too Many Requests responses

- [ ] **Input validation and sanitization**
  - Validate all user inputs (prompt length: 10-200 chars)
  - Sanitize inputs to prevent XSS attacks
  - Validate query parameters and request bodies
  - Add request size limits (max 1MB)

- [ ] **CORS configuration**
  - Configure CORS to allow only production frontend domain
  - Set proper allowed methods (GET, POST)
  - Configure allowed headers
  - Enable credentials if needed

- [ ] **Security headers**
  - Add helmet.js to NestJS backend
  - Configure CSP (Content Security Policy)
  - Add X-Frame-Options, X-Content-Type-Options
  - Set Strict-Transport-Security for HTTPS

- [ ] **SQL injection prevention**
  - Verify all database queries use parameterized queries
  - Never concatenate user input into SQL
  - Use ORM/query builder properly (TypeORM/Prisma)

#### 1.3 Authentication & Authorization (Future-Ready)

- [ ] **Prepare for authentication**
  - Add placeholder for JWT authentication middleware
  - Document authentication strategy for future implementation
  - Ensure API endpoints can easily add auth guards later

---

### **PHASE 2: ERROR HANDLING & RESILIENCE**

#### 2.1 Comprehensive Error Handling

- [ ] **Backend API error handling**
  - Implement global exception filter in NestJS
  - Catch and log all unhandled exceptions
  - Return consistent error response format:
    ```json
    {
      "error": "Error type",
      "message": "User-friendly message",
      "statusCode": 400,
      "timestamp": "ISO timestamp"
    }
    ```
  - Never expose internal error details to users
  - Log full error stack traces server-side

- [ ] **ML Service error handling**
  - Add global exception handler in FastAPI
  - Handle LLM API failures gracefully (OpenAI, Anthropic)
  - Implement fallback responses when ML service fails
  - Add timeout handling (5s per LLM call)
  - Return proper HTTP status codes

- [ ] **Frontend error handling**
  - Add error boundaries for React components
  - Implement toast notifications for user-facing errors
  - Handle API failures gracefully (show retry button)
  - Add loading states for all async operations
  - Implement offline detection

#### 2.2 Circuit Breaker Pattern

- [ ] **Implement circuit breaker for ML service**
  - If ML service fails 5 times in 1 minute, open circuit
  - Return cached/fallback responses when circuit open
  - Auto-close circuit after 30 seconds
  - Log circuit state changes

- [ ] **Implement circuit breaker for marketplace APIs**
  - Prevent cascading failures when Amazon/Flipkart APIs fail
  - Return partial results if one marketplace fails
  - Log marketplace availability

#### 2.3 Retry Logic

- [ ] **Add retry logic for external APIs**
  - Retry LLM API calls (3 retries with exponential backoff)
  - Retry marketplace API calls (2 retries)
  - Retry database connections on startup
  - Add jitter to prevent thundering herd

---

### **PHASE 3: PERFORMANCE OPTIMIZATION**

#### 3.1 Database Optimization

- [ ] **Verify database indexes**
  - Ensure indexes exist on frequently queried columns
  - Verify pgvector IVFFlat indexes are created
  - Check index usage with EXPLAIN ANALYZE
  - Add composite indexes where needed

- [ ] **Connection pooling**
  - Configure proper connection pool size (10-20 connections)
  - Set connection timeout (30s)
  - Set idle timeout (10 minutes)
  - Monitor connection pool usage

- [ ] **Query optimization**
  - Review all database queries for N+1 problems
  - Use eager loading where appropriate
  - Limit result sets (max 100 products per category)
  - Add query timeouts

#### 3.2 Caching Strategy

- [ ] **Implement Redis caching**
  - Cache product search results (6-hour TTL)
  - Cache parsed prompts (24-hour TTL)
  - Cache aesthetic embeddings (no expiry)
  - Cache LLM responses for identical prompts
  - Implement cache warming for popular queries

- [ ] **Frontend caching**
  - Configure Next.js ISR for landing page
  - Add HTTP cache headers for static assets
  - Implement SWR for client-side data fetching
  - Cache affiliate links

#### 3.3 Parallel Processing

- [ ] **Optimize backend orchestration**
  - Run marketplace fetches in parallel (Promise.all)
  - Run LLM planning + product pre-fetch concurrently
  - Batch LLM scoring calls (10 outfits per call)
  - Measure and log latency for each step

#### 3.4 Frontend Performance

- [ ] **Next.js optimization**
  - Use next/image for all product images
  - Implement lazy loading for below-fold content
  - Enable code splitting for heavy components
  - Optimize bundle size (analyze with @next/bundle-analyzer)
  - Prefetch critical routes

- [ ] **Asset optimization**
  - Compress images (WebP format)
  - Minify CSS and JavaScript
  - Use CDN for static assets
  - Implement responsive images

---

### **PHASE 4: TESTING & QUALITY ASSURANCE**

#### 4.1 Unit Testing

- [ ] **Backend API tests**
  - Test all service methods (80% coverage target)
  - Mock external dependencies (ML service, marketplaces)
  - Test error handling paths
  - Test validation logic
  - Run tests: `npm test` in apps/api

- [ ] **ML Service tests**
  - Test all service functions
  - Mock LLM API calls
  - Mock CLIP model outputs
  - Test error handling
  - Run tests: `pytest` in apps/ml-service

- [ ] **Frontend tests**
  - Test critical components (OutfitCard, PromptInput)
  - Test user interactions
  - Test error states
  - Run tests: `npm test` in apps/web

#### 4.2 Integration Testing

- [ ] **End-to-end flow testing**
  - Test: User prompt → Backend → ML Service → Response
  - Test with real test database (not production)
  - Test marketplace adapter integration
  - Test Redis caching
  - Verify data persistence

#### 4.3 Performance Testing

- [ ] **Load testing**
  - Use k6 or Artillery for load tests
  - Test with 10 concurrent users (baseline)
  - Test with 100 concurrent users (target)
  - Measure p50, p95, p99 latencies
  - Target: p95 ≤ 7 seconds end-to-end

- [ ] **Frontend performance audit**
  - Run Lighthouse audit (target score ≥90)
  - Measure Core Web Vitals:
    - LCP < 2.5s
    - FID < 100ms
    - CLS < 0.1
  - Test on mobile devices
  - Test on slow 3G network

---

### **PHASE 5: DEPLOYMENT CONFIGURATION**

#### 5.1 Docker & Containerization

- [ ] **Verify Dockerfiles**
  - Backend API Dockerfile (apps/api/Dockerfile)
    - Multi-stage build (dependencies → build → production)
    - Proper layer caching
    - Security: Run as non-root user
    - Health check endpoint
  - ML Service Dockerfile (apps/ml-service/Dockerfile)
    - Python 3.11-slim base image
    - Proper dependency installation
    - Model caching strategy
    - Health check endpoint

- [ ] **Test Docker builds locally**
  - Build all images: `docker-compose build`
  - Run all services: `docker-compose up`
  - Verify health checks pass
  - Test inter-service communication

#### 5.2 Frontend Deployment (Vercel)

- [ ] **Configure Vercel settings**
  - Set root directory: `apps/web`
  - Build command: `cd ../.. && npm run build --filter=web`
  - Output directory: `apps/web/.next`
  - Node.js version: 20.x
  - Install command: `npm install`

- [ ] **Set environment variables in Vercel**
  - NEXT_PUBLIC_API_URL (backend API URL)
  - Any other NEXT_PUBLIC_ variables
  - Verify variables are set for production environment

- [ ] **Configure custom domain (if applicable)**
  - Add custom domain in Vercel dashboard
  - Configure DNS records
  - Enable automatic HTTPS

- [ ] **Test production build locally**
  - Run: `npm run build` in apps/web
  - Run: `npm start` to test production build
  - Verify no build errors
  - Test all pages and features

#### 5.3 Backend API Deployment (Railway)

- [ ] **Configure Railway project**
  - Create new Railway project for API
  - Connect GitHub repository
  - Set Dockerfile path: `apps/api/Dockerfile`
  - Set port: 3001
  - Enable auto-deploy on push to main branch

- [ ] **Set environment variables in Railway**
  - DATABASE_URL (PostgreSQL connection string)
  - REDIS_URL (Redis connection string)
  - ML_SERVICE_URL (ML service URL)
  - NODE_ENV=production
  - All API keys (Amazon, Flipkart affiliates)

- [ ] **Configure health check**
  - Add GET /health endpoint
  - Return 200 OK with service status
  - Railway will use this for health monitoring

#### 5.4 ML Service Deployment (Railway)

- [ ] **Configure Railway project**
  - Create new Railway project for ML service
  - Connect GitHub repository
  - Set Dockerfile path: `apps/ml-service/Dockerfile`
  - Set port: 8000
  - Enable auto-deploy on push to main branch

- [ ] **Set environment variables in Railway**
  - DATABASE_URL (PostgreSQL connection string)
  - REDIS_URL (Redis connection string)
  - OPENAI_API_KEY
  - ANTHROPIC_API_KEY (if using Claude)
  - PYTHONUNBUFFERED=1

- [ ] **Configure model caching**
  - Mount persistent volume for CLIP models
  - Pre-download models during build
  - Verify models load on startup

#### 5.5 Database Deployment (Railway)

- [ ] **PostgreSQL setup**
  - Create PostgreSQL database on Railway
  - Select PostgreSQL with pgvector plugin
  - Note connection string
  - Configure connection limits

- [ ] **Run database migrations**
  - Execute migration scripts on production database
  - Verify tables created correctly
  - Verify pgvector extension enabled
  - Verify indexes created

- [ ] **Redis setup**
  - Create Redis instance on Railway
  - Note connection URL
  - Configure max memory policy (allkeys-lru)
  - Test connection from backend

---

### **PHASE 6: MONITORING & OBSERVABILITY**

#### 6.1 Logging

- [ ] **Structured logging**
  - All services log to stdout in JSON format
  - Include: timestamp, level, service, message, context
  - Log all errors with stack traces
  - Log performance metrics (latency per step)
  - Railway automatically captures stdout logs

- [ ] **Log levels**
  - Production: INFO level minimum
  - Development: DEBUG level
  - Never log sensitive data (API keys, user data)

#### 6.2 Error Tracking

- [ ] **Set up Sentry**
  - Create Sentry project for each service
  - Install Sentry SDK in backend API
  - Install Sentry SDK in ML service
  - Install Sentry SDK in frontend
  - Configure error sampling (100% for now)
  - Set up alerts for critical errors

- [ ] **Configure error notifications**
  - Alert on critical errors immediately
  - Daily digest for warnings
  - Track error trends over time

#### 6.3 Performance Monitoring

- [ ] **Add performance tracking**
  - Track API endpoint latencies
  - Track ML service call durations
  - Track database query times
  - Track external API call times
  - Log to structured logs for analysis

- [ ] **Set up uptime monitoring (optional)**
  - Use UptimeRobot or Checkly
  - Ping /health endpoint every 5 minutes
  - Alert if service down for >2 minutes

#### 6.4 Analytics

- [ ] **Add Google Analytics 4 (optional)**
  - Track page views
  - Track search queries (anonymized)
  - Track affiliate link clicks
  - Track conversion funnel

---

### **PHASE 7: DOCUMENTATION**

#### 7.1 API Documentation

- [ ] **Backend API documentation**
  - Set up Swagger/OpenAPI in NestJS
  - Document all endpoints with examples
  - Add request/response schemas
  - Document error codes
  - Serve docs at /api/docs

- [ ] **ML Service documentation**
  - FastAPI auto-generates docs at /docs
  - Add request/response examples
  - Document all endpoints
  - Add usage examples

#### 7.2 Deployment Documentation

- [ ] **Update README.md**
  - Add project overview
  - Add architecture diagram
  - Add setup instructions
  - Add deployment guide
  - Add troubleshooting section

- [ ] **Create DEPLOYMENT.md**
  - Document deployment process for each service
  - Document environment variables
  - Document rollback procedure
  - Document scaling guidelines

#### 7.3 Runbook

- [ ] **Create RUNBOOK.md**
  - How to deploy updates
  - How to rollback deployments
  - How to monitor service health
  - How to handle incidents
  - How to scale services
  - Common issues and solutions

---

### **PHASE 8: PRE-LAUNCH CHECKLIST**

#### 8.1 Security Audit

- [ ] No API keys in source code (all in env vars)
- [ ] Rate limiting enabled on all public endpoints
- [ ] Input validation on all endpoints
- [ ] CORS properly configured
- [ ] Security headers configured
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

#### 8.2 Performance Audit

- [ ] Load tests passing (100 concurrent users)
- [ ] p95 latency ≤ 7 seconds
- [ ] Database indexes performant
- [ ] Caching working correctly
- [ ] Frontend Lighthouse score ≥ 90
- [ ] Core Web Vitals passing

#### 8.3 Functionality Audit

- [ ] All critical user flows tested end-to-end
- [ ] Error handling working correctly
- [ ] Affiliate links generating correctly
- [ ] All marketplace adapters working
- [ ] ML service responding correctly
- [ ] Database queries working
- [ ] Redis caching working

#### 8.4 Legal & Compliance

- [ ] Privacy policy published (if collecting user data)
- [ ] Terms of service published
- [ ] Affiliate disclosure visible
- [ ] Cookie consent (if applicable)
- [ ] GDPR compliance (if applicable)

#### 8.5 Deployment Verification

- [ ] All services deployed successfully
- [ ] All environment variables set correctly
- [ ] Database migrations run successfully
- [ ] Health checks passing
- [ ] Logs flowing correctly
- [ ] Error tracking working
- [ ] Custom domain configured (if applicable)

---

### **PHASE 9: POST-DEPLOYMENT**

#### 9.1 Smoke Testing

- [ ] Test landing page loads
- [ ] Test search functionality end-to-end
- [ ] Test with various prompts
- [ ] Test affiliate links redirect correctly
- [ ] Test error scenarios
- [ ] Test on mobile devices
- [ ] Test on different browsers

#### 9.2 Monitoring Setup

- [ ] Verify logs flowing to Railway
- [ ] Verify errors reporting to Sentry
- [ ] Set up alerts for critical issues
- [ ] Monitor resource usage (CPU, memory, database)
- [ ] Monitor API latency
- [ ] Monitor error rates

#### 9.3 Performance Baseline

- [ ] Measure baseline latency
- [ ] Measure baseline error rate
- [ ] Measure baseline resource usage
- [ ] Set up dashboards for monitoring

---

### **SUCCESS CRITERIA**

The application is production-ready when:

1. ✅ All security measures implemented (rate limiting, input validation, CORS, security headers)
2. ✅ Comprehensive error handling in place (no unhandled exceptions)
3. ✅ Performance targets met (p95 latency ≤ 7s, Lighthouse ≥ 90)
4. ✅ All tests passing (unit, integration, E2E)
5. ✅ All services deployed successfully to production
6. ✅ Monitoring and error tracking configured
7. ✅ Documentation complete (README, API docs, runbook)
8. ✅ Smoke tests passing in production
9. ✅ No hardcoded secrets or API keys in code
10. ✅ All environment variables configured correctly

---

### **EXECUTION APPROACH**

1. **Start with security** - This is non-negotiable for production
2. **Then error handling** - Ensure graceful degradation
3. **Then performance** - Optimize for user experience
4. **Then testing** - Verify everything works
5. **Then deployment** - Configure all services
6. **Then monitoring** - Set up observability
7. **Finally documentation** - Enable future maintenance

**Work systematically through each phase. Do not skip steps.**

**For each task:**
- Verify completion with tests or manual verification
- Document any issues or blockers
- Update this checklist as you progress

**Reference Documents:**
- PRD.md - Product requirements and architecture
- Tasks.md - Development task breakdown
- SETUP.md - Local development setup
- .env.example files - Required environment variables

**Target Timeline:**
- Security Hardening: 1-2 days
- Error Handling: 1 day
- Performance Optimization: 1-2 days
- Testing: 1-2 days
- Deployment Configuration: 1 day
- Monitoring Setup: 0.5 day
- Documentation: 0.5 day
- **Total: 6-9 days**

**After Completion:**
- Run through entire pre-launch checklist
- Perform smoke testing in production
- Monitor for 24 hours before announcing launch
- Be ready to rollback if critical issues found

---

**IMPORTANT NOTES:**

1. **Never commit secrets** - Always use environment variables
2. **Test everything** - Don't assume it works in production
3. **Monitor actively** - First 48 hours are critical
4. **Have rollback plan** - Know how to revert each service
5. **Document everything** - Future you will thank you
6. **Start small** - Soft launch to small group first
7. **Iterate quickly** - Fix issues as they arise

**This is a comprehensive checklist. Work through it systematically and thoroughly.**
````
