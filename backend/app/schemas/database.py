"""Database Connection Schemas."""
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DatabaseConnectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    dialect: str = Field(..., max_length=50)

    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None

    ssl_mode: str = "prefer"
    allow_dml: bool = False
    allow_file_uploads: bool = False
    allow_sqllab: bool = True
    row_limit: int = 10000
    statement_timeout_seconds: int = 30
    cache_timeout_seconds: int = 300

    ai_allowed_schemas: List[str] = []
    ai_allowed_tables: List[str] = []
    extra_params: Dict[str, Any] = {}


class DatabaseConnectionCreate(DatabaseConnectionBase):
    password: Optional[str] = None
    raw_uri: Optional[str] = None


class DatabaseConnectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    raw_uri: Optional[str] = None

    ssl_mode: Optional[str] = None
    allow_dml: Optional[bool] = None
    allow_file_uploads: Optional[bool] = None
    allow_sqllab: Optional[bool] = None
    row_limit: Optional[int] = None
    statement_timeout_seconds: Optional[int] = None
    cache_timeout_seconds: Optional[int] = None

    ai_allowed_schemas: Optional[List[str]] = None
    ai_allowed_tables: Optional[List[str]] = None


class DatabaseConnectionOut(DatabaseConnectionBase):
    id: uuid.UUID
    is_system: bool
    has_encrypted_password: bool = False

    model_config = {"from_attributes": True}


class ConnectionTestRequest(BaseModel):
    dialect: str
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    raw_uri: Optional[str] = None


class ConnectionTestResponse(BaseModel):
    success: bool
    message: str

