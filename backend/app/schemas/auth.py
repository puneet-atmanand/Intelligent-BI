"""Authentication Schemas."""
import uuid
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """User login credential payload."""
    email: EmailStr
    password: str = Field(..., min_length=6)


class PermissionOut(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    resource: str

    model_config = {"from_attributes": True}


class RoleOut(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    is_system: bool
    permissions: List[PermissionOut] = []

    model_config = {"from_attributes": True}


class UserProfileOut(BaseModel):
    """User profile response with roles and granular permissions."""
    id: uuid.UUID
    email: str
    full_name: str
    is_active: bool
    is_superuser: bool
    roles: List[RoleOut] = []
    permissions: List[str] = []

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Token response returned upon successful authentication."""
    access_token: str
    token_type: str = "bearer"
    user: UserProfileOut

