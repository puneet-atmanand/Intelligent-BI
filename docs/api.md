# Ask Your Data — REST API Reference

The Ask Your Data platform exposes a RESTful API built with FastAPI, compliant with OpenAPI 3.1. When the backend is running, interactive Swagger documentation is available at `http://localhost:8000/docs` and ReDoc at `http://localhost:8000/redoc`.

---

## Authentication & Authorization

All endpoints (except health and public routes) authenticate via JWT stored in httpOnly session cookies or `Authorization: Bearer <token>` headers. In development mode with `AUTH_REQUIRED=false`, requests automatically fall back to the default Superuser session.

### Permission Codes
- `databases:read`, `databases:write`
- `datasets:read`, `datasets:write`
- `charts:read`, `charts:write`
- `dashboards:read`, `dashboards:write`
- `sqllab:use`
- `uploads:use`
- `ai:use`
- `admin:access`

---

## Core Endpoints

### 1. Database Connections (`/api/v1/databases`)
- `GET /api/v1/databases/`: List all configured database connections.
- `POST /api/v1/databases/`: Register a new connection (PostgreSQL, MySQL, SQLite, ClickHouse, SQL Server).
- `GET /api/v1/databases/{id}`: Retrieve a connection configuration (passwords always masked).
- `PUT /api/v1/databases/{id}`: Update connection parameters.
- `DELETE /api/v1/databases/{id}`: Soft-delete connection.
- `POST /api/v1/databases/test`: Test live connectivity for credentials before saving.
- `GET /api/v1/databases/{id}/schemas`: Inspect database schemas.
- `GET /api/v1/databases/{id}/tables?schema={s}`: Inspect tables in schema.
- `GET /api/v1/databases/{id}/tables/{table}/columns?schema={s}`: Inspect column names, types, and nullability.

### 2. File Uploads & Ingestion (`/api/v1/uploads`)
- `POST /api/v1/uploads/preview`: Upload CSV, TSV, XLSX, JSON Lines, or Parquet for encoding detection, type inference, and 100-row preview.
- `POST /api/v1/uploads/import`: Ingest file into internal DuckDB or target database with column type overrides and conflict mode (`fail`, `replace`, `append`). Automatically registers a semantic Dataset.
- `GET /api/v1/uploads/`: List uploaded datasets and physical tables.
- `DELETE /api/v1/uploads/{id}`: Remove table and associated file storage.

### 3. Semantic Datasets (`/api/v1/datasets`)
- `GET /api/v1/datasets/`: List semantic datasets.
- `POST /api/v1/datasets/`: Define a physical (table-backed) or virtual (SQL-backed) dataset.
- `GET /api/v1/datasets/{id}`: Retrieve dataset with column metadata and calculated metrics.
- `PUT /api/v1/datasets/{id}`: Update dataset metadata, column aliases, and metrics.
- `DELETE /api/v1/datasets/{id}`: Soft-delete dataset.
- `POST /api/v1/datasets/{id}/columns`: Add or update dataset column definitions.
- `POST /api/v1/datasets/{id}/metrics`: Define SQL metric expressions (e.g. `SUM(revenue)`).

### 4. SQL Lab (`/api/v1/sqllab`)
- `POST /api/v1/sqllab/execute`: Run sandboxed SQL query. Validates AST with `sqlglot`, expands Jinja templating macros, enforces statement timeouts, read-only guarantees, and row limits.
- `GET /api/v1/sqllab/history`: List execution history for the current user.
- `POST /api/v1/sqllab/saved`: Save a reusable SQL query.
- `GET /api/v1/sqllab/saved`: List saved queries.

### 5. Charts & Visualization (`/api/v1/charts`)
- `GET /api/v1/charts/`: List saved charts.
- `POST /api/v1/charts/`: Save a chart configuration with dataset binding, viz type, dimensions, metrics, and display options.
- `GET /api/v1/charts/{id}`: Retrieve saved chart.
- `PUT /api/v1/charts/{id}`: Update chart definition.
- `DELETE /api/v1/charts/{id}`: Delete chart.
- `POST /api/v1/charts/data`: Execute dynamic query for a chart. Builds safe dialect SQL, checks query cache, runs execution on database/DuckDB, returns formatted rows and columns.

### 6. Dashboards (`/api/v1/dashboards`)
- `GET /api/v1/dashboards/`: List dashboards.
- `POST /api/v1/dashboards/`: Create dashboard with grid layout and chart placements.
- `GET /api/v1/dashboards/{id}`: Get dashboard with positioned charts and native cross-filters.
- `PUT /api/v1/dashboards/{id}`: Update layout positions, chart placements, and filters.
- `DELETE /api/v1/dashboards/{id}`: Delete dashboard.

### 7. Grounded AI Assistant (`/api/v1/ai`)
- `GET /api/v1/ai/status`: Check whether AI is enabled, current LLM provider, model, and API key presence.
- `POST /api/v1/ai/chat`: Execute natural language analytical query against data.
  - Generates read-only SQL via multi-step tool calling.
  - Enforces AST safety and table boundaries.
  - Executes query on live database.
  - Verifies that every number in final answer exists in returned data rows (Anti-Hallucination Guardrail).
  - Returns answer, executed SQL, data rows, grounding verification audit, and recommended chart visualization.
- `POST /api/v1/ai/verify`: Ad-hoc numeric verification endpoint.
- `GET /api/v1/ai/conversations`: List user AI conversation threads.
- `GET /api/v1/ai/conversations/{id}/messages`: Retrieve message history and executed tool calls.
