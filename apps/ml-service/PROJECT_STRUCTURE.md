# FashionDeck ML Service - Project Structure

## 📁 Directory Tree

```
apps/ml-service/
├── app/
│   ├── __init__.py                 # Package initialization
│   ├── main.py                     # FastAPI application entry point
│   ├── config.py                   # Environment configuration
│   │
│   ├── routes/                     # API endpoint definitions
│   │   └── __init__.py
│   │
│   ├── services/                   # Business logic layer
│   │   └── __init__.py
│   │
│   ├── embeddings/                 # CLIP/OpenCLIP integration
│   │   └── __init__.py
│   │
│   └── prompts/                    # LLM prompt templates
│       └── __init__.py
│
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Multi-stage Docker build
├── .dockerignore                   # Docker ignore patterns
├── .env.example                    # Environment variables template
├── README.md                       # Service documentation
└── package.json                    # Monorepo integration
```

## 🎯 Core Components

### 1. **main.py** - FastAPI Application

- **Purpose**: Main application entry point
- **Features**:
  - Health check endpoint (`GET /health`)
  - Root endpoint with API info (`GET /`)
  - CORS middleware configuration
  - Global exception handling
  - Lifespan management (startup/shutdown)
  - Structured logging with Loguru

### 2. **config.py** - Configuration Management

- **Purpose**: Centralized settings using Pydantic
- **Configuration Sections**:
  - Application metadata (name, version, debug)
  - Server settings (host, port)
  - OpenAI API (GPT-4o-mini for parsing)
  - Anthropic API (Claude 3 Haiku for scoring)
  - CLIP model configuration
  - Database connection (PostgreSQL + pgvector)
  - Redis caching
  - Timeout settings

### 3. **requirements.txt** - Dependencies

```
Core Framework:
├── fastapi==0.109.0              # Web framework
├── uvicorn[standard]==0.27.0     # ASGI server
└── pydantic==2.5.3               # Data validation

LLM SDKs:
├── openai==1.10.0                # GPT-4o-mini
└── anthropic==0.8.1              # Claude 3 Haiku

ML/AI:
├── transformers==4.36.2          # HuggingFace models
├── torch==2.1.2                  # PyTorch
├── torchvision==0.16.2           # Vision models
├── pillow==10.2.0                # Image processing
└── open-clip-torch==2.24.0       # CLIP embeddings

Database Clients:
├── psycopg2-binary==2.9.9        # PostgreSQL
└── redis==5.0.1                  # Redis cache

Utilities:
├── python-dotenv==1.0.0          # Environment variables
├── httpx==0.26.0                 # HTTP client
├── numpy==1.26.3                 # Numerical computing
└── loguru==0.7.2                 # Logging

Development:
├── pytest==7.4.4                 # Testing
├── pytest-asyncio==0.23.3        # Async testing
├── black==23.12.1                # Code formatting
└── ruff==0.1.11                  # Linting
```

### 4. **Dockerfile** - Multi-Stage Build

- **Base Stage**: Install all dependencies
- **Production Stage**: Copy only runtime requirements
- **Features**:
  - Python 3.11-slim base image
  - Non-root user for security
  - Health check integration
  - Optimized layer caching
  - Minimal final image size

## 🚀 API Endpoints

### Current Endpoints

#### `GET /health`

**Purpose**: Service health check  
**Response**:

```json
{
  "status": "healthy",
  "service": "FashionDeck ML Service",
  "version": "1.0.0",
  "models": {
    "openai": "gpt-4o-mini",
    "anthropic": "claude-3-haiku-20240307",
    "clip": "ViT-B/32"
  }
}
```

#### `GET /`

**Purpose**: API information and available endpoints  
**Response**:

```json
{
  "service": "FashionDeck ML Service",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health",
  "endpoints": {
    "parse_prompt": "POST /parse-prompt",
    "score_outfit": "POST /score-outfit",
    "generate_embedding": "POST /generate-embedding"
  }
}
```

### Planned Endpoints (To Be Implemented)

#### `POST /parse-prompt`

**Purpose**: Parse natural language prompt into structured JSON  
**Request**:

```json
{
  "prompt": "korean minimal fit size M under 1500"
}
```

**Response**:

```json
{
  "aesthetic": "korean minimal",
  "budget": 1500,
  "size": "M",
  "gender": "unisex",
  "occasion": null,
  "categories": ["top", "bottom"]
}
```

#### `POST /score-outfit`

**Purpose**: Score outfit coherence using Claude 3 Haiku  
**Request**:

