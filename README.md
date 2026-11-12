# Ask Your Data

### Intelligent Business Intelligence & Analytics Platform with Apache Superset Parity and a Grounded AI Assistant

Ask Your Data is a self-service Business Intelligence (BI) and analytics platform designed to make data exploration accessible, secure, and intelligent.

Connect external data warehouses, upload files into DuckDB, configure semantic datasets, write SQL queries using Monaco Editor, and create interactive dashboards with drag-and-drop functionality.

Its AI assistant enables conversational data exploration while ensuring that every analytical response is grounded in actual query execution results.

---

## ⚡ Core Principles

1. **AI-Independent Core:** All analytical features, including database connections, file uploads, datasets, SQL Lab, charts, and dashboards, work independently without requiring an AI provider or API key.

2. **Zero-Hallucination Grounding:** AI-generated analytical responses must be grounded in executed SQL query results. Every reported number must be traceable to returned rows or verified calculations.

3. **Saveable Artifacts:** AI-generated SQL queries, chart configurations, and analytical tables are standard platform entities that users can edit, save, and reuse.

4. **AST Safety & Row-Level Security:** Every executed SQL statement passes through SQLGlot AST validation to enforce read-only access, block dangerous functions, and apply non-bypassable Row-Level Security (RLS).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11+, FastAPI, Pydantic v2 |
| Metadata Database | SQLite (Instant Local Dev) / PostgreSQL 16 (Production) |
| ORM & Migrations | SQLAlchemy 2.0 Async, Alembic |
| Query Engine & Uploads | Embedded DuckDB |
| SQL Parsing & Validation | SQLGlot AST Engine |
| AI Integration | Groq (`qwen/qwen3.8-27b`) with Multi-Turn Memory & Zero-Hallucination Grounding |
| Frontend | React 18, TypeScript, Vite |
| UI Framework | Tailwind CSS, Lucide Icons |
| Data Visualization | Apache ECharts |
| Dashboard Layout | react-grid-layout |
| SQL Editor | Monaco Editor |
| Authentication | Cookie-based JWT |
| Secret Encryption | Fernet |

---

## ✨ Key Features

### 1. Database Connectivity
- Connect external analytical databases and data warehouses.
- Inspect database schemas and tables.
- Discover columns and data types.
- Manage database connections securely.

### 2. File Upload & Data Processing
- Upload CSV and supported flat-file formats.
- Automatic data type inference.
- High-performance ingestion using DuckDB.
- Embedded analytical querying without requiring an external database.

### 3. Semantic Dataset Management
- Configure reusable analytical datasets.
- Define metrics and calculated columns.
- Manage virtual datasets.
- Create a consistent semantic layer for analytics.

### 4. SQL Lab
- Monaco-powered SQL editor.
- SQL syntax highlighting.
- Schema-aware autocomplete.
- Query execution and result inspection.
- Query history and saved SQL artifacts.

### 5. Interactive Dashboards & Chart Gallery
- Drag-and-drop dashboard builder with real-time cross-filtering.
- **Dynamic Dataset Filter in Charts Gallery**: View and filter charts tailored specifically to each uploaded file's schema, columns, and metrics.
- Automatic creation of KPI big numbers, bar distributions, time series lines, and summary tables upon file ingestion.
- Resizable and rearrangeable charts with full Apache ECharts customization.

### 6. Grounded AI Assistant (Powered by Groq)
- **Multi-Turn Conversation Memory**: Remembers prior questions and answers in the chat session for follow-up questions.
- **`+ New` Chat Button**: Easily reset the conversation to start a new analytical inquiry.
- **Zero-Hallucination Grounding**: Every number in the AI response is strictly validated against executed SQL results.
- **Ultra-Fast Inference**: High-speed SQL generation and schema discovery powered by Groq (`qwen/qwen3.8-27b`).
- Saveable AI-generated charts, SQL queries, and tables directly into your dashboards or SQL Lab.

### 7. Security & Administration
- JWT-based authentication.
- Secure HTTP-only cookies.
- Encrypted database credentials.
- SQL AST validation.
- Row-Level Security.
- Dangerous SQL operation restrictions.

---

## 🏗️ System Architecture

```text
                  ASK YOUR DATA
                        |
          +-------------+-------------+
          |                           |
      FRONTEND                    BACKEND API
   React + TypeScript                FastAPI
          |                           |
          |                  +--------+--------+
          |                  |        |        |
          |                Auth    Query    AI Layer
          |                  |        |        |
          |                  |    SQLGlot   LLM Tools
          |                  |        |        |
          |                  +--------+--------+
          |                           |
          |              +------------+-----------+
          |              |            |           |
          |          PostgreSQL     Redis       DuckDB
          |          Metadata      Cache      File Data
          |                           |
          |                       Celery
          |                       Workers
          |
      ECharts
      Dashboards
      Monaco SQL Lab
```

