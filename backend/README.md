# Ovozly Backend

> Call center analytics and speech processing platform powered by AI.

## Overview

Ovozly is a production-grade backend service that processes call center audio recordings and extracts actionable insights using state-of-the-art AI/ML models. The platform performs:

- **Speaker Diarization** - Identifies who speaks when in the conversation
- **Speech-to-Text** - Transcribes audio with multi-language support (Uzbek, Russian, English)
- **AI Analysis** - Extracts sentiment, intent, entities, issues, and recommendations

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Client Request                              │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FastAPI Application                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   /stt/*    │  │  /users/*   │  │    Auth     │  │    CORS     │    │
│  │  Endpoints  │  │  Endpoints  │  │ Middleware  │  │ Middleware  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
           │                                              │
           ▼                                              ▼
┌─────────────────────┐                    ┌─────────────────────────────┐
│   Google Cloud      │                    │        PostgreSQL           │
│   Storage (GCS)     │                    │   (Users, Calls, Analysis)  │
│   Audio Files       │                    └─────────────────────────────┘
└─────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Celery Task Queue                               │
│                          (Redis Broker)                                  │
└─────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        AI Processing Pipeline                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  PyAnnote   │  │  Facebook   │  │   OpenAI    │  │    AISHA    │    │
│  │ Diarization │  │ Seamless M4T│  │  GPT API    │  │   STT API   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | FastAPI 0.115+ | High-performance async REST API |
| **Database** | PostgreSQL + SQLAlchemy 2.0 | Data persistence and ORM |
| **Migrations** | Alembic | Database schema versioning |
| **Task Queue** | Celery + Redis | Async background processing |
| **AI/ML** | PyTorch, Transformers | Deep learning inference |
| **STT Model** | Facebook Seamless M4T v2 | Multilingual speech-to-text |
| **Diarization** | PyAnnote AI | Speaker identification |
| **Analysis** | OpenAI GPT | Conversation analysis |
| **Storage** | Google Cloud Storage | Audio file storage |
| **Auth** | JWT + bcrypt | Secure authentication |

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment configuration template
│
├── api/                   # API layer
│   ├── endpoints/         # Route handlers
│   │   ├── stt.py        # Speech-to-text endpoints
│   │   └── users.py      # User management endpoints
│   ├── schemas/          # Pydantic request/response models
│   └── deps.py           # Dependency injection
│
├── core/                  # Core application logic
│   ├── config.py         # Settings management
│   ├── security.py       # Authentication utilities
│   ├── celery_app.py     # Celery configuration
│   ├── tasks.py          # Background task definitions
│   └── base_task.py      # Base task with DB session
│
├── db/                    # Database layer
│   ├── models/           # SQLAlchemy ORM models
│   │   ├── user.py       # User model
│   │   ├── call.py       # Call recording model
│   │   ├── speech_analysis.py
│   │   ├── extracted_entity.py
│   │   ├── intent.py
│   │   ├── issue.py
│   │   ├── action.py
│   │   └── keypoint.py
│   ├── session.py        # Database connection
│   ├── base.py           # SQLAlchemy base + caching
│   └── migrations/       # Alembic migrations
│
├── ai/                    # AI/ML integrations
│   ├── openai.py         # OpenAI API client
│   ├── pyannoteai.py     # PyAnnote diarization service
│   ├── aisha_ai.py       # AISHA STT API wrapper
│   ├── audio_utils.py    # Audio processing utilities
│   └── loader.py         # Model loading utilities
│
└── utils/                 # Helper utilities
    ├── jwt.py            # JWT token operations
    ├── bucket.py         # GCS operations
    └── text.py           # Text processing helpers
```

## Getting Started

### Prerequisites

- Python 3.8 - 3.12
- PostgreSQL 13+
- Redis 6+
- FFmpeg (for audio processing)
- CUDA-capable GPU (recommended for ML inference)

### Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv

   # Linux/macOS
   source .venv/bin/activate

   # Windows
   .venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

### Configuration

Create a `.env` file with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://user:pass@localhost:5432/ovozly` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `JWT_KEY` | Secret key for JWT signing | `your-secure-secret-key` |
| `DEBUG` | Enable debug logging | `True` or `False` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCS service account JSON | `./credentials.json` |
| `PYANNOTEAI_TOKEN` | PyAnnote AI API token | `your-pyannote-token` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `AISHA_API_KEY` | AISHA STT API key | `your-aisha-key` |

### Running the Application

1. **Start the FastAPI server:**
   ```bash
   fastapi dev main.py
   ```
   Server runs at: http://localhost:8000

2. **Start the Celery worker (separate terminal):**
   ```bash
   celery -A core.celery_app.celery worker --loglevel=INFO -P solo
   ```

3. **Access API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## API Reference

### Authentication

All endpoints (except `/users/authorize`) require a Bearer token in the `Authorization` header.

```http
Authorization: Bearer <access_token>
```

### Endpoints

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/authorize` | Authenticate and get JWT token |
| `POST` | `/users/` | Create a new user |
| `GET` | `/users/` | List all users |

#### Speech-to-Text

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stt/submit-audio` | Upload audio for async processing |
| `POST` | `/stt/submit-audio-v2` | Upload audio (sync, AISHA API) |
| `GET` | `/stt/task-status` | Check Celery task status |
| `GET` | `/stt/call/{call_id}` | Get specific call details |
| `GET` | `/stt/calls` | List calls (role-filtered) |

### Example: Upload Audio

```bash
curl -X POST "http://localhost:8000/stt/submit-audio" \
  -H "Authorization: Bearer <token>" \
  -F "file=@recording.wav"
```

### Example: Check Task Status

```bash
curl "http://localhost:8000/stt/task-status?task_id=<task_id>" \
  -H "Authorization: Bearer <token>"
```

## Data Models

### User Roles

- **admin** - Full access to all calls and user management
- **agent** - Access only to their own calls

### Call Status

- `RUNNING` - Processing in progress
- `SUCCESS` - Processing completed successfully
- `FAIL` - Processing failed

### Analysis Output

The AI analysis extracts:

| Field | Description |
|-------|-------------|
| `language` | Detected language (uz, ru, en) |
| `intents` | Customer intents with confidence scores |
| `entities` | Named entities (names, numbers, locations) |
| `issues` | Identified problems and descriptions |
| `actions` | Recommended follow-up actions |
| `keypoints` | Key conversation summary points |

## Processing Pipeline

1. **Audio Upload** → File stored in GCS, `Call` record created
2. **Diarization** → PyAnnote AI identifies speaker segments
3. **Segmentation** → Audio split by speaker turns
4. **Transcription** → Each segment converted to text
5. **Merging** → Diarization + transcription combined
6. **Analysis** → OpenAI extracts structured insights
7. **Storage** → Results saved to database

## Troubleshooting

### Celery "No module named" errors

Set the `PYTHONPATH` environment variable:

```bash
# Linux/macOS
export PYTHONPATH="/path/to/backend:$PYTHONPATH"

# Windows PowerShell
$env:PYTHONPATH="/path/to/backend"
```

### GPU Memory Issues

If running into CUDA out-of-memory errors, ensure only one worker processes audio at a time (`-P solo` flag) or reduce batch sizes.

### Database Connection Issues

Verify PostgreSQL is running and the `DATABASE_URL` is correct. Test with:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

## Development

### Adding New Migrations

```bash
cd db
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### Code Style

- Follow PEP 8 guidelines
- Use type hints for function signatures
- Add docstrings to public functions

## License

Proprietary - All rights reserved.

---

**Ovozly** - Transforming call center conversations into actionable insights.
