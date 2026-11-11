"""Base Connector Abstract Interface."""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple


class ColumnMetadata:
    def __init__(
        self,
        name: str,
        data_type: str,
        nullable: bool = True,
        is_primary_key: bool = False,
        description: Optional[str] = None,
    ):
        self.name = name
        self.data_type = data_type
        self.nullable = nullable
        self.is_primary_key = is_primary_key
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "data_type": self.data_type,
            "nullable": self.nullable,
            "is_primary_key": self.is_primary_key,
            "description": self.description,
        }


class QueryResult:
    def __init__(
        self,
        columns: List[str],
        column_types: List[str],
        rows: List[List[Any]],
        row_count: int,
        duration_ms: int,
        sql: str,
        truncated: bool = False,
    ):
        self.columns = columns
        self.column_types = column_types
        self.rows = rows
        self.row_count = row_count
        self.duration_ms = duration_ms
        self.sql = sql
        self.truncated = truncated

    def to_dict(self) -> Dict[str, Any]:
        return {
            "columns": self.columns,
            "column_types": self.column_types,
            "rows": self.rows,
            "row_count": self.row_count,
            "duration_ms": self.duration_ms,
            "sql": self.sql,
            "truncated": self.truncated,
        }


class BaseConnector(ABC):
    """Abstract base connector for analytical databases."""

    @abstractmethod
    def test_connection(self) -> Tuple[bool, str]:
        """Test connection and return (success, message)."""
        pass

    @abstractmethod
    def get_schemas(self) -> List[str]:
        """List accessible schemas/databases."""
        pass

    @abstractmethod
    def get_tables(self, schema_name: Optional[str] = None) -> List[str]:
        """List table and view names in the given schema."""
        pass

    @abstractmethod
    def get_columns(self, table_name: str, schema_name: Optional[str] = None) -> List[ColumnMetadata]:
        """Inspect columns and data types for the given table."""
        pass

    @abstractmethod
    def execute_query(
        self,
        sql: str,
        limit: int = 1000,
        timeout_seconds: int = 30,
    ) -> QueryResult:
        """Execute a read query and return standardized QueryResult."""
        pass

