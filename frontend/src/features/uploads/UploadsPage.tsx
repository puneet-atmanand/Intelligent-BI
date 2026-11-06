import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  Database,
  RefreshCw,
  Table as TableIcon,
} from "lucide-react";
import { api, UploadPreviewResponse, UploadPreviewColumn } from "@/app/api";

const SQL_TYPES = ["VARCHAR", "BIGINT", "DOUBLE", "BOOLEAN", "TIMESTAMP"];

export const UploadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<UploadPreviewResponse | null>(null);
  const [tableName, setTableName] = useState("");
  const [conflictMode, setConflictMode] = useState<"replace" | "append" | "fail">("replace");
  const [columnTypeOverrides, setColumnTypeOverrides] = useState<Record<string, string>>({});
  const [importSuccess, setImportSuccess] = useState<{
    datasetId: string;
    tableName: string;
    message: string;
  } | null>(null);

  // List existing uploads
  const { data: uploadsData, isLoading: isLoadingUploads, refetch: refetchUploads } = useQuery({
    queryKey: ["uploads"],
    queryFn: api.getUploads,
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.previewUpload(formData);
    },
    onSuccess: (data) => {
      setPreviewData(data);
      setTableName(data.suggested_table_name);
      const initialTypes: Record<string, string> = {};
      data.columns.forEach((col: UploadPreviewColumn) => {
        initialTypes[col.name] = col.type;
      });
      setColumnTypeOverrides(initialTypes);
      setImportSuccess(null);
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error("No file selected.");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("table_name", tableName.trim());
      formData.append("conflict_mode", conflictMode);
      formData.append("column_types", JSON.stringify(columnTypeOverrides));
      return api.importUpload(formData);
    },
    onSuccess: (data) => {
      setImportSuccess({
        datasetId: data.dataset_id,
        tableName: data.table_name,
        message: data.message,
      });
      setPreviewData(null);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });

  // Delete upload mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUpload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      previewMutation.mutate(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      previewMutation.mutate(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const uploads = uploadsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">File Uploads</h1>
          <p className="text-sm text-slate-500">
            Drag-and-drop CSV, TSV, Excel, Parquet or JSON files directly into the internal analytical DuckDB database.
          </p>
        </div>
        <button
          onClick={() => refetchUploads()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingUploads ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Success Banner */}
      {importSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 text-sm">{importSuccess.message}</h3>
                <p className="text-xs text-green-700 mt-0.5">
                  Table <span className="font-mono font-bold">{importSuccess.tableName}</span> is now queryable via SQL Lab, Chart Explore, and natural-language AI.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/sqllab")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-800 bg-green-100 hover:bg-green-200 rounded-md transition"
              >
                Open in SQL Lab
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate("/charts")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-700 hover:bg-green-800 rounded-md transition"
              >
                Build Chart
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Drag and Drop Area */}
      {!previewData && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition text-center group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv,.tsv,.xlsx,.xls,.parquet,.json,.jsonl"
            className="hidden"
          />
          <div className="p-4 bg-blue-50 group-hover:bg-blue-100 rounded-full text-blue-600 transition mb-3">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {previewMutation.isPending ? "Parsing and inferring schema..." : "Click or drag file to upload"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Supported formats: CSV, TSV, Excel (.xlsx), Parquet, and JSON/JSONL up to 200 MB.
          </p>
          {previewMutation.isError && (
            <div className="mt-3 text-xs text-red-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {(previewMutation.error as any).message || "Failed to parse file preview."}
            </div>
          )}
        </div>
      )}

      {/* File Preview and Configuration Wizard */}
      {previewData && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                Configure Import: {previewData.filename}
              </h2>
              <p className="text-xs text-slate-500">
                Format: <span className="font-bold uppercase text-slate-700">{previewData.format}</span> • Size: {(previewData.size_bytes / (1024 * 1024)).toFixed(2)} MB • Previewing first {previewData.preview_count} rows
              </p>
            </div>
            <button
              onClick={() => {
                setPreviewData(null);
                setSelectedFile(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Cancel and pick another file
            </button>
          </div>

          {/* Form Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target DuckDB Table Name *
              </label>
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="table_name"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Sanitized SQL identifier. Will be automatically created in DuckDB.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Conflict Resolution Mode
              </label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="conflict"
                    checked={conflictMode === "replace"}
                    onChange={() => setConflictMode("replace")}
                  />
                  Replace Existing Table
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="conflict"
                    checked={conflictMode === "append"}
                    onChange={() => setConflictMode("append")}
                  />
                  Append Rows
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="conflict"
                    checked={conflictMode === "fail"}
                    onChange={() => setConflictMode("fail")}
                  />
                  Fail if Exists
                </label>
              </div>
            </div>
          </div>

          {/* Inferred Column Types Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Inferred Column Schema & Data Types ({previewData.columns.length} columns)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">Column Identifier</th>
                    <th className="px-3 py-2">Original Header</th>
                    <th className="px-3 py-2">Data Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewData.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-slate-800">
                        {col.name}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {col.original_name}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={columnTypeOverrides[col.name] || col.type}
                          onChange={(e) =>
                            setColumnTypeOverrides({
                              ...columnTypeOverrides,
                              [col.name]: e.target.value,
                            })
                          }
                          className="px-2 py-1 text-xs border border-slate-300 rounded font-mono bg-white focus:ring-1 focus:ring-blue-500"
                        >
                          {SQL_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Preview Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              First 10 Rows Sample Preview
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-60">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-600 sticky top-0 font-mono">
                  <tr>
                    {previewData.columns.map((col) => (
                      <th key={col.name} className="px-3 py-2 whitespace-nowrap">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewData.preview_rows.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 font-mono text-[11px]">
                      {previewData.columns.map((col) => (
                        <td key={col.name} className="px-3 py-1.5 whitespace-nowrap text-slate-700">
                          {row[col.name] !== null && row[col.name] !== undefined
                            ? String(row[col.name])
                            : <span className="text-slate-300 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-slate-400" />
              Target storage: <span className="font-mono font-medium text-slate-700">askyourdata.duckdb (Uploads)</span>
            </div>
            <button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || !tableName.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md shadow-sm transition"
            >
              {importMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing into DuckDB...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Confirm & Ingest Table
                </>
              )}
            </button>
          </div>

          {importMutation.isError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {(importMutation.error as any).message || "Failed to import table."}
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TableIcon className="w-5 h-5 text-slate-600" />
          Ingested File Tables ({uploads.length})
        </h2>

        {uploads.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No files uploaded yet. Drag and drop a CSV, Excel or Parquet file above to ingest.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Target Table</th>
                  <th className="px-4 py-2.5">Original File</th>
                  <th className="px-4 py-2.5">Format</th>
                  <th className="px-4 py-2.5">Size</th>
                  <th className="px-4 py-2.5">Total Rows</th>
                  <th className="px-4 py-2.5">Uploaded</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploads.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900 flex items-center gap-2">
                      <TableIcon className="w-3.5 h-3.5 text-blue-600" />
                      {u.table_name}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 truncate max-w-[200px]">
                      {u.original_name}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-slate-100 text-slate-700 rounded">
                        {u.file_format}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {(u.file_size_bytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-800">
                      {u.total_rows ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate("/sqllab")}
                          className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          Query
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Drop table '${u.table_name}' and delete upload record?`)) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                          title="Delete file & drop table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadsPage;
