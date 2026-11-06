# ADR-006: Direct Workspace Access with Automatic Admin Authentication (Bypass Login)

## Status
Accepted

## Context
For rapid local exploration and standalone deployment, requiring user authentication, login credentials, and session management on every browser restart introduces unnecessary friction. The user explicitly requested to remove the login page.

## Decision
1. **Frontend**:
   - The `/login` route is removed and redirected to `/`.
   - The application shell (`AppShell`) loads directly as the root application route.
   - The auth state store (`authStore`) initializes directly with an authenticated System Administrator profile with all system permissions (`databases:write`, `datasets:write`, `charts:write`, `dashboards:write`, `sqllab:use`, `uploads:use`, `admin:access`, `ai:use`).
2. **Backend**:
   - In `app/api/v1/deps.py`, if a request arrives without a JWT token or cookie, the system automatically falls back to the default seeded `admin` superuser account.
   - An environment configuration flag `AUTH_REQUIRED` is introduced (default `false` in development), permitting direct API access while preserving RBAC structures.

## Consequences
- **Positive**: Zero login friction; immediate access to all BI features, charts, dashboards, datasets, and SQL Lab upon launching `http://localhost:5173`.
- **Negative**: Unsuitable for multi-tenant production without toggling `AUTH_REQUIRED=true`.

