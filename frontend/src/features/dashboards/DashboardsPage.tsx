import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Layers,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  Filter,
  ExternalLink,
  Clock,
  LayoutGrid,
  BarChart3,
} from "lucide-react";
import { api, DashboardItem, ChartItem } from "@/app/api";
import { chartRegistry } from "@/charts";

// Single Chart Tile on the Dashboard
const DashboardChartTile: React.FC<{
  chartId: string;
  charts: ChartItem[];
  activeFilters: Record<string, any>;
  onRemove?: () => void;
  isEditMode?: boolean;
}> = ({ chartId, charts, activeFilters, onRemove, isEditMode }) => {
  const chart = charts.find((c) => c.id === chartId);
  const navigate = useNavigate();

  // Execute query for this specific chart with active dashboard filters applied
  const { data: chartData, isLoading, refetch } = useQuery({
    queryKey: ["chartData", chartId, activeFilters],
    queryFn: async () => {
      if (!chart) return null;
      const p = chart.params || {};

      // Merge chart-level filters with active dashboard filters
      const mergedFilters = [...(p.filters || [])];
      Object.entries(activeFilters).forEach(([col, val]) => {
        if (val && val !== "all") {
          mergedFilters.push({ col, op: "==", val });
        }
      });

      return api.getChartData({
        dataset_id: chart.dataset_id,
        viz_type: chart.viz_type,
        dimensions: p.dimensions || (p.dimension ? [p.dimension] : []),
        metrics: p.metrics || [],
        filters: mergedFilters,
        time_column: p.time_column,
        time_grain: p.time_grain,
        row_limit: p.row_limit || 200,
      });
    },
    enabled: Boolean(chart),
  });

  if (!chart) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4 bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
        Chart not found or deleted.
      </div>
    );
  }

  const plugin = chartRegistry.get(chart.viz_type);
  const chartProps = plugin && chartData ? plugin.transformProps(chartData, chart.params?.options) : null;

  return (
    <div className="h-full w-full flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Tile Header */}
      <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 truncate">
          <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <h3 className="font-semibold text-slate-900 text-xs truncate">{chart.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => refetch()}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
            title="Refresh chart"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => navigate(`/charts?dataset=${chart.dataset_id}`)}
            className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
            title="Explore in Chart Builder"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          {isEditMode && onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-slate-400 hover:text-red-600 rounded transition ml-1"
              title="Remove from dashboard"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tile Canvas */}
      <div className="flex-1 p-3 overflow-hidden flex flex-col justify-center">
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mb-1" />
            Loading query...
          </div>
        )}
        {!isLoading && plugin && chartProps && (
          <plugin.Renderer {...chartProps} height="100%" />
        )}
        {!isLoading && !chartData && (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No data returned.
          </div>
        )}
      </div>
    </div>
  );
};

