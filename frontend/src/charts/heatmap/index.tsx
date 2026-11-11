import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface HeatmapChartProps {
  option: any;
  height?: number | string;
}

const metadata: ChartMetadata = {
  id: "heatmap",
  name: "Heatmap Matrix",
  description: "Cross-sectional matrix displaying metric intensity across two categories.",
  tier: 1,
  category: "distribution",
  iconName: "Grid",
  supportedDataTypes: { dimensions: 2, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "X & Y Dimensions", multi: true, required: true },
  metrics: { label: "Intensity Metric", multi: false, required: true },
  options: {
    colorScheme: { type: "select", label: "Palette", options: ["blues", "viridis", "warm"], default: "blues" },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimensions || [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    row_limit: formValues.row_limit || 200,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  _options: Record<string, any> = {}
): HeatmapChartProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0 || columns.length < 3) {
    return { option: { title: { text: "Requires 2 dimensions and 1 metric", left: "center", top: "center" } } };
  }

  const xCategories = Array.from(new Set(rows.map((r) => String(r[0] ?? ""))));
  const yCategories = Array.from(new Set(rows.map((r) => String(r[1] ?? ""))));

  const data = rows.map((r) => {
    const xIdx = xCategories.indexOf(String(r[0]));
    const yIdx = yCategories.indexOf(String(r[1]));
    const val = Number(r[2] ?? 0);
    return [xIdx, yIdx, val];
  });

  const values = rows.map((r) => Number(r[2] ?? 0));
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);

  const option = {
    tooltip: { position: "top" },
    grid: { height: "70%", top: "10%" },
    xAxis: { type: "category", data: xCategories, splitArea: { show: true } },
    yAxis: { type: "category", data: yCategories, splitArea: { show: true } },
    visualMap: {
      min: minVal,
      max: maxVal,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "2%",
      inRange: { color: ["#eff6ff", "#60a5fa", "#1d4ed8"] },
    },
    series: [
      {
        name: columns[2] || "Value",
        type: "heatmap",
        data,
        label: { show: true },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" },
        },
      },
    ],
  };

  return { option };
};

const Renderer: React.FC<HeatmapChartProps> = ({ option, height = 380 }) => {
  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />;
};

export const heatmapChartPlugin: ChartPlugin<HeatmapChartProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default heatmapChartPlugin;

