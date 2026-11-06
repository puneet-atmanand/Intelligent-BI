import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface AreaChartProps {
  option: any;
  height?: number | string;
}

const metadata: ChartMetadata = {
  id: "area",
  name: "Area Chart",
  description: "Highlight volume and cumulative trends over time with filled areas.",
  tier: 1,
  category: "trend",
  iconName: "AreaChart",
  supportedDataTypes: { dimensions: 1, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Time / X-Axis", multi: false, required: true },
  metrics: { label: "Metrics", multi: true, required: true },
  options: {
    stacked: { type: "boolean", label: "Stack Areas", default: true },
    opacity: { type: "number", label: "Fill Opacity", default: 0.5 },
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
): AreaChartProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0 || columns.length < 2) {
    return { option: { title: { text: "No data available", left: "center", top: "center" } } };
  }

  const categories = rows.map((r) => String(r[0] ?? ""));
  const metricCols = columns.slice(1);
  const opacity = options.opacity ?? 0.5;

  const series = metricCols.map((col, idx) => {
    const data = rows.map((r) => r[idx + 1] ?? 0);
    return {
      name: col,
      type: "line",
      smooth: true,
      stack: options.stacked ? "total" : undefined,
      areaStyle: { opacity },
      data,
    };
  });

  const option = {
    tooltip: { trigger: "axis" },
    legend: { top: 10 },
    grid: { left: "4%", right: "4%", bottom: "8%", top: 50, containLabel: true },
    xAxis: { type: "category", boundaryGap: false, data: categories },
    yAxis: { type: "value" },
    series,
  };

  return { option };
};

const Renderer: React.FC<AreaChartProps> = ({ option, height = 380 }) => {
  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />;
};

export const areaChartPlugin: ChartPlugin<AreaChartProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default areaChartPlugin;
