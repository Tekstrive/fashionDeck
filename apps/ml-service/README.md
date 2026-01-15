# FashionDeck ML Service

FastAPI microservice for AI/ML operations:

- Prompt parsing with GPT-4o-mini
- Outfit coherence scoring with GPT-4o-mini
- CLIP embeddings for visual similarity

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

Create `.env` file:

```env
OPENAI_API_KEY=your_openai_key
DATABASE_URL=postgresql://fashiondeck:password@localhost:5432/fashiondeck
REDIS_URL=redis://localhost:6379
```

## API Endpoints

- `GET /health` - Health check
- `POST /parse-prompt` - Parse user prompt with GPT-4o-mini
- `POST /score-outfit` - Score outfit coherence with GPT-4o-mini
- `POST /generate-embedding` - Generate CLIP embeddings

## Docker

```bash
# Build image
docker build -t fashiondeck-ml .

# Run container
docker run -p 8000:8000 --env-file .env fashiondeck-ml
```
