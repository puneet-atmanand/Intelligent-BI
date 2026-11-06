"""Security, Cryptography, and Token Management."""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import bcrypt
from cryptography.fernet import Fernet
import jwt

from app.core.config import settings
from app.core.errors import AuthenticationError


def hash_password(password: str) -> str:
    """Hash plain password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"iat": now, "exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create signed JWT refresh token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"iat": now, "exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT token signature and expiration."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token has expired")
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid authentication token")


# --- Credential Encryption via Fernet ---
_fernet_instance: Optional[Fernet] = None


def get_fernet() -> Fernet:
    """Initialize or return cached Fernet symmetric encryption cipher."""
    global _fernet_instance
    if _fernet_instance is None:
        try:
            _fernet_instance = Fernet(settings.ENCRYPTION_KEY.encode("utf-8"))
        except Exception:
            # Fallback for dev if ENCRYPTION_KEY is invalid/empty: generate a valid key
            key = Fernet.generate_key()
            _fernet_instance = Fernet(key)
    return _fernet_instance


def encrypt_secret(secret: str) -> str:
    """Encrypt sensitive string (e.g. database password/URI) using Fernet."""
    if not secret:
        return ""
    cipher = get_fernet()
    return cipher.encrypt(secret.encode("utf-8")).decode("utf-8")


def decrypt_secret(encrypted_secret: str) -> str:
    """Decrypt Fernet-encrypted string."""
    if not encrypted_secret:
        return ""
    cipher = get_fernet()
    try:
        return cipher.decrypt(encrypted_secret.encode("utf-8")).decode("utf-8")
    except Exception:
        raise ValueError("Failed to decrypt secret with configured encryption key")