```json
{
  "aesthetic": "korean minimal",
  "items": [
    {
      "category": "top",
      "title": "Oversized White T-Shirt",
      "image_url": "https://..."
    },
    {
      "category": "bottom",
      "title": "Black Straight Pants",
      "image_url": "https://..."
    }
  ]
}
```

**Response**:

```json
{
  "score": 8.5,
  "reasoning": "Strong color coherence, matching silhouette...",
  "breakdown": {
    "color_coherence": 9,
    "silhouette_match": 8,
    "trend_alignment": 8.5
  }
}
```

#### `POST /generate-embedding`

**Purpose**: Generate CLIP embeddings for images/text  
**Request**:

```json
{
  "type": "image",
  "url": "https://example.com/product.jpg"
}
```

**Response**:

```json
{
  "embedding": [0.123, -0.456, ...],
  "dimension": 512,
  "model": "ViT-B/32"
}
```

## 🔧 Environment Variables

See `.env.example` for complete configuration. Key variables:

```env
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/fashiondeck
REDIS_URL=redis://localhost:6379

# Optional (with defaults)
PORT=8000
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-haiku-20240307
CLIP_MODEL=ViT-B/32
```

## 🏃 Quick Start

### Local Development

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file
cp .env.example .env
# Edit .env with your API keys

# 4. Run development server
uvicorn app.main:app --reload --port 8000

# 5. Access API
# - Swagger UI: http://localhost:8000/docs
# - ReDoc: http://localhost:8000/redoc
# - Health: http://localhost:8000/health
```

### Docker

```bash
# Build image
docker build -t fashiondeck-ml .

# Run container
docker run -p 8000:8000 --env-file .env fashiondeck-ml

# Or with docker-compose (from project root)
docker-compose up ml-service
```

## 📊 Architecture Integration

### Service Communication Flow

```
┌─────────────────┐
│   Next.js Web   │
│    Frontend     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   NestJS API    │ ◄─── Main Backend
│   (apps/api)    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│  ML Service     │ │  Marketplace    │
│  (FastAPI)      │ │  Adapters       │
│  Port: 8000     │ │  (Amazon/Flip)  │
└────────┬────────┘ └─────────────────┘
         │
         ├──────────┬──────────┐
         ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │OpenAI  │ │Anthropic│ │ CLIP  │
    │GPT-4o  │ │Claude 3│ │ViT-B/32│
    └────────┘ └────────┘ └────────┘
```

### Data Flow

1. **Prompt Parsing**: User input → GPT-4o-mini → Structured JSON
2. **Product Retrieval**: Backend fetches candidates from marketplaces
3. **Embedding Generation**: CLIP processes product images
4. **Outfit Scoring**: Claude 3 Haiku evaluates coherence
5. **Ranking**: Combined scores → Top 2-6 outfits returned

## 🎯 Next Steps (Phase 4.1)

### To Complete Initialization:

- [x] ✅ Project structure created
- [x] ✅ requirements.txt defined
- [x] ✅ Dockerfile configured
- [x] ✅ main.py with health endpoint
- [x] ✅ config.py with environment management
- [ ] 🔄 Install dependencies in virtual environment
- [ ] 🔄 Create .env file with API keys
- [ ] 🔄 Test server startup
- [ ] 🔄 Verify health endpoint returns 200 OK
- [ ] 🔄 Test Docker build

### Phase 4.2 - Implement Core Services:

1. **Prompt Parsing Service** (`app/services/prompt_parser.py`)
   - Integrate OpenAI GPT-4o-mini
   - Implement prompt templates
   - Add response validation

2. **Embedding Service** (`app/embeddings/clip_service.py`)
   - Load CLIP model
   - Image embedding generation
   - Text embedding generation
   - Batch processing

3. **Scoring Service** (`app/services/outfit_scorer.py`)
   - Integrate Claude 3 Haiku
   - Implement scoring prompts
   - Multi-criteria evaluation

4. **API Routes** (`app/routes/`)
   - `/parse-prompt` endpoint
   - `/score-outfit` endpoint
   - `/generate-embedding` endpoint

## 📝 Notes

- **Python Version**: 3.11 (verified installed)
- **Port**: 8000 (default, configurable via .env)
- **Auto-reload**: Enabled in development mode
- **API Documentation**: Auto-generated at `/docs` (Swagger UI)
- **Logging**: Structured JSON logs via Loguru
- **Error Handling**: Global exception handler with debug mode

## 🔗 References

- **PRD**: Section 6.4 (ML Microservice)
- **Tasks**: Phase 4.1 (ML Service Initialization)
- **Architecture**: Section 5 (System Architecture)
- **Tech Stack**: Section 6 (Tech Stack Decisions)
