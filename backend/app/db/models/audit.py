"""Audit Logs, API Tokens, and Scheduled Reports."""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import BaseModel


class AuditLog(BaseModel):
    """System-wide audit trail of sensitive actions."""
    __tablename__ = "audit_log"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # login, create_connection, delete_dataset, run_ai_query
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False)  # database, dataset, chart, user
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)


class ApiToken(BaseModel):
    """Personal API tokens for programmatic platform access."""
    __tablename__ = "api_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class ReportSchedule(BaseModel):
    """Scheduled email reports and alerts."""
    __tablename__ = "report_schedules"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    cron_expression: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "0 9 * * 1"
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    dashboard_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("dashboards.id", ondelete="CASCADE"),
        nullable=True,
    )
    chart_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("charts.id", ondelete="CASCADE"),
        nullable=True,
    )
    recipients: Mapped[List[str]] = mapped_column(JSON, default=list)  # email addresses