---

## 🚀 Getting Started

### Prerequisites

- Docker Desktop v20.10+
- Docker Compose

Alternatively, for local development:

- Python 3.11+
- Node.js 20+
- PostgreSQL 16
- Redis 7

### 1. Clone the Repository

```bash
git clone <repo-url>
cd "New folder"
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Configure the required database, Redis, authentication, encryption, and optional AI provider settings.

### 3. Start the Application

```bash
docker compose up --build
```

This starts the five development services:

- PostgreSQL
- Redis
- FastAPI Backend
- Celery Worker
- React Frontend

### 4. Access the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Documentation | http://localhost:8000/docs |
| Readiness Health Check | http://localhost:8000/api/v1/health/ready |

### 5. Default Development Admin Credentials

| Field | Value |
|---|---|
| Email | admin@askyourdata.local |
| Password | admin123456 |

**Security Note:** These are development credentials only. Change the default password and configure secure secrets before deploying to production.

---

## 💻 Running Locally (Without Docker)

You can run the entire platform locally in 2 minutes:

### 1. Backend Setup
```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure backend/.env with your Groq API key:
# AI_ENABLED=true
# LLM_PROVIDER=groq
# LLM_MODEL=qwen/qwen3.8-27b
# GROQ_API_KEY=gsk_...

# Start backend server (auto-creates metadata database & system data)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```

Open **`http://localhost:5173`** in your browser and log in with:
- **Email:** `admin@askyourdata.local`
- **Password:** `admin123456`

---

## 🧪 Testing & Quality Assurance

### Backend Tests

```bash
cd backend

pytest tests/ --cov=app --cov-report=term-missing
```

### Frontend Type Checking

```bash
cd frontend

npm run typecheck
```

### Frontend Unit Tests

```bash
npm run test:run
```

---

## 📁 Project Structure

```text
Ask-Your-Data/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth/
│   │   │       ├── databases/
│   │   │       ├── datasets/
│   │   │       ├── charts/
│   │   │       ├── dashboards/
│   │   │       ├── sqllab/
│   │   │       ├── uploads/
│   │   │       ├── ai/
│   │   │       └── admin/
│   │   │
│   │   ├── core/
│   │   ├── db/
│   │   ├── connectors/
│   │   ├── datasets/
│   │   ├── query/
│   │   ├── uploads/
│   │   ├── ai/
│   │   └── workers/
│   │
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── app/
│       ├── features/
│       │   ├── auth/
│       │   ├── databases/
│       │   ├── uploads/
│       │   ├── datasets/
│       │   ├── sqllab/
│       │   ├── explore/
│       │   ├── dashboards/
│       │   ├── ai/
│       │   └── admin/
│       │
│       ├── charts/
│       └── components/
│
├── docs/
├── scripts/
│
├── .env.example
└── README.md
```

---

## 🔐 Security Architecture

Security is a fundamental part of Ask Your Data.

- **Authentication:** JWT-based authentication using secure HTTP-only cookies.
- **Encryption:** Fernet encryption for sensitive credentials.
- **SQL Validation:** SQLGlot AST parsing and validation.
- **Read-Only Execution:** Restrict unauthorized data modification operations.
- **Row-Level Security:** Enforce access policies at the query execution layer.
- **Dangerous Function Blocking:** Prevent execution of restricted SQL functions.
- **Secret Management:** Keep sensitive environment variables outside source control.

---

## 🤖 AI Integration

The AI assistant is an optional intelligence layer, not a dependency of the analytics platform.

When AI is disabled, users can still:

- Connect databases.
- Upload and query files.
- Create datasets.
- Write SQL queries.
- Generate visualizations.
- Build interactive dashboards.

When AI is enabled, users can explore data through natural-language questions and generate reusable analytical artifacts.

**Grounding workflow:**

```text
Natural Language Question
          |
          v
     AI Orchestrator
          |
          v
      SQL Generation
          |
          v
   SQLGlot AST Validation
          |
          v
      RLS Enforcement
          |
          v
     Query Execution
          |
          v
    Verified Result Rows
          |
          v
   Grounded AI Response
```

---

## 📌 Project Goals

- Deliver a complete self-service BI platform.
- Provide analytical capabilities comparable to Apache Superset.
- Enable secure, natural-language data exploration.
- Ensure analytical independence from AI providers.
- Make generated queries and visualizations reusable.
- Maintain reliable, auditable, and secure query execution.

---

## 📜 License

This project is licensed under the **Apache License 2.0**.

---

**Ask Your Data — Connect. Explore. Understand.**