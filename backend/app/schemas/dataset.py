"""Dataset Schemas."""
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DatasetColumnBase(BaseModel):
    name: str
    verbose_name: Optional[str] = None
    data_type: str
    description: Optional[str] = None
    is_datetime: bool = False
    is_dimension: bool = True
    is_filterable: bool = True
    is_groupable: bool = True
    is_hidden_from_ai: bool = False


class DatasetColumnOut(DatasetColumnBase):
    id: uuid.UUID
    dataset_id: uuid.UUID

    model_config = {"from_attributes": True}


class DatasetMetricBase(BaseModel):
    name: str
    verbose_name: Optional[str] = None
    sql_expression: str
    metric_type: str = "aggregate"
    number_format: Optional[str] = None
    description: Optional[str] = None


class DatasetMetricOut(DatasetMetricBase):
    id: uuid.UUID
    dataset_id: uuid.UUID

    model_config = {"from_attributes": True}


class RLSRuleBase(BaseModel):
    role_id: uuid.UUID
    clause: str
    description: Optional[str] = None
    is_active: bool = True


class RLSRuleOut(RLSRuleBase):
    id: uuid.UUID
    dataset_id: uuid.UUID

    model_config = {"from_attributes": True}


class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    database_id: uuid.UUID
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    is_virtual: bool = False
    sql_expression: Optional[str] = None


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    sql_expression: Optional[str] = None


class DatasetOut(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    database_id: uuid.UUID
    database_name: Optional[str] = None
    schema_name: Optional[str] = None
    table_name: Optional[str] = None
    is_virtual: bool
    sql_expression: Optional[str] = None
    columns: List[DatasetColumnOut] = []
    metrics: List[DatasetMetricOut] = []
    rls_rules: List[RLSRuleOut] = []

    model_config = {"from_attributes": True}
