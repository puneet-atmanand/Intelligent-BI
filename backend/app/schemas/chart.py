"""Pydantic Schemas for Charts and Chart Data Queries."""
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ChartBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    dataset_id: uuid.UUID
    viz_type: str = Field(..., min_length=1, max_length=50)
    params: Dict[str, Any] = Field(default_factory=dict)
    query_context: Dict[str, Any] = Field(default_factory=dict)


class ChartCreate(ChartBase):
    pass


class ChartUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    viz_type: Optional[str] = None
    params: Optional[Dict[str, Any]] = None
    query_context: Optional[Dict[str, Any]] = None


class ChartOut(ChartBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owners: List[str] = Field(default_factory=list)
    created_by_id: Optional[uuid.UUID] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ChartDataRequest(BaseModel):
    dataset_id: uuid.UUID
    viz_type: str = "bar"
    dimensions: List[str] = Field(default_factory=list)
    metrics: List[Dict[str, Any]] = Field(default_factory=list)
    filters: List[Dict[str, Any]] = Field(default_factory=list)
    time_column: Optional[str] = None
    time_grain: Optional[str] = None
    time_range: Optional[Dict[str, str]] = None
    order_by: Optional[List[Dict[str, str]]] = None
    row_limit: int = 1000


class ChartDataResponse(BaseModel):
    columns: List[str]
    column_types: List[str]
    rows: List[List[Any]]
    row_count: int
    sql: str
    duration_ms: int
