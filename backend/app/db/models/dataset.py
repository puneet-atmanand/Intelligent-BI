"""Semantic Datasets, Columns, Metrics, and Row-Level Security Rules."""
import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Dataset(BaseModel):
    """Semantic Dataset representation (Physical table/view or Virtual SQL)."""
    __tablename__ = "datasets"

    name: Mapped[str] = mapped_column(String(150), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    database_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("database_connections.id", ondelete="CASCADE"),
        nullable=False,
    )
    schema_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    table_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Virtual datasets use custom SQL
    is_virtual: Mapped[bool] = mapped_column(Boolean, default=False)
    sql_expression: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    owners: Mapped[List[str]] = mapped_column(JSON, default=list)
    created_by_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    columns: Mapped[List["DatasetColumn"]] = relationship(
        "DatasetColumn",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )
    metrics: Mapped[List["DatasetMetric"]] = relationship(
        "DatasetMetric",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )
    rls_rules: Mapped[List["RLSRule"]] = relationship(
        "RLSRule",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )


class DatasetColumn(BaseModel):
    """Column definition within a dataset."""
    __tablename__ = "dataset_columns"

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    verbose_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    data_type: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    is_datetime: Mapped[bool] = mapped_column(Boolean, default=False)
    is_dimension: Mapped[bool] = mapped_column(Boolean, default=True)
    is_filterable: Mapped[bool] = mapped_column(Boolean, default=True)
    is_groupable: Mapped[bool] = mapped_column(Boolean, default=True)
    is_hidden_from_ai: Mapped[bool] = mapped_column(Boolean, default=False)

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="columns")


class DatasetMetric(BaseModel):
    """Calculated metric or aggregation definition."""
    __tablename__ = "dataset_metrics"

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    verbose_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    sql_expression: Mapped[str] = mapped_column(Text, nullable=False)  # e.g. SUM(sales_amount)
    metric_type: Mapped[str] = mapped_column(String(50), default="aggregate")
    number_format: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g. $, .2f, %
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="metrics")


class RLSRule(BaseModel):
    """Row-Level Security Rule attached to a dataset and role."""
    __tablename__ = "rls_rules"

    dataset_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        nullable=False,
    )
    clause: Mapped[str] = mapped_column(Text, nullable=False)  # e.g. "tenant_id = 10" or "country = 'US'"
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="rls_rules")

