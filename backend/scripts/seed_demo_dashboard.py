"""Seed 10 distinct charts and assemble an Executive Sales Performance Dashboard."""
import asyncio
import os
import sys
from typing import List

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy import select, delete
from app.core.config import settings
from app.db.models import User, Dataset, Chart, Dashboard, DashboardChart, DashboardFilter
from app.db.session import AsyncSessionLocal
from scripts.seed_demo_data import main as seed_demo_data_main


async def seed_demo_dashboard() -> None:
    print("--- Seeding Demo Charts & Executive Dashboard ---")

    async with AsyncSessionLocal() as session:
        # 1. Fetch Admin User
        user_res = await session.execute(
            select(User).where(User.email == settings.ADMIN_EMAIL)
        )
        admin = user_res.scalar_one_or_none()
        if not admin:
            print("[ERROR] Admin user not found.")
            return

        # 2. Fetch global_sales dataset
        ds_res = await session.execute(
            select(Dataset).where(Dataset.table_name == "global_sales", Dataset.deleted_at.is_(None))
        )
        dataset = ds_res.scalar_one_or_none()
        if not dataset:
            print("Dataset 'global_sales' not found. Seeding dataset first...")
            await seed_demo_data_main()
            ds_res = await session.execute(
                select(Dataset).where(Dataset.table_name == "global_sales", Dataset.deleted_at.is_(None))
            )
            dataset = ds_res.scalar_one_or_none()

        if not dataset:
            print("[ERROR] Failed to obtain 'global_sales' dataset.")
            return

        print(f"Using Dataset '{dataset.name}' (ID: {dataset.id})")

        # 3. Define 10 distinct charts
        chart_defs = [
            {
                "title": "Total Revenue",
                "description": "Aggregate gross revenue across all sales orders",
                "viz_type": "big_number",
                "params": {
                    "metrics": [
                        {"name": "total_revenue", "sql_expression": "SUM(total_revenue)", "label": "Total Revenue"}
                    ],
                    "options": {"prefix": "$", "precision": 2},
                },
            },
            {
                "title": "Net Profit Trend",
                "description": "Total net profit with sparkline time progression",
                "viz_type": "big_number_trendline",
                "params": {
                    "time_column": "order_date",
                    "time_grain": "month",
                    "metrics": [
                        {"name": "total_profit", "sql_expression": "SUM(net_profit)", "label": "Total Profit"}
                    ],
                    "options": {"prefix": "$", "precision": 2},
                },
            },
            {
                "title": "Revenue by Product Category",
                "description": "Gross sales volume broken down by department category",
                "viz_type": "bar",
                "params": {
                    "dimensions": ["category"],
                    "metrics": [
                        {"name": "total_revenue", "sql_expression": "SUM(total_revenue)", "label": "Revenue ($)"}
                    ],
                    "row_limit": 50,
                },
            },
            {
                "title": "Monthly Revenue & Profit Trajectory",
                "description": "Multi-series monthly financial revenue and net profit curve",
                "viz_type": "line",
                "params": {
                    "time_column": "order_date",
                    "time_grain": "month",
                    "metrics": [
                        {"name": "total_revenue", "sql_expression": "SUM(total_revenue)", "label": "Revenue ($)"},
                        {"name": "total_profit", "sql_expression": "SUM(net_profit)", "label": "Profit ($)"},
                    ],
                    "row_limit": 50,
                },
            },
            {
                "title": "Regional Sales Distribution",
                "description": "Proportional revenue distribution across global sales regions",
                "viz_type": "pie",
                "params": {
                    "dimensions": ["region"],
                    "metrics": [
                        {"name": "total_revenue", "sql_expression": "SUM(total_revenue)", "label": "Revenue ($)"}
                    ],
                    "options": {"isDonut": True},
                },
            },
            {
                "title": "Regional Volume Inflow",
                "description": "Stacked area visualization of regional revenue",
                "viz_type": "area",
                "params": {
                    "dimensions": ["region"],
                    "metrics": [
                        {"name": "total_revenue", "sql_expression": "SUM(total_revenue)", "label": "Revenue ($)"}
                    ],
                },
            },
            {
                "title": "Units Sold vs Net Profit",
                "description": "Transaction level correlation between unit volume and net margin",
                "viz_type": "scatter",
                "params": {
                    "dimensions": ["units_sold", "net_profit"],
                    "metrics": [],
                    "row_limit": 80,
                },
            },
            {
                "title": "Region x Category Revenue Matrix",
                "description": "Heatmap density matrix evaluating category sales by geography",
                "viz_type": "heatmap",
                "params": {
                    "dimensions": ["region", "category"],
                    "metrics": [
                        {"name": "total_revenue", "sql_expression": "SUM(total_revenue)", "label": "Revenue ($)"}
                    ],
                },
            },
            {
                "title": "Order Value Distribution",
                "description": "Histogram frequency of individual transaction sizes",
                "viz_type": "histogram",
                "params": {
                    "dimensions": ["total_revenue"],
                    "metrics": [],
                    "row_limit": 100,
                },
            },
            {
                "title": "Top Customer Accounts Breakdown",
                "description": "Tabular audit of enterprise customers and product categories",
                "viz_type": "table",
                "params": {
                    "dimensions": ["customer_name", "region", "category"],
                    "metrics": [
                        {"name": "total_revenue", "sql_expression": "SUM(total_revenue)", "label": "Total Revenue"},
                        {"name": "total_profit", "sql_expression": "SUM(net_profit)", "label": "Total Profit"},
                    ],
                    "row_limit": 15,
                },
            },
        ]

        # 4. Upsert Charts
        saved_charts: List[Chart] = []
        for cdef in chart_defs:
            existing = await session.execute(
                select(Chart).where(Chart.title == cdef["title"], Chart.deleted_at.is_(None))
            )
            chart = existing.scalar_one_or_none()
            if not chart:
                chart = Chart(
                    title=cdef["title"],
                    description=cdef["description"],
                    dataset_id=dataset.id,
                    viz_type=cdef["viz_type"],
                    params=cdef["params"],
                    query_context={"dataset_name": dataset.name},
                    owners=[admin.email],
                    created_by_id=admin.id,
                )
                session.add(chart)
                await session.flush()
                print(f"Created Chart: '{chart.title}' ({chart.viz_type})")
            else:
                chart.params = cdef["params"]
                chart.description = cdef["description"]
                print(f"Updated Chart: '{chart.title}' ({chart.viz_type})")
            saved_charts.append(chart)

        await session.commit()

        # 5. Create or Update Executive Dashboard
        dash_slug = "executive-sales-overview"
        dash_res = await session.execute(
            select(Dashboard).where(Dashboard.slug == dash_slug, Dashboard.deleted_at.is_(None))
        )
        dashboard = dash_res.scalar_one_or_none()

        if not dashboard:
            dashboard = Dashboard(
                title="Executive Sales Performance",
                description="Real-time multi-dimensional executive dashboard monitoring global sales, margin trends, customer orders and regional distributions across all product categories.",
                slug=dash_slug,
                is_published=True,
                layout={
                    "columns": 12,
                    "items": [
                        {"i": str(c.id), "x": (idx % 2) * 6, "y": (idx // 2) * 4, "w": 6, "h": 4}
                        for idx, c in enumerate(saved_charts)
                    ],
                },
                owners=[admin.email],
                created_by_id=admin.id,
            )
            session.add(dashboard)
            await session.flush()
            print(f"Created Dashboard: '{dashboard.title}' (slug: {dashboard.slug})")
        else:
            dashboard.title = "Executive Sales Performance"
            dashboard.description = "Real-time multi-dimensional executive dashboard monitoring global sales, margin trends, customer orders and regional distributions across all product categories."
            dashboard.is_published = True
            dashboard.layout = {
                "columns": 12,
                "items": [
                    {"i": str(c.id), "x": (idx % 2) * 6, "y": (idx // 2) * 4, "w": 6, "h": 4}
                    for idx, c in enumerate(saved_charts)
                ],
            }
            print(f"Updated Dashboard: '{dashboard.title}' (slug: {dashboard.slug})")

        # 6. Re-attach Placements
        # Clear existing placements and filters
        await session.execute(
            delete(DashboardChart).where(DashboardChart.dashboard_id == dashboard.id)
        )
        await session.execute(
            delete(DashboardFilter).where(DashboardFilter.dashboard_id == dashboard.id)
        )
        await session.flush()

        chart_ids_str = [str(c.id) for c in saved_charts]

        # Add placements with clean 2-column grid layout
        for idx, chart in enumerate(saved_charts):
            placement = DashboardChart(
                dashboard_id=dashboard.id,
                chart_id=chart.id,
                position={"x": (idx % 2) * 6, "y": (idx // 2) * 4, "w": 6, "h": 4},
            )
            session.add(placement)

        # Add native filters
        f_region = DashboardFilter(
            dashboard_id=dashboard.id,
            name="region",
            filter_type="value_select",
            target_charts=chart_ids_str,
            default_value="all",
        )
        f_category = DashboardFilter(
            dashboard_id=dashboard.id,
            name="category",
            filter_type="value_select",
            target_charts=chart_ids_str,
            default_value="all",
        )
        session.add(f_region)
        session.add(f_category)

        await session.commit()
        print("Successfully seeded all 10 charts and assembled Executive Sales Performance Dashboard!")


if __name__ == "__main__":
    asyncio.run(seed_demo_dashboard())
