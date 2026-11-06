"""AI Assistant Router (Skeleton for Phase 4)."""
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.deps import require_permission
from app.core.config import settings
from app.db.models import User

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.get("/status")
async def get_ai_status(
    current_user: User = Depends(require_permission("ai:use")),
) -> dict:
    """Return whether the AI Assistant is enabled on this instance."""
    return {
        "enabled": settings.AI_ENABLED,
        "provider": settings.LLM_PROVIDER if settings.AI_ENABLED else None,
        "model": settings.LLM_MODEL if settings.AI_ENABLED else None,
    }


@router.post("/query")
async def ask_ai(
    current_user: User = Depends(require_permission("ai:use")),
) -> dict:
    """Query endpoint for grounded AI reasoning."""
    if not settings.AI_ENABLED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI Assistant is disabled on this platform",
        )
    return {"message": "AI Assistant pipeline active"}

