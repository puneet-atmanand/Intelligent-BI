"""Charts API Endpoints."""
import uuid
import time
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.deps import get_db_session, require_permission
from app.connectors.factory import get_connector
from app.core.errors import NotFoundError, AppException
from app.db.models import Chart, Dataset, DatabaseConnection, User
from app.query.chart_query_builder import build_chart_sql
from app.schemas.chart import (
    ChartCreate,
    ChartDataRequest,
    ChartDataResponse,
    ChartOut,
    ChartUpdate,
)

router = APIRouter(prefix="/charts", tags=["Charts"])


@router.get("/", response_model=List[ChartOut])
async def list_charts(
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permission("charts:read")),
) -> Any:
    """List all saved charts."""
    stmt = (
        select(Chart)
        .where(Chart.deleted_at.is_(None))
        .order_by(Chart.created_at.desc())
    )
    result = await session.execute(stmt)
    charts = result.scalars().all()
    return [
        ChartOut(
            id=c.id,
            title=c.title,
            description=c.description,
            dataset_id=c.dataset_id,
            viz_type=c.viz_type,
            params=c.params or {},
            query_context=c.query_context or {},
            owners=c.owners or [],
            created_by_id=c.created_by_id,
            created_at=c.created_at.isoformat() if c.created_at else None,
            updated_at=c.updated_at.isoformat() if c.updated_at else None,
        )
        for c in charts
    ]


@router.post("/", response_model=ChartOut, status_code=status.HTTP_201_CREATED)
async def create_chart(
    payload: ChartCreate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permission("charts:write")),
) -> Any:
    """Save a new chart definition."""
    dataset = await session.get(Dataset, payload.dataset_id)
    if not dataset or dataset.deleted_at is not None:
        raise NotFoundError("Dataset not found.")

    chart = Chart(
        title=payload.title,
        description=payload.description,
        dataset_id=payload.dataset_id,
        viz_type=payload.viz_type,
        params=payload.params,
        query_context=payload.query_context,
        created_by_id=current_user.id,
        owners=[current_user.email],
    )
    session.add(chart)
    await session.commit()
    await session.refresh(chart)

    return ChartOut(
        id=chart.id,
        title=chart.title,
        description=chart.description,
        dataset_id=chart.dataset_id,
        viz_type=chart.viz_type,
        params=chart.params or {},
        query_context=chart.query_context or {},
        owners=chart.owners or [],
        created_by_id=chart.created_by_id,
        created_at=chart.created_at.isoformat() if chart.created_at else None,
        updated_at=chart.updated_at.isoformat() if chart.updated_at else None,
    )


@router.get("/{id}", response_model=ChartOut)
async def get_chart(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permission("charts:read")),
) -> Any:
    """Get chart details by ID."""
    stmt = select(Chart).where(Chart.id == id, Chart.deleted_at.is_(None))
    result = await session.execute(stmt)
    chart = result.scalar_one_or_none()
    if not chart:
        raise NotFoundError("Chart not found.")

    return ChartOut(
        id=chart.id,
        title=chart.title,
        description=chart.description,
        dataset_id=chart.dataset_id,
        viz_type=chart.viz_type,
        params=chart.params or {},
        query_context=chart.query_context or {},
        owners=chart.owners or [],
        created_by_id=chart.created_by_id,
        created_at=chart.created_at.isoformat() if chart.created_at else None,
        updated_at=chart.updated_at.isoformat() if chart.updated_at else None,
    )


@router.put("/{id}", response_model=ChartOut)
async def update_chart(
    id: uuid.UUID,
    payload: ChartUpdate,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permission("charts:write")),
) -> Any:
    """Update a chart definition."""
    stmt = select(Chart).where(Chart.id == id, Chart.deleted_at.is_(None))
    result = await session.execute(stmt)
    chart = result.scalar_one_or_none()
    if not chart:
        raise NotFoundError("Chart not found.")

    if payload.title is not None:
        chart.title = payload.title
    if payload.description is not None:
        chart.description = payload.description
    if payload.viz_type is not None:
        chart.viz_type = payload.viz_type
    if payload.params is not None:
        chart.params = payload.params
    if payload.query_context is not None:
        chart.query_context = payload.query_context

    await session.commit()
    await session.refresh(chart)

    return ChartOut(
        id=chart.id,
        title=chart.title,
        description=chart.description,
        dataset_id=chart.dataset_id,
        viz_type=chart.viz_type,
        params=chart.params or {},
        query_context=chart.query_context or {},
        owners=chart.owners or [],
        created_by_id=chart.created_by_id,
        created_at=chart.created_at.isoformat() if chart.created_at else None,
        updated_at=chart.updated_at.isoformat() if chart.updated_at else None,
    )


@router.delete("/{id}")
async def delete_chart(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permission("charts:write")),
) -> Dict[str, str]:
    """Delete a chart."""
    stmt = select(Chart).where(Chart.id == id, Chart.deleted_at.is_(None))
    result = await session.execute(stmt)
    chart = result.scalar_one_or_none()
    if not chart:
        raise NotFoundError("Chart not found.")

    await session.delete(chart)
    await session.commit()
    return {"message": "Chart deleted successfully."}


@router.post("/data", response_model=ChartDataResponse)
async def get_chart_data(
    payload: ChartDataRequest,
    session: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(require_permission("charts:read")),
) -> Any:
    """Execute dynamic chart query and return rows, columns and duration."""
    dataset_stmt = select(Dataset).where(Dataset.id == payload.dataset_id, Dataset.deleted_at.is_(None))
    dataset_res = await session.execute(dataset_stmt)
    dataset = dataset_res.scalar_one_or_none()
    if not dataset:
        raise NotFoundError("Dataset not found.")

    db_conn = await session.get(DatabaseConnection, dataset.database_id)
    if not db_conn or db_conn.deleted_at is not None:
        raise NotFoundError("Database connection not found.")

    dialect = db_conn.dialect.lower()
    sql = build_chart_sql(
        dataset=dataset,
        dimensions=payload.dimensions,
        metrics=payload.metrics,
        filters=payload.filters,
        time_column=payload.time_column,
        time_grain=payload.time_grain,
        time_range=payload.time_range,
        order_by=payload.order_by,
        row_limit=payload.row_limit,
        dialect=dialect,
    )

    connector = get_connector(db_conn)
    query_res = connector.execute_query(sql, limit=payload.row_limit)

    return ChartDataResponse(
        columns=query_res.columns,
        column_types=query_res.column_types,
        rows=query_res.rows,
        row_count=query_res.row_count,
        sql=sql,
        duration_ms=query_res.duration_ms,
    )
