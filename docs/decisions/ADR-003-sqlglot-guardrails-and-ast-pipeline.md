# ADR-003: sqlglot for SQL Validation, Dialect Transpilation, and AST Rewriting

## Status
Accepted

## Context
Executing arbitrary SQL queries from SQL Lab, chart builders, and especially LLMs presents significant safety risks: SQL injection, denial of service, destructive DDL/DML, bypassing row-level security, and dialect-specific syntax incompatibilities.

## Decision
All SQL executed within Ask Your Data will pass through a unified `sqlglot` pipeline:
1. **Dialect Parsing**: Parse input SQL into an AST using the target connection's specific dialect (e.g. `postgres`, `mysql`, `duckdb`, `clickhouse`).
2. **Single Statement Validation**: Reject queries containing multiple statements separated by semicolons.
3. **AST Node Whitelist**: Permit only `exp.Select` or `exp.Expression` whose root is `Select` or `With`. Completely reject `Drop`, `Delete`, `Insert`, `Update`, `Create`, `Alter`, `Copy`, `Set`, and `Call`.
4. **Dangerous Function Blacklist**: Disallow dialect functions that perform file I/O or system execution (`pg_read_file`, `xp_cmdshell`, DuckDB `read_csv`, `read_parquet`, etc.).
5. **AST RLS Rewriting**: Automatically substitute referenced tables with subqueries applying tenant/role RLS filters.
6. **Limit Injection**: Clamp or inject `LIMIT` clauses to protect against memory exhaustion.

## Consequences
- **Positive**: Cryptographic and semantic certainty of read-only execution; transparent cross-dialect transpilation; automated and non-bypassable RLS enforcement.
- **Negative**: Extremely complex or obscure vendor-specific syntax may fail parsing if not supported by `sqlglot`.

