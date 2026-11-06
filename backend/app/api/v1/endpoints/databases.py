"""Database Connections Router (Skeleton for Phase 1)."""
from fastapi import APIRouter, Depends
from app.api.v1.deps import require_permission
from app.db.models import User

router = APIRouter(prefix="/databases", tags=["Databases"])


@router.get("/")
async def list_databases(
    current_user: User = Depends(require_permission("databases:read")),
) -> dict:
    """List configured database connections."""
    return {"data": []}

