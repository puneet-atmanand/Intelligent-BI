"""Seed realistic business sample data into DuckDB and register as Dataset."""
import asyncio
import os
import sys
import random
from datetime import datetime, timedelta

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import select
from app.core.config import settings
from app.db.models import User, Dataset, DatasetMetric
from app.db.session import AsyncSessionLocal
from app.uploads.duckdb_loader import load_file_into_duckdb_and_register_dataset


REGIONS = ["North America", "EMEA", "APAC", "LATAM"]
CATEGORIES = {
    "Electronics": ["Pro Laptop 15", "Wireless Headphones", "Ultra HD Monitor", "Smart Dock", "Bluetooth Mouse"],
    "Office Supplies": ["Ergonomic Chair", "Standing Desk", "Desk Pad", "Whiteboard 4x6", "Cable Organizer"],
    "Software": ["Cloud Analytics Pro", "DevOps Suite Enterprise", "Security Guard Plus", "AI Assistant Seat"],
}
CUSTOMERS = ["Acme Corp", "Globex", "Initech", "Umbrella LLC", "Hooli", "Pied Piper", "Massive Dynamic", "Stark Industries", "Wayne Enterprises", "Cyberdyne"]


def generate_sample_csv(rows: int = 150) -> bytes:
    """Generate CSV bytes for demo business dataset."""
    lines = [
        "order_id,order_date,customer_name,region,category,product,units_sold,unit_price,total_revenue,net_profit"
    ]
    base_date = datetime(2025, 1, 1)

    for i in range(1, rows + 1):
        order_date = (base_date + timedelta(days=random.randint(0, 360))).strftime("%Y-%m-%d")
        customer = random.choice(CUSTOMERS)
        region = random.choice(REGIONS)
        category = random.choice(list(CATEGORIES.keys()))
        product = random.choice(CATEGORIES[category])
        units = random.randint(1, 20)
        price = round(random.uniform(25.0, 1200.0), 2)
        revenue = round(units * price, 2)
        margin = random.uniform(0.18, 0.45)
        profit = round(revenue * margin, 2)

        lines.append(f"{i},{order_date},{customer},{region},{category},{product},{units},{price},{revenue},{profit}")

    return "\n".join(lines).encode("utf-8")


async def main() -> None:
    print("Generating demo business sales dataset...")
    csv_bytes = generate_sample_csv(rows=200)

    async with AsyncSessionLocal() as session:
        # Get admin user
        user_res = await session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        admin = user_res.scalar_one_or_none()
        if not admin:
            print("[ERROR] Admin user not found. Please run scripts.seed_admin first.")
            return

        print("Importing table 'global_sales' into DuckDB and registering Dataset...")
        dataset = await load_file_into_duckdb_and_register_dataset(
            session=session,
            content=csv_bytes,
            filename="global_sales.csv",
            table_name="global_sales",
            conflict_mode="replace",
            user=admin,
        )

        print(f"Created Dataset '{dataset.name}' (ID: {dataset.id}).")

        # Seed standard metrics
        metrics = [
            DatasetMetric(
                dataset_id=dataset.id,
                name="total_revenue",
                verbose_name="Total Revenue ($)",
                metric_type="aggregate",
                sql_expression="SUM(total_revenue)",
                number_format="$,.2f",
                description="Total gross revenue in USD",
            ),
            DatasetMetric(
                dataset_id=dataset.id,
                name="total_profit",
                verbose_name="Total Net Profit ($)",
                metric_type="aggregate",
                sql_expression="SUM(net_profit)",
                number_format="$,.2f",
                description="Total net profit after margins",
            ),
            DatasetMetric(
                dataset_id=dataset.id,
                name="total_units",
                verbose_name="Total Units Sold",
                metric_type="aggregate",
                sql_expression="SUM(units_sold)",
                number_format=",d",
                description="Sum of all units sold across orders",
            ),
            DatasetMetric(
                dataset_id=dataset.id,
                name="avg_order_value",
                verbose_name="Average Order Value ($)",
                metric_type="aggregate",
                sql_expression="AVG(total_revenue)",
                number_format="$,.2f",
                description="Mean revenue per transaction",
            ),
        ]
        session.add_all(metrics)
        await session.commit()
        print(f"Added {len(metrics)} semantic metrics (total_revenue, total_profit, total_units, avg_order_value).")

    print("\n[SUCCESS] Demo data seeded successfully into DuckDB!")


if __name__ == "__main__":
    asyncio.run(main())
