"""CLI script to initialize database tables and seed default admin user."""
import asyncio
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.db.base import Base
from app.db.init_db import init_system_data
from app.db.session import AsyncSessionLocal, async_engine


async def main() -> None:
    print(f"Connecting to database: {settings.METADATA_DATABASE_URL}")
    async with async_engine.begin() as conn:
        print("Creating all database tables if not existing...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("Seeding roles, permissions, and admin user...")
        await init_system_data(session)

    print("\n[SUCCESS] Admin user verified / provisioned:")
    print(f"  Email:    {settings.ADMIN_EMAIL}")
    print(f"  Password: {settings.ADMIN_PASSWORD}")
    print(f"  Role:     Admin (Superuser)")


if __name__ == "__main__":
    asyncio.run(main())

