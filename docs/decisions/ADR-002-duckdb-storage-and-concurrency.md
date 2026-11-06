# ADR-002: DuckDB for Internal Storage of Uploaded Tabular Files

## Status
Accepted

## Context
Users frequently need to analyze arbitrary flat files (CSV, TSV, Parquet, JSON, Excel) without setting up an external database. The system needs a high-performance, embedded, columnar query engine capable of sub-second vector processing, aggregate computations, and instant queryability in SQL Lab, Chart Explore, and AI tools.

## Decision
1. **Engine**: Use DuckDB as the internal file analytics database, exposed to the system as a default connection named `Uploads`.
2. **Concurrency Strategy**: DuckDB permits multiple concurrent read connections but only a single write connection per database file.
   - All analytical queries (SQL Lab, Explore, Dashboards, AI) will connect to DuckDB with `read_only=True`.
   - All write operations (creating tables from uploaded files, appending, replacing) will acquire an exclusive process mutex (or Celery task lock) and release it immediately upon transaction commit.
3. **Data Integrity**: Temporary tables will be used during file ingestion so failed parses never corrupt the primary database file.

## Consequences
- **Positive**: Blazing fast analytical query execution directly over user files without requiring an external database cluster; zero external dependencies for file analytics.
- **Negative**: Careful locking discipline required during concurrent file imports.

