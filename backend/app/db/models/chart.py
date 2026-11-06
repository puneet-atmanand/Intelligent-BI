"""Chart Entity Model."""
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import ForeignKey, String, Text, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Chart(BaseModel):
    """Saved Chart definition."""
    __tablename__ = "charts"

    title: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )
    viz_type: Mapped[str] = mapped_column(String(50), nullable=False)  # bar, line, table, pie, etc.

    # Form parameters: metrics, dimensions, filters, time_range, group_by, sort, etc.
    params: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    # Query context / cached query configuration
    query_context: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)

    owners: Mapped[List[str]] = mapped_column(JSON, default=list)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

