import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Plus,
  Play,
  Save,
  Trash2,
  Edit2,
  RefreshCw,
  ChevronLeft,
  Clock,
} from "lucide-react";
import { api, ChartItem, ChartDataResponse } from "@/app/api";
import { chartRegistry, ChartPlugin } from "@/charts";

export const ChartsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode: "list" or "explore"
  const [mode, setMode] = useState<"list" | "explore">("list");
  const [editingChartId, setEditingChartId] = useState<string | null>(null);

  // Queries
  const { data: charts = [], isLoading: isLoadingCharts, refetch: refetchCharts } = useQuery({
    queryKey: ["charts"],
    queryFn: api.getCharts,
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ["datasets"],
    queryFn: api.getDatasets,
  });

  const chartList = Array.isArray(charts) ? charts : (charts as any)?.data || [];
  const datasetList = Array.isArray(datasets) ? datasets : (datasets as any)?.data || [];

  // Explore Builder State
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("");
  const [selectedVizType, setSelectedVizType] = useState<string>("bar");
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<any[]>([]);
  const [timeColumn, setTimeColumn] = useState<string>("");
  const [timeGrain, setTimeGrain] = useState<string>("month");
  const [chartOptions, setChartOptions] = useState<Record<string, any>>({});
  const [rowLimit, setRowLimit] = useState<number>(100);

  // Filters state
  const [filters, setFilters] = useState<any[]>([]);
  const [newFilterCol, setNewFilterCol] = useState<string>("");
  const [newFilterOp, setNewFilterOp] = useState<string>("==");
  const [newFilterVal, setNewFilterVal] = useState<string>("");

  // Query Result & View State
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<"chart" | "data" | "sql">("chart");
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartDescription, setChartDescription] = useState("");

  // Handle URL param ?dataset=...
  useEffect(() => {
    const datasetParam = searchParams.get("dataset");
    if (datasetParam) {
      setSelectedDatasetId(datasetParam);
      setMode("explore");
    }
  }, [searchParams]);

  // Handle default dataset and initial selections
  const currentDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  useEffect(() => {
    if (datasets.length > 0 && !selectedDatasetId) {
      setSelectedDatasetId(datasets[0].id);
    }
  }, [datasets, selectedDatasetId]);

  useEffect(() => {
    if (currentDataset) {
      // Pick first dimension column
      const dimCol = currentDataset.columns.find((c) => c.is_dimension && !c.is_datetime);
      if (dimCol && !selectedDimension) {
        setSelectedDimension(dimCol.column_name);
        setSelectedDimensions([dimCol.column_name]);
      }

      // Pick first datetime column
      const dtCol = currentDataset.columns.find((c) => c.is_datetime);
      if (dtCol && !timeColumn) {
        setTimeColumn(dtCol.column_name);
      }

      // Pick first metric
      if (selectedMetrics.length === 0) {
        if (currentDataset.metrics && currentDataset.metrics.length > 0) {
          const firstM = currentDataset.metrics[0];
          setSelectedMetrics([
            {
              name: firstM.metric_name,
              label: firstM.verbose_name || firstM.metric_name,
              expression: firstM.sql_expression,
            },
          ]);
        } else {
          // Default COUNT(*)
          setSelectedMetrics([{ name: "count", label: "Count of Rows", expression: "COUNT(*)" }]);
        }
      }
    }
  }, [currentDataset]);

  // Execute chart query mutation
  const runQueryMutation = useMutation({
    mutationFn: () => {
      if (!selectedDatasetId) throw new Error("Please select a dataset.");
      const plugin = chartRegistry.get(selectedVizType);
      const isMultiDim = plugin?.controlPanel.dimensions.multi;

      const payload = {
        dataset_id: selectedDatasetId,
        viz_type: selectedVizType,
        dimensions: isMultiDim ? selectedDimensions : selectedDimension ? [selectedDimension] : [],
        metrics: selectedMetrics,
        filters,
        time_column: timeColumn || undefined,
        time_grain: timeGrain || undefined,
        row_limit: rowLimit,
      };
      return api.getChartData(payload);
    },
    onSuccess: (data) => {
      setChartData(data);
    },
  });

  // Save chart mutation
  const saveChartMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: chartTitle.trim(),
        description: chartDescription.trim(),
        dataset_id: selectedDatasetId,
        viz_type: selectedVizType,
        params: {
          dimension: selectedDimension,
          dimensions: selectedDimensions,
          metrics: selectedMetrics,
          time_column: timeColumn,
          time_grain: timeGrain,
          options: chartOptions,
          filters,
          row_limit: rowLimit,
        },
      };

      if (editingChartId) {
        return api.updateChart(editingChartId, payload);
      } else {
        return api.createChart(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charts"] });
      setIsSaveModalOpen(false);
      setEditingChartId(null);
      setMode("list");
    },
  });

  // Delete chart mutation
  const deleteChartMutation = useMutation({
    mutationFn: (id: string) => api.deleteChart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charts"] });
    },
  });

  const handleOpenExplore = (chartToEdit?: ChartItem) => {
    if (chartToEdit) {
      setEditingChartId(chartToEdit.id);
      setChartTitle(chartToEdit.title);
      setChartDescription(chartToEdit.description || "");
      setSelectedDatasetId(chartToEdit.dataset_id);
      setSelectedVizType(chartToEdit.viz_type);
      const p = chartToEdit.params || {};
      setSelectedDimension(p.dimension || "");
      setSelectedDimensions(p.dimensions || []);
      setSelectedMetrics(p.metrics || []);
      setTimeColumn(p.time_column || "");
      setTimeGrain(p.time_grain || "month");
      setChartOptions(p.options || {});
      setFilters(p.filters || []);
      setRowLimit(p.row_limit || 100);
    } else {
      setEditingChartId(null);
      setChartTitle("New Chart");
      setChartDescription("");
    }
    setMode("explore");
  };

  const handleAddFilter = () => {
    if (!newFilterCol) return;
    setFilters([
      ...filters,
      { col: newFilterCol, op: newFilterOp, val: newFilterVal },
    ]);
    setNewFilterCol("");
    setNewFilterVal("");
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, idx) => idx !== index));
  };

  // Render chart using Plugin Registry
  const plugin: ChartPlugin | undefined = chartRegistry.get(selectedVizType);
  const chartProps =
    plugin && chartData ? plugin.transformProps(chartData, chartOptions) : null;

  return (
    <div className="space-y-6">
      {/* List Mode View */}
      {mode === "list" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Charts</h1>
              <p className="text-sm text-slate-500">
                Explore datasets and assemble visualizations with Apache ECharts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetchCharts()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingCharts ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => handleOpenExplore()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Create Chart
              </button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chartList.map((chart) => {
              const ds = datasetList.find((d) => d.id === chart.dataset_id);
              return (
                <div
                  key={chart.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">{chart.title}</h3>
                          <span className="inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 rounded mt-0.5">
                            {chart.viz_type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete chart '${chart.title}'?`)) {
                            deleteChartMutation.mutate(chart.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-600 transition p-1"
                        title="Delete chart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {chart.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{chart.description}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dataset:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">
                          {ds?.name || "Dataset"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span className="text-slate-600">
                          {chart.created_at ? new Date(chart.created_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenExplore(chart)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Explore / Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {charts.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No Charts Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore your connected datasets, choose from Tier 1 Apache ECharts visualizations, and save charts to assemble dashboards.
              </p>
              <button
                onClick={() => handleOpenExplore()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Build Your First Chart
              </button>
            </div>
          )}
        </div>
      )}

      {/* Explore Mode View */}
      {mode === "explore" && (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-slate-50">
          {/* Top Navbar */}
          <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setMode("list");
                  setSearchParams({});
                }}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Charts
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  {chartTitle || "Explore Chart"}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Dataset: {currentDataset?.name || "None"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runQueryMutation.mutate()}
                disabled={runQueryMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded shadow-sm transition"
              >
                {runQueryMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Running Query...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Query
                  </>
                )}
              </button>

              <button
                onClick={() => setIsSaveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-sm transition"
              >
                <Save className="w-3.5 h-3.5" />
                Save Chart
              </button>
            </div>
          </div>

          {/* Main Explore Layout: Controls Sidebar on Left, Visualization on Right */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Controls Sidebar */}
            <div className="w-80 border-r border-slate-200 bg-white overflow-y-auto p-4 space-y-5 flex-shrink-0">
              {/* Dataset Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Dataset
                </label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => {
                    setSelectedDatasetId(e.target.value);
                    setChartData(null);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {datasetList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.table_name || "Virtual"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chart Type Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Visualization Type
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {chartRegistry.getAllMetadata().map((meta) => (
                    <button
                      key={meta.id}
                      onClick={() => setSelectedVizType(meta.id)}
                      className={`px-2.5 py-2 text-left text-xs rounded border transition flex flex-col justify-between ${
                        selectedVizType === meta.id
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 font-medium ring-1 ring-blue-500"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-semibold">{meta.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{meta.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Dimension */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Time Grain & Column
                </label>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Time Column</label>
                  <select
                    value={timeColumn}
                    onChange={(e) => setTimeColumn(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="">None (Categorical)</option>
                    {currentDataset?.columns.map((c) => (
                      <option key={c.column_name} value={c.column_name}>
                        {c.column_name} ({c.data_type})
                      </option>
                    ))}
                  </select>
                </div>

                {timeColumn && (
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Time Grain</label>
                    <select
                      value={timeGrain}
                      onChange={(e) => setTimeGrain(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="quarter">Quarter</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Dimensions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Dimensions (Group By)
                </label>
                {plugin?.controlPanel.dimensions.multi ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 p-2 rounded">
                    {currentDataset?.columns.map((c) => (
                      <label key={c.column_name} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDimensions.includes(c.column_name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDimensions([...selectedDimensions, c.column_name]);
                            } else {
                              setSelectedDimensions(selectedDimensions.filter((dim) => dim !== c.column_name));
                            }
                          }}
                        />
                        <span className="font-mono text-[11px]">{c.column_name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <select
                    value={selectedDimension}
                    onChange={(e) => setSelectedDimension(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="">None</option>
                    {currentDataset?.columns.map((c) => (
                      <option key={c.column_name} value={c.column_name}>
                        {c.column_name} ({c.data_type})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Metrics */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Metrics
                </label>
                <div className="space-y-1.5 border border-slate-200 p-2 rounded max-h-36 overflow-y-auto">
                  {currentDataset?.metrics?.map((m) => {
                    const isSelected = selectedMetrics.some((sm) => sm.name === m.metric_name);
                    return (
                      <label key={m.metric_name} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMetrics([
                                ...selectedMetrics,
                                {
                                  name: m.metric_name,
                                  label: m.verbose_name || m.metric_name,
                                  expression: m.sql_expression,
                                },
                              ]);
                            } else {
                              setSelectedMetrics(selectedMetrics.filter((sm) => sm.name !== m.metric_name));
                            }
                          }}
                        />
                        <span className="font-semibold text-blue-900">{m.verbose_name || m.metric_name}</span>
                      </label>
                    );
                  })}
                  {(!currentDataset?.metrics || currentDataset.metrics.length === 0) && (
                    <div className="text-[11px] text-slate-400">No saved metrics in dataset.</div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ad-hoc Filters ({filters.length})
                </label>
                <div className="space-y-1">
                  {filters.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-100 p-1.5 rounded font-mono">
                      <span>
                        {f.col} {f.op} {String(f.val)}
                      </span>
                      <button
                        onClick={() => handleRemoveFilter(idx)}
                        className="text-slate-400 hover:text-red-600 text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 pt-1">
                  <select
                    value={newFilterCol}
                    onChange={(e) => setNewFilterCol(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option value="">Select column to filter...</option>
                    {currentDataset?.columns.map((c) => (
                      <option key={c.column_name} value={c.column_name}>
                        {c.column_name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <select
                      value={newFilterOp}
                      onChange={(e) => setNewFilterOp(e.target.value)}
                      className="w-20 px-1 py-1 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="==">=</option>
                      <option value="!=">!=</option>
                      <option value=">">&gt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<">&lt;</option>
                      <option value="<=">&lt;=</option>
                      <option value="LIKE">LIKE</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Value"
                      value={newFilterVal}
                      onChange={(e) => setNewFilterVal(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={handleAddFilter}
                      disabled={!newFilterCol}
                      className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Specific Options */}
              {plugin?.controlPanel.options && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Chart Customization
                  </label>
                  {Object.entries(plugin.controlPanel.options).map(([optKey, optConfig]: [string, any]) => (
                    <div key={optKey} className="text-xs">
                      {optConfig.type === "boolean" && (
                        <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            checked={chartOptions[optKey] ?? optConfig.default}
                            onChange={(e) =>
                              setChartOptions({ ...chartOptions, [optKey]: e.target.checked })
                            }
                          />
                          <span>{optConfig.label}</span>
                        </label>
                      )}
                      {optConfig.type === "select" && (
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">
                            {optConfig.label}
                          </label>
                          <select
                            value={chartOptions[optKey] ?? optConfig.default}
                            onChange={(e) =>
                              setChartOptions({ ...chartOptions, [optKey]: e.target.value })
                            }
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                          >
                            {optConfig.options.map((o: string) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Canvas / Work Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Tabs: Chart / Data / SQL */}
              <div className="px-4 pt-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveViewTab("chart")}
                    className={`pb-2 text-xs font-semibold border-b-2 transition ${
                      activeViewTab === "chart"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Visualization
                  </button>
                  <button
                    onClick={() => setActiveViewTab("data")}
                    className={`pb-2 text-xs font-semibold border-b-2 transition ${
                      activeViewTab === "data"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Data Preview ({chartData?.row_count ?? 0})
                  </button>
                  <button
                    onClick={() => setActiveViewTab("sql")}
                    className={`pb-2 text-xs font-semibold border-b-2 transition ${
                      activeViewTab === "sql"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Generated SQL
                  </button>
                </div>

                {chartData && (
                  <div className="flex items-center gap-2 pb-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{chartData.duration_ms} ms</span>
                  </div>
                )}
              </div>

              {/* View Content */}
              <div className="flex-1 overflow-auto p-4 flex flex-col justify-center">
                {activeViewTab === "chart" && (
                  <div className="h-full w-full flex flex-col justify-center">
                    {plugin && chartProps ? (
                      <plugin.Renderer {...chartProps} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16">
                        <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                        Configure your dimensions & metrics on the left, then click "Run Query" to render.
                      </div>
                    )}
                  </div>
                )}

                {activeViewTab === "data" && (
                  <div className="h-full overflow-auto border border-slate-200 rounded-lg">
                    {chartData && chartData.rows.length > 0 ? (
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold">
                          <tr>
                            {chartData.columns.map((col) => (
                              <th key={col} className="px-3 py-2 whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {chartData.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {row.map((val, cIdx) => (
                                <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-800">
                                  {val !== null && val !== undefined ? String(val) : "null"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No query results to display. Click "Run Query".
                      </div>
                    )}
                  </div>
                )}

                {activeViewTab === "sql" && (
                  <div className="h-full overflow-auto bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs">
                    {chartData?.sql ? (
                      <pre className="whitespace-pre-wrap">{chartData.sql}</pre>
                    ) : (
                      <div className="text-slate-500">Run query to view generated dialect SQL.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Chart Modal */}
          {isSaveModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900">
                  {editingChartId ? "Update Chart" : "Save Chart"}
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Chart Title *
                  </label>
                  <input
                    type="text"
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="e.g. Regional Revenue Breakdown"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={chartDescription}
                    onChange={(e) => setChartDescription(e.target.value)}
                    placeholder="Optional notes or insights"
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveChartMutation.mutate()}
                    disabled={!chartTitle.trim() || saveChartMutation.isPending}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm disabled:opacity-50"
                  >
                    {saveChartMutation.isPending ? "Saving..." : "Save Chart"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ChartsPage;
