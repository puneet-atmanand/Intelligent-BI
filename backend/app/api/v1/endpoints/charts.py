"""Charts Router (Skeleton for Phase 2)."""
from fastapi import APIRouter, Depends
from app.api.v1.deps import require_permission
from app.db.models import User

router = APIRouter(prefix="/charts", tags=["Charts"])


@router.get("/")
async def list_charts(
    current_user: User = Depends(require_permission("charts:read")),
) -> dict:
    """List charts."""
    return {"data": []}

