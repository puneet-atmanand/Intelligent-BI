"""File Uploads Router (Skeleton for Phase 1)."""
from fastapi import APIRouter, Depends
from app.api.v1.deps import require_permission
from app.db.models import User

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.get("/")
async def list_uploads(
    current_user: User = Depends(require_permission("uploads:use")),
) -> dict:
    """List uploaded tabular files."""
    return {"data": []}

