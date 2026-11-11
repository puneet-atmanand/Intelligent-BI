import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface PieChartProps {
  option: any;
  height?: number | string;
}

const metadata: ChartMetadata = {
  id: "pie",
  name: "Pie / Donut Chart",
  description: "Display proportion and composition of a whole.",
  tier: 1,
  category: "composition",
  iconName: "PieChart",
  supportedDataTypes: { dimensions: 1, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Category / Slice", multi: false, required: true },
  metrics: { label: "Metric / Value", multi: false, required: true },
  options: {
    donut: { type: "boolean", label: "Donut Mode (Hollow Center)", default: true },
    roseType: { type: "boolean", label: "Nightingale Rose Style", default: false },
    showLegend: { type: "boolean", label: "Show Legend", default: true },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimension ? [formValues.dimension] : [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    row_limit: formValues.row_limit || 20,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  options: Record<string, any> = {}
): PieChartProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0 || columns.length < 2) {
    return { option: { title: { text: "No data available", left: "center", top: "center" } } };
  }

  const pieData = rows.map((r) => ({
    name: String(r[0] ?? "Unknown"),
    value: Number(r[1] ?? 0),
  }));

  const isDonut = options.donut !== false;
  const radius = isDonut ? ["40%", "70%"] : "70%";

  const option = {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: options.showLegend !== false ? { orient: "vertical", left: "left", top: "center" } : undefined,
    series: [
      {
        name: columns[1] || "Metric",
        type: "pie",
        radius,
        roseType: options.roseType ? "radius" : undefined,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: { show: true, formatter: "{b}: {d}%" },
        data: pieData,
      },
    ],
  };

  return { option };
};

const Renderer: React.FC<PieChartProps> = ({ option, height = 380 }) => {
  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />;
};

export const pieChartPlugin: ChartPlugin<PieChartProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default pieChartPlugin;

