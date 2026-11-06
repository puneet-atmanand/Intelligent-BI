"""Pydantic Schemas for Dashboards, Placements, and Native Filters."""
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DashboardChartPlacement(BaseModel):
    chart_id: uuid.UUID
    position: Dict[str, Any] = Field(default_factory=dict)


class DashboardFilterSchema(BaseModel):
    name: str
    filter_type: str  # value_select, time_range, numeric_range, time_grain
    target_charts: List[str] = Field(default_factory=list)
    default_value: Optional[Any] = None


class DashboardBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    slug: Optional[str] = None
    is_published: bool = False
    layout: Dict[str, Any] = Field(default_factory=dict)


class DashboardCreate(DashboardBase):
    chart_ids: List[uuid.UUID] = Field(default_factory=list)


class DashboardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    layout: Optional[Dict[str, Any]] = None
    chart_ids: Optional[List[uuid.UUID]] = None
    filters: Optional[List[DashboardFilterSchema]] = None


class DashboardOut(DashboardBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    owners: List[str] = Field(default_factory=list)
    created_by_id: Optional[uuid.UUID] = None
    charts: List[Dict[str, Any]] = Field(default_factory=list)
    filters: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
