import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface ScatterChartProps {
  option: any;
  height?: number | string;
}

const metadata: ChartMetadata = {
  id: "scatter",
  name: "Scatter Plot",
  description: "Identify correlations and clustering between two numerical metrics.",
  tier: 1,
  category: "distribution",
  iconName: "CircleDot",
  supportedDataTypes: { dimensions: 1, metrics: 2 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Entity / Label", multi: false, required: true },
  metrics: { label: "X & Y Metrics", multi: true, required: true },
  options: {
    symbolSize: { type: "number", label: "Point Size", default: 12 },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimension ? [formValues.dimension] : [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    row_limit: formValues.row_limit || 200,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  options: Record<string, any> = {}
): ScatterChartProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0 || columns.length < 3) {
    return { option: { title: { text: "Requires 1 dimension and 2 metrics", left: "center", top: "center" } } };
  }

  const pointSize = options.symbolSize || 12;
  const scatterData = rows.map((r) => [r[1], r[2], r[0]]);

  const option = {
    tooltip: {
      formatter: (params: any) => {
        const [x, y, name] = params.value;
        return `<b>${name}</b><br/>${columns[1]}: ${x}<br/>${columns[2]}: ${y}`;
      },
    },
    grid: { left: "4%", right: "4%", bottom: "8%", top: 30, containLabel: true },
    xAxis: { name: columns[1], type: "value" },
    yAxis: { name: columns[2], type: "value" },
    series: [
      {
        type: "scatter",
        symbolSize: pointSize,
        itemStyle: { color: "#3b82f6" },
        data: scatterData,
      },
    ],
  };

  return { option };
};

const Renderer: React.FC<ScatterChartProps> = ({ option, height = 380 }) => {
  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />;
};

export const scatterChartPlugin: ChartPlugin<ScatterChartProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default scatterChartPlugin;
