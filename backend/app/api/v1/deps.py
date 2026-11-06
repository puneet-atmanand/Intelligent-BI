"""FastAPI Dependency Injection Providers."""
from typing import AsyncGenerator, Callable, List
from fastapi import Cookie, Depends, Header, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import AuthenticationError, PermissionDeniedError
from app.core.security import decode_token
from app.db.models import Permission, Role, User
from app.db.session import AsyncSessionLocal


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a scoped async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    request: Request,
    session: AsyncSession = Depends(get_db_session),
    access_token: str | None = Cookie(default=None),
    authorization: str | None = Header(default=None),
) -> User:
    """Extract authenticated user from httpOnly cookie or Authorization header."""
    token: str | None = None

    if access_token:
        token = access_token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()

    if not token:
        raise AuthenticationError("Not authenticated: Missing token")

    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid token: Missing subject")

    # Fetch user with eager loaded roles and their permissions
    stmt = (
        select(User)
        .options(
            selectinload(User.roles).selectinload(Role.permissions),
        )
        .where(User.id == user_id, User.deleted_at.is_(None))
    )
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise AuthenticationError("User not found or deleted")

    if not user.is_active:
        raise AuthenticationError("User account is inactive")

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Ensure current user is active."""
    if not current_user.is_active:
        raise AuthenticationError("User is inactive")
    return current_user


def require_permission(permission_code: str) -> Callable[..., User]:
    """Dependency factory checking if current user possesses permission or is superuser."""

    async def permission_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.is_superuser:
            return current_user

        # Collect user permissions from assigned roles
        user_permissions = set()
        for role in current_user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.code)

        if permission_code not in user_permissions:
            raise PermissionDeniedError(
                f"Missing required permission: '{permission_code}'",
                details={"required_permission": permission_code},
            )

        return current_user

    return permission_checker