export const DashboardsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Mode: "list" or "view"
  const [mode, setMode] = useState<"list" | "view">("list");
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(0);

  // Active filters across the dashboard
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAddChartModalOpen, setIsAddChartModalOpen] = useState(false);

  // Queries
  const { data: dashboards = [], isLoading: isLoadingDashboards, refetch: refetchDashboards } = useQuery({
    queryKey: ["dashboards"],
    queryFn: api.getDashboards,
  });

  const { data: allCharts = [] } = useQuery({
    queryKey: ["charts"],
    queryFn: api.getCharts,
  });

  const dashboardList: DashboardItem[] = Array.isArray(dashboards)
    ? dashboards
    : (dashboards as any)?.data || [];
  const allChartsList: ChartItem[] = Array.isArray(allCharts)
    ? allCharts
    : (allCharts as any)?.data || [];

  const activeDashboard = dashboardList.find((d) => d.id === activeDashboardId);

  // Auto refresh timer
  useEffect(() => {
    if (autoRefreshSecs <= 0) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["chartData"] });
    }, autoRefreshSecs * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSecs, queryClient]);

  // Mutations
  const createDashboardMutation = useMutation({
    mutationFn: () =>
      api.createDashboard({
        title: newTitle.trim(),
        description: newDescription.trim(),
      }),
    onSuccess: (newDash) => {
      queryClient.invalidateQueries({ queryKey: ["dashboards"] });
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setActiveDashboardId(newDash.id);
      setIsEditMode(true);
      setMode("view");
    },
  });

  const updateDashboardMutation = useMutation({
    mutationFn: (data: any) => {
      if (!activeDashboardId) throw new Error("No active dashboard");
      return api.updateDashboard(activeDashboardId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboards"] });
    },
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: (id: string) => api.deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboards"] });
      if (activeDashboardId) {
        setActiveDashboardId(null);
        setMode("list");
      }
    },
  });

  const handleOpenDashboard = (dash: DashboardItem) => {
    setActiveDashboardId(dash.id);
    setIsEditMode(false);
    setActiveFilters({});
    setMode("view");
  };

  const handleAddChartToDashboard = (chartId: string) => {
    if (!activeDashboard) return;
    const existingChartIds = activeDashboard.charts.map((c) => c.chart_id);
    if (existingChartIds.includes(chartId)) {
      alert("Chart is already placed on this dashboard.");
      return;
    }

    const updatedChartIds = [...existingChartIds, chartId];
    updateDashboardMutation.mutate({
      chart_ids: updatedChartIds,
    });
    setIsAddChartModalOpen(false);
  };

  const handleRemoveChartFromDashboard = (chartId: string) => {
    if (!activeDashboard) return;
    const updatedChartIds = activeDashboard.charts
      .map((c) => c.chart_id)
      .filter((id) => id !== chartId);

    updateDashboardMutation.mutate({
      chart_ids: updatedChartIds,
    });
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-slate-50 p-6 overflow-y-auto" : ""}`}>
      {/* List Mode View */}
      {mode === "list" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboards</h1>
              <p className="text-sm text-slate-500">
                Assemble multi-chart business intelligence dashboards with real-time cross-filtering.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetchDashboards()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingDashboards ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                New Dashboard
              </button>
            </div>
          </div>

          {/* Dashboards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dashboardList.map((dash) => (
              <div
                key={dash.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                        <LayoutGrid className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{dash.title}</h3>
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-700 rounded mt-0.5">
                          {dash.charts?.length || 0} Charts
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete dashboard '${dash.title}'?`)) {
                          deleteDashboardMutation.mutate(dash.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 transition p-1"
                      title="Delete dashboard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {dash.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{dash.description}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slug:</span>
                      <span className="font-mono text-slate-700">/{dash.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created:</span>
                      <span className="text-slate-600">
                        {dash.created_at ? new Date(dash.created_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenDashboard(dash)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-1.5 transition shadow-sm"
                  >
                    Open Dashboard
                  </button>
                </div>
              </div>
            ))}
          </div>

          {dashboardList.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No Dashboards Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Assemble cohesive executive analytics boards by combining multiple charts, filters, and KPI cards.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Create Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* View / Edit Mode View */}
      {mode === "view" && activeDashboard && (
        <div className="space-y-4">
          {/* Top Dashboard Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMode("list")}
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Dashboards
              </button>
              <div className="h-4 w-px bg-slate-200" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                  {activeDashboard.title}
                </h1>
                {activeDashboard.description && (
                  <p className="text-xs text-slate-500">{activeDashboard.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Auto Refresh selector */}
              <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 border border-slate-200 rounded">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Auto-refresh:</span>
                <select
                  value={autoRefreshSecs}
                  onChange={(e) => setAutoRefreshSecs(Number(e.target.value))}
                  className="bg-transparent border-0 font-medium focus:ring-0 text-slate-800"
                >
                  <option value={0}>Off</option>
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["chartData"] })}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition"
                title="Refresh all charts"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 transition"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Edit Mode Toggle */}
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition flex items-center gap-1.5 ${
                  isEditMode
                    ? "bg-amber-100 text-amber-800 border border-amber-300 font-semibold"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                {isEditMode ? "Done Editing" : "Edit Layout"}
              </button>

              {isEditMode && (
                <button
                  onClick={() => setIsAddChartModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Chart
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Native Cross-Filter Bar (only shown when dashboard defines filters) */}
          {activeDashboard.filters && activeDashboard.filters.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                Cross-Filters:
              </div>

              {activeDashboard.filters.map((f: any) => (
                <div key={f.id || f.name} className="flex items-center gap-1.5">
                  <span className="text-slate-600 font-medium capitalize">{f.name}:</span>
                  <input
                    type="text"
                    value={activeFilters[f.name] && activeFilters[f.name] !== "all" ? activeFilters[f.name] : ""}
                    onChange={(e) =>
                      setActiveFilters({
                        ...activeFilters,
                        [f.name]: e.target.value || "all",
                      })
                    }
                    placeholder={`Filter ${f.name}...`}
                    className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium w-36"
                  />
                </div>
              ))}

              {Object.keys(activeFilters).some((k) => activeFilters[k] && activeFilters[k] !== "all") && (
                <button
                  onClick={() => setActiveFilters({})}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Charts Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[500px]">
            {activeDashboard.charts.map((placement) => (
              <div key={placement.id} className="min-h-[360px] h-[380px]">
                <DashboardChartTile
                  chartId={placement.chart_id}
                  charts={allCharts}
                  activeFilters={activeFilters}
                  isEditMode={isEditMode}
                  onRemove={() => handleRemoveChartFromDashboard(placement.chart_id)}
                />
              </div>
            ))}
          </div>

          {activeDashboard.charts.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-800">Dashboard is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click "Edit Layout" and "Add Chart" to place visualizations on this dashboard.
              </p>
              <button
                onClick={() => {
                  setIsEditMode(true);
                  setIsAddChartModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Add First Chart
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Dashboard Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Create New Dashboard</h3>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Dashboard Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Executive Sales Performance"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional notes or goals for this board"
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => createDashboardMutation.mutate()}
                disabled={!newTitle.trim() || createDashboardMutation.isPending}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm disabled:opacity-50"
              >
                {createDashboardMutation.isPending ? "Creating..." : "Create Dashboard"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Chart to Dashboard Modal */}
      {isAddChartModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Add Chart to Dashboard</h3>
              <button
                onClick={() => setIsAddChartModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {allChartsList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleAddChartToDashboard(c.id)}
                  className="p-3 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs">{c.title}</h4>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                      {c.viz_type}
                    </span>
                  </div>
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
              ))}
              {allCharts.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No saved charts found. Build and save charts in the Charts tab first.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardsPage;
