import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface BarChartProps {
  option: any;
  height?: number | string;
}

const metadata: ChartMetadata = {
  id: "bar",
  name: "Bar Chart",
  description: "Compare categorical data with vertical or horizontal bars.",
  tier: 1,
  category: "comparison",
  iconName: "BarChart2",
  supportedDataTypes: { dimensions: 1, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Category / X-Axis", multi: false, required: true },
  metrics: { label: "Metrics", multi: true, required: true },
  options: {
    orientation: { type: "select", label: "Orientation", options: ["vertical", "horizontal"], default: "vertical" },
    stacked: { type: "boolean", label: "Stack Series", default: false },
    showValues: { type: "boolean", label: "Show Value Labels", default: false },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimension ? [formValues.dimension] : [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    order_by: formValues.order_by,
    row_limit: formValues.row_limit || 100,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  options: Record<string, any> = {}
): BarChartProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0 || columns.length < 2) {
    return { option: { title: { text: "No data available", left: "center", top: "center" } } };
  }

  const categoryColIdx = 0;
  const categories = rows.map((r) => String(r[categoryColIdx] ?? ""));
  const metricCols = columns.slice(1);

  const series = metricCols.map((col, idx) => {
    const data = rows.map((r) => r[idx + 1] ?? 0);
    return {
      name: col,
      type: "bar",
      stack: options.stacked ? "total" : undefined,
      label: { show: Boolean(options.showValues), position: "top" },
      data,
      itemStyle: { borderRadius: options.stacked ? 0 : [4, 4, 0, 0] },
    };
  });

  const isHorizontal = options.orientation === "horizontal";

  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { top: 10 },
    grid: { left: "4%", right: "4%", bottom: "8%", top: 50, containLabel: true },
    xAxis: isHorizontal ? { type: "value" } : { type: "category", data: categories, axisLabel: { interval: 0, rotate: categories.length > 8 ? 30 : 0 } },
    yAxis: isHorizontal ? { type: "category", data: categories } : { type: "value" },
    series,
  };

  return { option };
};

const Renderer: React.FC<BarChartProps> = ({ option, height = 380 }) => {
  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />;
};

export const barChartPlugin: ChartPlugin<BarChartProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default barChartPlugin;

