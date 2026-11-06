import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
  Layers,
  Table,
} from "lucide-react";
import { api, DatabaseConnection, ConnectionTestResult } from "@/app/api";

const DIALECTS = [
  { value: "postgresql", label: "PostgreSQL", defaultPort: 5432 },
  { value: "mysql", label: "MySQL / MariaDB", defaultPort: 3306 },
  { value: "sqlite", label: "SQLite", defaultPort: null },
  { value: "duckdb", label: "DuckDB (Embedded)", defaultPort: null },
  { value: "clickhouse", label: "ClickHouse", defaultPort: 8123 },
  { value: "mssql", label: "Microsoft SQL Server", defaultPort: 1433 },
];

export const DatabasesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // Schema browser state
  const [browserDb, setBrowserDb] = useState<DatabaseConnection | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<string>("main");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dialect: "postgresql",
    host: "localhost",
    port: 5432,
    database_name: "",
    username: "",
    password: "",
    raw_uri: "",
    use_raw_uri: false,
    ssl_mode: "prefer",
    allow_dml: false,
    allow_file_uploads: false,
    allow_sqllab: true,
    row_limit: 10000,
    statement_timeout_seconds: 30,
    cache_timeout_seconds: 300,
  });

  const [formTestStatus, setFormTestStatus] = useState<ConnectionTestResult | null>(null);
  const [isTestingForm, setIsTestingForm] = useState(false);

  // Query databases
  const { data: databases = [], isLoading, refetch } = useQuery({
    queryKey: ["databases"],
    queryFn: api.getDatabases,
  });

  // Query schemas for browserDb
  const { data: schemas = [] } = useQuery({
    queryKey: ["schemas", browserDb?.id],
    queryFn: () => (browserDb ? api.getDatabaseSchemas(browserDb.id) : Promise.resolve([])),
    enabled: Boolean(browserDb),
  });

  // Query tables for selectedSchema
  const { data: tables = [] } = useQuery({
    queryKey: ["tables", browserDb?.id, selectedSchema],
    queryFn: () =>
      browserDb ? api.getDatabaseTables(browserDb.id, selectedSchema) : Promise.resolve([]),
    enabled: Boolean(browserDb),
  });

  // Query columns for selectedTable
  const { data: columns = [] } = useQuery({
    queryKey: ["columns", browserDb?.id, selectedSchema, selectedTable],
    queryFn: () =>
      browserDb && selectedTable
        ? api.getDatabaseColumns(browserDb.id, selectedTable, selectedSchema)
        : Promise.resolve([]),
    enabled: Boolean(browserDb && selectedTable),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createDatabase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDatabase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      dialect: "postgresql",
      host: "localhost",
      port: 5432,
      database_name: "",
      username: "",
      password: "",
      raw_uri: "",
      use_raw_uri: false,
      ssl_mode: "prefer",
      allow_dml: false,
      allow_file_uploads: false,
      allow_sqllab: true,
      row_limit: 10000,
      statement_timeout_seconds: 30,
      cache_timeout_seconds: 300,
    });
    setFormTestStatus(null);
  };

  const handleDialectChange = (dialect: string) => {
    const selected = DIALECTS.find((d) => d.value === dialect);
    setFormData((prev) => ({
      ...prev,
      dialect,
      port: selected?.defaultPort ?? 5432,
    }));
  };

  const handleTestDatabase = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await api.testDatabaseById(id);
      setTestResult({ id, success: res.success, message: res.message });
    } catch (err: any) {
      setTestResult({ id, success: false, message: err.message || "Connection failed" });
    } finally {
      setTestingId(null);
    }
  };

  const handleTestFormData = async () => {
    setIsTestingForm(true);
    setFormTestStatus(null);
    try {
      const payload: any = {
        name: formData.name || "Test Connection",
        dialect: formData.dialect,
        ssl_mode: formData.ssl_mode,
        allow_dml: formData.allow_dml,
        allow_file_uploads: formData.allow_file_uploads,
        allow_sqllab: formData.allow_sqllab,
        row_limit: formData.row_limit,
        statement_timeout_seconds: formData.statement_timeout_seconds,
        cache_timeout_seconds: formData.cache_timeout_seconds,
      };

      if (formData.use_raw_uri) {
        payload.raw_uri = formData.raw_uri;
      } else {
        payload.host = formData.host;
        payload.port = formData.port;
        payload.database_name = formData.database_name;
        payload.username = formData.username;
        payload.password = formData.password;
      }

      const res = await api.testDatabaseLive(payload);
      setFormTestStatus(res);
    } catch (err: any) {
      setFormTestStatus({ success: false, message: err.message || "Connection test failed." });
    } finally {
      setIsTestingForm(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: formData.name,
      description: formData.description,
      dialect: formData.dialect,
      ssl_mode: formData.ssl_mode,
      allow_dml: formData.allow_dml,
      allow_file_uploads: formData.allow_file_uploads,
      allow_sqllab: formData.allow_sqllab,
      row_limit: formData.row_limit,
      statement_timeout_seconds: formData.statement_timeout_seconds,
      cache_timeout_seconds: formData.cache_timeout_seconds,
    };

    if (formData.use_raw_uri) {
      payload.raw_uri = formData.raw_uri;
    } else {
      payload.host = formData.host;
      payload.port = formData.port;
      payload.database_name = formData.database_name;
      payload.username = formData.username;
      payload.password = formData.password;
    }

    createMutation.mutate(payload);
  };

  const filteredDbs = databases.filter(
    (db) =>
      db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      db.dialect.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Database Connections</h1>
          <p className="text-sm text-slate-500">
            Connect your relational, analytical or embedded databases with encrypted credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Connection
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Filter connections by name or dialect..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="text-xs text-slate-500">
          Showing {filteredDbs.length} of {databases.length} connections
        </div>
      </div>

      {/* Database Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDbs.map((db) => {
          const isTesting = testingId === db.id;
          const result = testResult?.id === db.id ? testResult : null;

          return (
            <div
              key={db.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {db.name}
                        {db.is_system && (
                          <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-purple-100 text-purple-700 rounded">
                            System
                          </span>
                        )}
                      </h3>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded mt-0.5">
                        {db.dialect.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {!db.is_system && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete connection '${db.name}'?`)) {
                          deleteMutation.mutate(db.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 transition p-1"
                      title="Delete connection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {db.description && (
                  <p className="text-xs text-slate-500 mt-3 line-clamp-2">{db.description}</p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Endpoint:</span>
                    <span className="font-mono text-slate-700 truncate max-w-[200px]">
                      {db.host ? `${db.host}:${db.port || ""}` : "Embedded Local"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Database:</span>
                    <span className="font-mono text-slate-700">{db.database_name || "default"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SQL Lab:</span>
                    <span className={db.allow_sqllab ? "text-green-600 font-medium" : "text-slate-400"}>
                      {db.allow_sqllab ? "Allowed" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploads Target:</span>
                    <span className={db.allow_file_uploads ? "text-green-600 font-medium" : "text-slate-400"}>
                      {db.allow_file_uploads ? "Allowed" : "Disabled"}
                    </span>
                  </div>
                </div>

                {result && (
                  <div
                    className={`mt-3 p-2.5 rounded text-xs flex items-center gap-2 ${
                      result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {result.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{result.message}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTestDatabase(db.id)}
                  disabled={isTesting}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                  {isTesting ? "Testing..." : "Test Connection"}
                </button>

                <button
                  onClick={() => {
                    setBrowserDb(db);
                    setSelectedSchema("main");
                    setSelectedTable(null);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded flex items-center gap-1 transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Explore Schema
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schema Browser Modal */}
      {browserDb && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Schema Browser: {browserDb.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Inspect database schemas, tables, and column data types
                </p>
              </div>
              <button
                onClick={() => setBrowserDb(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Schemas & Tables */}
              <div className="w-1/3 border-r border-slate-200 p-4 overflow-y-auto space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Schema
                  </label>
                  <select
                    value={selectedSchema}
                    onChange={(e) => {
                      setSelectedSchema(e.target.value);
                      setSelectedTable(null);
                    }}
                    className="w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {schemas.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Tables ({tables.length})
                  </label>
                  <div className="space-y-1">
                    {tables.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTable(t)}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center gap-2 transition ${
                          selectedTable === t
                            ? "bg-blue-600 text-white font-medium"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span className="truncate">{t}</span>
                      </button>
                    ))}
                    {tables.length === 0 && (
                      <div className="text-xs text-slate-400 py-3 text-center">
                        No tables found in this schema.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Column Metadata */}
              <div className="flex-1 p-5 overflow-y-auto">
                {selectedTable ? (
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-600" />
                      Columns in <span className="font-mono text-blue-700">{selectedTable}</span>
                    </h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                          <tr>
                            <th className="px-3 py-2">Column Name</th>
                            <th className="px-3 py-2">Data Type</th>
                            <th className="px-3 py-2">Nullable</th>
                            <th className="px-3 py-2">Primary Key</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {columns.map((col: any) => (
                            <tr key={col.name} className="hover:bg-slate-50">
                              <td className="px-3 py-2 font-mono font-medium text-slate-800">
                                {col.name}
                              </td>
                              <td className="px-3 py-2 text-slate-600 font-mono">
                                {col.data_type}
                              </td>
                              <td className="px-3 py-2 text-slate-500">
                                {col.nullable ? "Yes" : "No"}
                              </td>
                              <td className="px-3 py-2 text-slate-500">
                                {col.is_primary_key ? (
                                  <span className="text-amber-600 font-bold">PK</span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Table className="w-8 h-8 mb-2 opacity-50" />
                    Select a table on the left to inspect its column schema.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setBrowserDb(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Database Connection</h2>
                <p className="text-xs text-slate-500">
                  Credentials are encrypted at rest with AES-256 Fernet keys.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production Analytics"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Database Dialect *
                  </label>
                  <select
                    value={formData.dialect}
                    onChange={(e) => handleDialectChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {DIALECTS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional notes about this data source"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mode switch: Form vs URI */}
              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="uri_mode"
                    checked={!formData.use_raw_uri}
                    onChange={() => setFormData({ ...formData, use_raw_uri: false })}
                  />
                  Standard Host & Port
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="uri_mode"
                    checked={formData.use_raw_uri}
                    onChange={() => setFormData({ ...formData, use_raw_uri: true })}
                  />
                  Raw SQLAlchemy URI
                </label>
              </div>

              {formData.use_raw_uri ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SQLAlchemy Connection URI *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="postgresql://user:pass@host:5432/dbname"
                    value={formData.raw_uri}
                    onChange={(e) => setFormData({ ...formData, raw_uri: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Example: postgresql://readonly:secret@db.company.com:5432/warehouse
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Host *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. localhost or 10.0.0.1"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Port</label>
                    <input
                      type="number"
                      value={formData.port || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, port: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Database Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. analytics"
                      value={formData.database_name}
                      onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. read_only_user"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Password (encrypted)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Safety & Execution Settings */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Security & Limits
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_sqllab}
                      onChange={(e) => setFormData({ ...formData, allow_sqllab: e.target.checked })}
                    />
                    <span>Allow SQL Lab Execution</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_dml}
                      onChange={(e) => setFormData({ ...formData, allow_dml: e.target.checked })}
                    />
                    <span className="text-amber-700">Allow DML (Default: Off)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allow_file_uploads}
                      onChange={(e) =>
                        setFormData({ ...formData, allow_file_uploads: e.target.checked })
                      }
                    />
                    <span>Target for File Uploads</span>
                  </label>
                </div>
              </div>

              {formTestStatus && (
                <div
                  className={`p-3 rounded text-xs flex items-center gap-2 ${
                    formTestStatus.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {formTestStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{formTestStatus.message}</span>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleTestFormData}
                  disabled={isTestingForm}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingForm ? "animate-spin" : ""}`} />
                  {isTestingForm ? "Testing..." : "Test Connection"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition shadow-sm"
                  >
                    {createMutation.isPending ? "Saving..." : "Save Connection"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DatabasesPage;
