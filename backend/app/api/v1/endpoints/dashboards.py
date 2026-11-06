"""Dashboards Router (Skeleton for Phase 3)."""
from fastapi import APIRouter, Depends
from app.api.v1.deps import require_permission
from app.db.models import User

router = APIRouter(prefix="/dashboards", tags=["Dashboards"])


@router.get("/")
async def list_dashboards(
    current_user: User = Depends(require_permission("dashboards:read")),
) -> dict:
    """List dashboards."""
    return {"data": []}

