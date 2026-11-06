import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface LineChartProps {
  option: any;
  height?: number | string;
}

const metadata: ChartMetadata = {
  id: "line",
  name: "Line Chart",
  description: "Visualize trends and continuous time series changes.",
  tier: 1,
  category: "trend",
  iconName: "TrendingUp",
  supportedDataTypes: { dimensions: 1, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Time / X-Axis", multi: false, required: true },
  metrics: { label: "Metrics", multi: true, required: true },
  options: {
    smooth: { type: "boolean", label: "Smooth Line Curves", default: true },
    showMarkers: { type: "boolean", label: "Show Data Points", default: true },
    step: { type: "boolean", label: "Step Line", default: false },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimension ? [formValues.dimension] : [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    time_column: formValues.time_column,
    time_grain: formValues.time_grain,
    time_range: formValues.time_range,
    row_limit: formValues.row_limit || 200,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  options: Record<string, any> = {}
): LineChartProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0 || columns.length < 2) {
    return { option: { title: { text: "No data available", left: "center", top: "center" } } };
  }

  const categories = rows.map((r) => String(r[0] ?? ""));
  const metricCols = columns.slice(1);

  const series = metricCols.map((col, idx) => {
    const data = rows.map((r) => r[idx + 1] ?? 0);
    return {
      name: col,
      type: "line",
      smooth: options.smooth !== false,
      showSymbol: Boolean(options.showMarkers),
      step: options.step ? "start" : false,
      data,
    };
  });

  const option = {
    tooltip: { trigger: "axis" },
    legend: { top: 10 },
    grid: { left: "4%", right: "4%", bottom: "8%", top: 50, containLabel: true },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value" },
    series,
  };

  return { option };
};

const Renderer: React.FC<LineChartProps> = ({ option, height = 380 }) => {
  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />;
};

export const lineChartPlugin: ChartPlugin<LineChartProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default lineChartPlugin;
