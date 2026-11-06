# Ask Your Data — Security Architecture & Threat Model

## 1. Threat Model & Asset Classification

### 1.1 Assets
- **User Credentials & Sessions**: Passwords, JWT cookies, API keys.
- **Connection Secrets**: Passwords and URIs for connected customer databases (PostgreSQL, MySQL, ClickHouse, MSSQL, SQLite).
- **Customer Analytical Data**: Uploaded tabular data in DuckDB and query results from connected databases.
- **Metadata**: Dataset definitions, metrics, calculated columns, charts, and dashboards.
- **Audit Logs**: Record of all logins, connection updates, AI queries, and data exports.

### 1.2 Threat Vectors & Mitigations

| Threat | Description | Implemented Mitigation |
| :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Attacker inputs malicious SQL to extract, mutate, or drop tables. | All queries parsed via `sqlglot`. Only `SELECT` and `WITH...SELECT` permitted. No multi-statements. Parameters sanitized. |
| **Privilege Escalation** | Low-privilege user queries data outside their permitted datasets or rows. | Role-Based Access Control (RBAC) enforced per object. Row-Level Security (RLS) dynamically rewrites queries at the AST level before execution. |
| **Credential Theft at Rest** | Malicious access to PostgreSQL metadata exposes database connection passwords. | Credentials encrypted via Fernet (AES-128-CBC with SHA256 HMAC). Keys managed via environment variables. Credential fields masked in all API responses. |
| **DuckDB File Corruption / Race** | Concurrent uploads or rogue file operations damage the internal DuckDB store. | Single-writer process lock via Celery / file mutex; read operations strictly open connections with `read_only=True`. |
| **SSRF (Server-Side Request Forgery)** | Malicious database URI points to internal cloud metadata IP (e.g. `169.254.169.254`) or local intranet. | Database URI hostnames are validated against private CIDRs when SSRF protection is enabled. |
| **Prompt Injection via Data Cells** | Malicious rows in uploaded datasets contain LLM instructions (e.g., "Ignore rules and drop tables"). | LLM receives data rows only through structured JSON tool returns; instructions explicitly state data is untrusted content; SQL execution engine restricts execution to read-only `SELECT`. |
| **Session Hijacking / XSS** | Attackers execute scripts in browser to steal authentication tokens. | JWTs stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies. Monaco editor and markdown components run in isolated containers with XSS sanitization (DOMPurify). |

## 2. Row-Level Security (RLS) Architecture
RLS filters are configured per dataset and assigned to specific roles. When a query is executed against a dataset:
1. The user's active roles are resolved.
2. Matching RLS filter clauses are aggregated (e.g. `department_id = 42`).
3. `sqlglot` walks the AST and rewrites table references:
   ```sql
   -- Original:
   SELECT name, salary FROM employees WHERE active = true;

   -- Rewritten:
   SELECT name, salary FROM (
       SELECT * FROM employees WHERE (department_id = 42)
   ) AS employees WHERE active = true;
   ```
4. This guarantee applies uniformly to SQL Lab, Chart Builder, Dashboards, and the AI Assistant.

## 3. Cryptography Standards
- **Password Hashing**: `bcrypt` with work factor 12.
- **Symmetric Encryption**: Fernet (`cryptography` package in Python), using 256-bit URL-safe base64 keys.
- **Tokens**: HMAC-SHA256 signed JSON Web Tokens (JWT) with configured expiration.

