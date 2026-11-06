# ADR-001: Asynchronous Metadata ORM with Dynamic Synchronous Engine Pooling

## Status
Accepted

## Context
FastAPI is built on an asynchronous event loop (`asyncio`). High concurrency, Server-Sent Events (SSE) for streaming query status and AI tokens, and low-latency API handling require non-blocking I/O. However, the platform must connect to a wide variety of analytical databases (PostgreSQL, MySQL, SQLite, SQL Server, ClickHouse, and future BigQuery/Snowflake). Many database drivers in Python either lack async support or have experimental async drivers with connection stability issues under heavy thread load.

## Decision
1. **Metadata Database**: Use asynchronous SQLAlchemy 2.0 with `asyncpg` for all internal CRUD operations, user authentication, permissions, dashboard persistence, and query history.
2. **Analytical Connectors**: Implement a dynamic SQLAlchemy Engine Factory where analytical engines are instantiated using battle-tested synchronous drivers (e.g., `psycopg2`, `pymysql`, `clickhouse-connect`, `pyodbc`).
3. **Execution Model**: Queries against analytical engines will be dispatched via `asyncio.to_thread` or Celery workers to prevent blocking the FastAPI event loop.

## Consequences
- **Positive**: High API responsiveness; native SSE streaming without event loop blocking; robust compatibility with diverse database dialects.
- **Negative**: Requires maintaining two database engine paradigms (async for internal metadata, pooled sync for user query execution).

