# Ask Your Data

> **Intelligent Business Intelligence & Analytics Platform with Apache Superset Parity and Grounded AI Assistant**

Ask Your Data provides self-service analytics with zero-hallucination conversational data exploration. Connect data warehouses, upload files to a high-speed embedded columnar store (DuckDB), configure semantic datasets, author queries in Monaco SQL Lab, and build rich drag-and-drop dashboards.

---

## ⚡ Non-Negotiable Core Tenets

1. **AI-Independent Core**: Every analytical feature (connectors, uploads, datasets, SQL Lab, charts, dashboards) operates with 100% functionality when AI is disabled and without any API key.
2. **Zero Hallucination Grounding**: The AI assistant never invents or calculates numbers from pre-trained knowledge. Every number in an answer is verified against the rows of an executed query or directly derivable relationships.
3. **Saveable Artifacts**: Everything the AI generates (SQL queries, chart configurations, tables) is a standard, editable, saveable platform entity.
4. **AST Safety & RLS**: All executed SQL passes through AST validation (`sqlglot`) enforcing read-only constraints, dangerous function blocking, and non-bypassable row-level security.

---

## 🛠️ Architecture & Tech Stack

| Layer | Component | Choice |
| :--- | :--- | :--- |
| **Backend API** | REST API & SSE Streaming | Python 3.11+, FastAPI, Pydantic v2 |
| **Metadata Database** | Entity Persistence & History | PostgreSQL 16, SQLAlchemy 2.0 (Async), Alembic |
| **Worker Queue** | Async Ingestion & Long Queries | Celery with Redis 7 Broker |
| **Query Cache** | Result & Metadata Cache | Redis 7 |
| **File Storage & Engine** | Uploaded Flat Files | DuckDB (Embedded Columnar Vector Engine) |
| **SQL Engine** | AST Validation & RLS Rewrite | `sqlglot` |
| **Frontend SPA** | Reactive Interface | React 18, TypeScript (Strict), Vite, Tailwind CSS, shadcn/ui |
| **Charting Engine** | Visualizations | Apache ECharts (`echarts-for-react`) |
| **Dashboards** | Grid Layout & Cross Filtering | `react-grid-layout` |
| **SQL Editor** | Query Authoring | Monaco Editor with Schema Autocomplete |
| **Security & Auth** | Cookie-Based JWT & Encrypted Secrets | `httpOnly` secure cookies, Fernet (AES-128-CBC) |

---

## 🚀 Quickstart (One-Command Dev Start)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (v20.10+) and Docker Compose
- Or Python 3.11+ and Node.js 20+ for local runtime execution

### 1. Launch with Docker Compose

```bash
# Clone the repository
git clone <repo-url>
cd "New folder"

# Copy example environment configuration
cp .env.example .env

# Spin up all 5 container services: postgres, redis, backend, worker, frontend
docker compose up --build
```

Once running:
- **Web Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Readiness Health Check**: [http://localhost:8000/api/v1/health/ready](http://localhost:8000/api/v1/health/ready)

### 2. Default Seeded Admin Credentials
- **Email**: `admin@askyourdata.local`
- **Password**: `admin123456`

---

## 💻 Local Host Development (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or on Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Run initial migrations and seed admin user
python scripts/seed_admin.py

# Start FastAPI dev server with auto-reload
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing and Quality Assurance

### Backend Unit Tests & Coverage
```bash
cd backend
pytest tests/ --cov=app --cov-report=term-missing
```

### Frontend Unit Tests & Typecheck
```bash
cd frontend
npm run typecheck
npm run test:run
```

---

## 📁 Repository Directory Structure

```text
/backend
  /app
    /api/v1          # Routers: auth, databases, datasets, charts, dashboards, sqllab, uploads, ai, admin
    /core            # Configuration, logging, errors, security/Fernet
    /db              # SQLAlchemy models, sessions, base model, seeds
    /connectors      # Analytical database engine factory & schema inspector
    /datasets        # Semantic layer, metrics, calculated columns, virtual tables
    /query           # Query builder, RLS AST rewriter, Redis cache
    /uploads         # File parser, type inference, DuckDB loader
    /ai              # LLM orchestrator, tools, grounding verifier, providers
    /workers         # Celery task definitions
  /tests             # Pytest test suite
/frontend
  /src
    /app             # Routing, layout (AppShell, Sidebar, TopBar), providers
    /features        # Modules: auth, databases, uploads, datasets, sqllab, explore, dashboards, ai, admin
    /charts          # Decentralized plugin chart registry (one folder per chart type)
    /components      # UI components (shadcn/ui primitives, ProtectedRoute)
/docs                # Architecture, security threat model, ADRs
/scripts             # Seeding scripts and dev helpers
docker-compose.yml   # Multi-service development compose definition
docker-compose.prod.yml # Production multi-stage deployment compose
```

---

## 📜 License
Apache License 2.0

