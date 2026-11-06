"""Datasets Router (Skeleton for Phase 1)."""
from fastapi import APIRouter, Depends
from app.api.v1.deps import require_permission
from app.db.models import User

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get("/")
async def list_datasets(
    current_user: User = Depends(require_permission("datasets:read")),
) -> dict:
    """List datasets."""
    return {"data": []}

