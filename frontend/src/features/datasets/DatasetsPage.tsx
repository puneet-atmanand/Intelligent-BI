import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Plus,
  Search,
  BarChart3,
  Trash2,
  Calendar,
  Sparkles,
  RefreshCw,
  Check,
} from "lucide-react";
import { api, DatasetItem } from "@/app/api";

export const DatasetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<DatasetItem | null>(null);
  const [activeTab, setActiveTab] = useState<"columns" | "metrics">("columns");

  // New metric form state
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [metricForm, setMetricForm] = useState({
    metric_name: "",
    verbose_name: "",
    metric_type: "aggregate",
    sql_expression: "SUM(amount)",
    number_format: "$,.2f",
    description: "",
  });

  // Query datasets
  const { data: datasets = [], isLoading, refetch } = useQuery({
    queryKey: ["datasets"],
    queryFn: api.getDatasets,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteDataset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      if (selectedDataset) setSelectedDataset(null);
    },
  });

  // Add metric mutation
  const addMetricMutation = useMutation({
    mutationFn: (metric: any) => {
      if (!selectedDataset) throw new Error("No dataset selected");
      return api.addDatasetMetric(selectedDataset.id, metric);
    },
    onSuccess: (newMetric) => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      if (selectedDataset) {
        setSelectedDataset({
          ...selectedDataset,
          metrics: [...(selectedDataset.metrics || []), newMetric],
        });
      }
      setIsAddingMetric(false);
      setMetricForm({
        metric_name: "",
        verbose_name: "",
        metric_type: "aggregate",
        sql_expression: "SUM(amount)",
        number_format: "$,.2f",
        description: "",
      });
    },
  });

  const handleCreateMetric = (e: React.FormEvent) => {
    e.preventDefault();
    addMetricMutation.mutate(metricForm);
  };

  const filteredDatasets = datasets.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.table_name && d.table_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Datasets</h1>
          <p className="text-sm text-slate-500">
            Semantic layer defining physical tables, virtual queries, dimensions, metrics, and AI permissions.
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
            onClick={() => navigate("/sqllab")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Virtual Dataset
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search datasets by name or table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filteredDatasets.length} of {datasets.length} datasets
        </div>
      </div>

      {/* Datasets Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Dataset Name</th>
              <th className="px-4 py-3">Source Table / Query</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Columns</th>
              <th className="px-4 py-3">Metrics</th>
              <th className="px-4 py-3">AI Allowed</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDatasets.map((dataset) => (
              <tr key={dataset.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <button
                    onClick={() => setSelectedDataset(dataset)}
                    className="hover:text-blue-600 text-left font-semibold flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{dataset.name}</span>
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-slate-600">
                  {dataset.is_virtual ? "Virtual SQL" : dataset.table_name || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      dataset.is_virtual
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {dataset.is_virtual ? "Virtual" : "Physical"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-700">
                  {dataset.columns?.length || 0}
                </td>
                <td className="px-4 py-3 font-mono text-slate-700">
                  {dataset.metrics?.length || 0}
                </td>
                <td className="px-4 py-3">
                  {dataset.is_ai_enabled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium">
                      <Sparkles className="w-3 h-3 text-green-600" />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Disabled</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedDataset(dataset)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded transition"
                    >
                      Detail
                    </button>
                    <button
                      onClick={() => navigate(`/charts?dataset=${dataset.id}`)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition flex items-center gap-1"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      Explore
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete dataset '${dataset.name}'?`)) {
                          deleteMutation.mutate(dataset.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                      title="Delete dataset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDatasets.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-xs">
                  No datasets found. Import a file or register a table in SQL Lab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dataset Detail Drawer / Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  Dataset: {selectedDataset.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Target: {selectedDataset.table_name || "Virtual SQL"} • Schema: {selectedDataset.schema_name || "main"}
                </p>
              </div>
              <button
                onClick={() => setSelectedDataset(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab("columns")}
                  className={`pb-2 text-xs font-semibold border-b-2 transition ${
                    activeTab === "columns"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Columns ({selectedDataset.columns?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("metrics")}
                  className={`pb-2 text-xs font-semibold border-b-2 transition ${
                    activeTab === "metrics"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Custom Metrics ({selectedDataset.metrics?.length || 0})
                </button>
              </div>

              {activeTab === "metrics" && (
                <button
                  onClick={() => setIsAddingMetric(true)}
                  className="mb-2 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Metric
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "columns" && (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <tr>
                        <th className="px-3 py-2">Column</th>
                        <th className="px-3 py-2">Data Type</th>
                        <th className="px-3 py-2">Datetime</th>
                        <th className="px-3 py-2">Filterable</th>
                        <th className="px-3 py-2">Groupable</th>
                        <th className="px-3 py-2">Hidden from AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDataset.columns?.map((col) => (
                        <tr key={col.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-medium text-slate-800">
                            {col.column_name}
                          </td>
                          <td className="px-3 py-2 text-slate-600 font-mono">{col.data_type}</td>
                          <td className="px-3 py-2">
                            {col.is_datetime ? (
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {col.is_filterable ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {col.is_groupable ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {col.is_hidden_from_ai ? (
                              <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 font-bold rounded">
                                Hidden
                              </span>
                            ) : (
                              <span className="text-green-600">Visible</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "metrics" && (
                <div className="space-y-4">
                  {isAddingMetric && (
                    <form
                      onSubmit={handleCreateMetric}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3"
                    >
                      <h4 className="text-xs font-bold text-blue-900 uppercase">
                        Define SQL Aggregate Metric
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-blue-800 mb-1">
                            Metric Identifier *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. total_revenue"
                            value={metricForm.metric_name}
                            onChange={(e) =>
                              setMetricForm({ ...metricForm, metric_name: e.target.value })
                            }
                            className="w-full px-2.5 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-blue-800 mb-1">
                            Display Label
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Total Revenue ($)"
                            value={metricForm.verbose_name}
                            onChange={(e) =>
                              setMetricForm({ ...metricForm, verbose_name: e.target.value })
                            }
                            className="w-full px-2.5 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[11px] font-medium text-blue-800 mb-1">
                            SQL Expression *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. SUM(amount * quantity)"
                            value={metricForm.sql_expression}
                            onChange={(e) =>
                              setMetricForm({ ...metricForm, sql_expression: e.target.value })
                            }
                            className="w-full px-2.5 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-blue-800 mb-1">
                            Format String
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. $,0.2f"
                            value={metricForm.number_format}
                            onChange={(e) =>
                              setMetricForm({ ...metricForm, number_format: e.target.value })
                            }
                            className="w-full px-2.5 py-1 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingMetric(false)}
                          className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addMetricMutation.isPending}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm"
                        >
                          {addMetricMutation.isPending ? "Saving..." : "Save Metric"}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2">Metric Name</th>
                          <th className="px-3 py-2">SQL Expression</th>
                          <th className="px-3 py-2">Format</th>
                          <th className="px-3 py-2">Verbose Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDataset.metrics?.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono font-medium text-slate-800">
                              {m.metric_name}
                            </td>
                            <td className="px-3 py-2 font-mono text-blue-700">
                              {m.sql_expression}
                            </td>
                            <td className="px-3 py-2 font-mono text-slate-600">
                              {m.number_format || "—"}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {m.verbose_name || "—"}
                            </td>
                          </tr>
                        ))}
                        {(!selectedDataset.metrics || selectedDataset.metrics.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-3 py-6 text-center text-slate-400 text-xs">
                              No metrics defined yet. Click "Add Metric" to define calculated aggregates.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm(`Delete dataset '${selectedDataset.name}'?`)) {
                    deleteMutation.mutate(selectedDataset.id);
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Dataset
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/charts?dataset=${selectedDataset.id}`)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition flex items-center gap-1.5 shadow-sm"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Explore in Chart Builder
                </button>
                <button
                  onClick={() => setSelectedDataset(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DatasetsPage;
