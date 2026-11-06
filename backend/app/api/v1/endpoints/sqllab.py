"""SQL Lab Router (Skeleton for Phase 1)."""
from fastapi import APIRouter, Depends
from app.api.v1.deps import require_permission
from app.db.models import User

router = APIRouter(prefix="/sqllab", tags=["SQL Lab"])


@router.get("/history")
async def get_query_history(
    current_user: User = Depends(require_permission("sqllab:use")),
) -> dict:
    """Retrieve SQL Lab query execution history."""
    return {"data": []}

