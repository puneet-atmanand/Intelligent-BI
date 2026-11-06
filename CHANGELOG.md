# Changelog

All notable changes to the **Ask Your Data** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Phase 0: Plan and Scaffold - 2026-11-06

### Added
- **Repository Architecture**: Monorepo skeleton with `/backend`, `/frontend`, `/docs`, `/scripts`, and root configuration.
- **Documentation & ADRs**:
  - `docs/architecture.md`: Comprehensive system architecture and data flow diagrams.
  - `docs/security.md`: Threat model, credential encryption standards, and AST RLS rewrite architecture.
  - `docs/decisions/ADR-001`: Asynchronous metadata ORM with dynamic synchronous engine pooling.
  - `docs/decisions/ADR-002`: DuckDB for internal storage of uploaded tabular files and concurrency control.
  - `docs/decisions/ADR-003`: `sqlglot` for SQL AST validation, dialect transpilation, and RLS rewriting.
  - `docs/decisions/ADR-004`: Strict numeric grounding and anti-hallucination verification.
  - `docs/decisions/ADR-005`: Open plugin architecture for the chart registry.
- **Docker Compose Environments**:
  - `docker-compose.yml`: Local multi-container development configuration for `postgres:16-alpine`, `redis:7-alpine`, `backend` (FastAPI), `worker` (Celery), and `frontend` (Vite dev server).
  - `docker-compose.prod.yml`: Production multi-stage build with static Nginx serving.
  - `.env.example`: Complete environment variable blueprint.
- **GitHub Actions CI**:
  - `.github/workflows/ci.yml`: Automated pipeline for backend linting (`ruff`), typechecking (`mypy`), unit testing with coverage (`pytest`), and frontend TypeScript check, linting, and testing (`vitest`).
- **Backend Core**:
  - FastAPI application factory with structured JSON logging (`JSONFormatter`), request ID middleware, CORS, and unified error handling (`AppException`).
  - Cryptography module: `bcrypt` password hashing, JWT creation/verification, and Fernet (AES-128-CBC) credential encryption.
  - SQLAlchemy 2.0 async engine and declarative models with UUID keys and UTC timestamps: `User`, `Role`, `Permission`, `UserRole`, `RolePermission`, `DatabaseConnection`, `UploadedFile`, `Dataset`, `DatasetColumn`, `DatasetMetric`, `RLSRule`, `Chart`, `Dashboard`, `DashboardChart`, `DashboardFilter`, `SavedQuery`, `QueryHistory`, `AIConversation`, `AIMessage`, `AIToolCall`, `AIFeedback`, `AuditLog`, `ApiToken`, `ReportSchedule`.
  - Database bootstrap & seeder: `app/db/init_db.py` and `scripts/seed_admin.py` generating standard system roles, permissions, default DuckDB connection, and the default admin user.
  - Health check endpoints: `GET /api/v1/health/live` and `GET /api/v1/health/ready` probing PostgreSQL, Redis, and DuckDB storage.
  - Auth endpoints: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, `POST /api/v1/auth/refresh`.
  - Skeleton routers for Phase 1 through Phase 4.
  - Celery task worker configuration (`app/workers/celery_app.py`).
- **Frontend Core**:
  - React 18, TypeScript (strict), Vite, Tailwind CSS, shadcn/ui design tokens.
  - Zustand auth store (`useAuthStore`) managing user profile and cookie sessions.
  - Accessible WCAG AA Login page with demo autofill helper.
  - AppShell layout with collapsible left sidebar (Home, Dashboards, Charts, Datasets, SQL Lab, Databases, Uploads, Settings, Admin) and top navigation bar.
  - HomePage with "Connect Data" wizard (Connect a Database / Upload a File) and platform status overview.
  - Global AI Assistant drawer (`AIDrawer`) respecting system enable/disable flags.
  - Decentralized Chart Plugin Registry (`frontend/src/charts/`) implementing ADR-005.
- **Test Suites**:
  - Backend pytest suite testing health probes, password hashing, JWT lifecycle, Fernet encryption, and admin login.
  - Frontend vitest suite verifying the chart plugin registry.

