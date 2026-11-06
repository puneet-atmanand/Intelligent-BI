/**
 * Typed API Client for Ask Your Data backend endpoints.
 */

export interface DatabaseConnection {
  id: string;
  name: string;
  description?: string;
  dialect: string;
  host?: string;
  port?: number;
  database_name?: string;
  username?: string;
  ssl_mode?: string;
  allow_dml: boolean;
  allow_file_uploads: boolean;
  allow_sqllab: boolean;
  row_limit: number;
  statement_timeout_seconds: number;
  cache_timeout_seconds: number;
  is_system: boolean;
  ai_allowed_schemas: string[];
  ai_allowed_tables: string[];
  has_encrypted_password?: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
}

export interface UploadPreviewColumn {
  name: string;
  type: string;
  original_name: string;
}

export interface UploadPreviewResponse {
  filename: string;
  format: string;
  size_bytes: number;
  suggested_table_name: string;
  columns: UploadPreviewColumn[];
  preview_rows: Record<string, any>[];
  preview_count: number;
}

export interface UploadedFileItem {
  id: string;
  filename: string;
  original_name: string;
  file_format: string;
  file_size_bytes: number;
  table_name: string;
  total_rows?: number;
  total_columns?: number;
  status: string;
  created_at: string;
}

export interface DatasetColumn {
  id: string;
  column_name: string;
  data_type: string;
  verbose_name?: string;
  description?: string;
  is_dimension: boolean;
  is_datetime: boolean;
  is_filterable: boolean;
  is_groupable: boolean;
  is_hidden_from_ai: boolean;
}

export interface DatasetMetric {
  id: string;
  metric_name: string;
  verbose_name?: string;
  metric_type: string;
  sql_expression: string;
  number_format?: string;
  description?: string;
}

export interface DatasetItem {
  id: string;
  name: string;
  description?: string;
  database_id: string;
  schema_name?: string;
  table_name?: string;
  is_virtual: boolean;
  sql_query?: string;
  is_active: boolean;
  is_ai_enabled: boolean;
  columns: DatasetColumn[];
  metrics: DatasetMetric[];
  created_at: string;
}

export interface ChartItem {
  id: string;
  title: string;
  description?: string;
  dataset_id: string;
  viz_type: string;
  params: Record<string, any>;
  query_context: Record<string, any>;
  owners: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ChartDataResponse {
  columns: string[];
  column_types: string[];
  rows: any[][];
  row_count: number;
  sql: string;
  duration_ms: number;
}

export interface SqlQueryResult {
  columns: string[];
  column_types: string[];
  rows: any[][];
  row_count: number;
  duration_ms: number;
  sql: string;
  truncated: boolean;
  cached: boolean;
}

export interface QueryHistoryItem {
  id: string;
  database_id: string;
  sql: string;
  status: string;
  row_count?: number;
  execution_duration_ms?: number;
  error_message?: string;
  triggered_from: string;
  created_at: string;
}

export interface SavedQueryItem {
  id: string;
  database_id: string;
  title: string;
  description?: string;
  sql: string;
  created_at: string;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.detail || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Databases
  getDatabases: () => request<DatabaseConnection[]>("/api/v1/databases/"),
  createDatabase: (data: any) =>
    request<DatabaseConnection>("/api/v1/databases/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDatabase: (id: string, data: any) =>
    request<DatabaseConnection>(`/api/v1/databases/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteDatabase: (id: string) =>
    request<{ message: string }>(`/api/v1/databases/${id}`, {
      method: "DELETE",
    }),
  testDatabaseLive: (data: any) =>
    request<ConnectionTestResult>("/api/v1/databases/test", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  testDatabaseById: (id: string) =>
    request<ConnectionTestResult>(`/api/v1/databases/${id}/test`, {
      method: "POST",
    }),
  getDatabaseSchemas: (id: string) =>
    request<string[]>(`/api/v1/databases/${id}/schemas`),
  getDatabaseTables: (id: string, schema?: string) =>
    request<string[]>(
      `/api/v1/databases/${id}/tables${schema ? `?schema=${encodeURIComponent(schema)}` : ""}`
    ),
  getDatabaseColumns: (id: string, table: string, schema?: string) =>
    request<any[]>(
      `/api/v1/databases/${id}/tables/${encodeURIComponent(table)}/columns${schema ? `?schema=${encodeURIComponent(schema)}` : ""}`
    ),

  // Uploads
  previewUpload: (formData: FormData) =>
    request<UploadPreviewResponse>("/api/v1/uploads/preview", {
      method: "POST",
      body: formData,
    }),
  importUpload: (formData: FormData) =>
    request<{ message: string; dataset_id: string; table_name: string }>("/api/v1/uploads/import", {
      method: "POST",
      body: formData,
    }),
  getUploads: () => request<{ data: UploadedFileItem[] }>("/api/v1/uploads/"),
  deleteUpload: (id: string) =>
    request<{ message: string }>(`/api/v1/uploads/${id}`, {
      method: "DELETE",
    }),

  // Datasets
  getDatasets: () => request<DatasetItem[]>("/api/v1/datasets/"),
  getDataset: (id: string) => request<DatasetItem>(`/api/v1/datasets/${id}`),
  createDataset: (data: any) =>
    request<DatasetItem>("/api/v1/datasets/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteDataset: (id: string) =>
    request<{ message: string }>(`/api/v1/datasets/${id}`, {
      method: "DELETE",
    }),
  addDatasetMetric: (datasetId: string, metric: any) =>
    request<DatasetMetric>(`/api/v1/datasets/${datasetId}/metrics`, {
      method: "POST",
      body: JSON.stringify(metric),
    }),

  // SQL Lab
  executeSql: (data: { database_id: string; sql: string; limit?: number }) =>
    request<SqlQueryResult>("/api/v1/sqllab/execute", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSavedQueries: () => request<SavedQueryItem[]>("/api/v1/sqllab/saved-queries"),
  saveQuery: (data: { database_id: string; title: string; sql: string; description?: string }) =>
    request<SavedQueryItem>("/api/v1/sqllab/saved-queries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getQueryHistory: () => request<QueryHistoryItem[]>("/api/v1/sqllab/history"),

  // Charts
  getCharts: () => request<ChartItem[]>("/api/v1/charts/"),
  getChart: (id: string) => request<ChartItem>(`/api/v1/charts/${id}`),
  createChart: (data: any) =>
    request<ChartItem>("/api/v1/charts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateChart: (id: string, data: any) =>
    request<ChartItem>(`/api/v1/charts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteChart: (id: string) =>
    request<{ message: string }>(`/api/v1/charts/${id}`, {
      method: "DELETE",
    }),
  getChartData: (data: any) =>
    request<ChartDataResponse>("/api/v1/charts/data", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
