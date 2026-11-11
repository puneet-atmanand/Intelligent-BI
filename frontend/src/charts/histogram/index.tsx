import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface HistogramProps {
  option: any;
  height?: number | string;
}

const metadata: ChartMetadata = {
  id: "histogram",
  name: "Histogram",
  description: "Distribution of continuous numerical variables partitioned into bins.",
  tier: 1,
  category: "distribution",
  iconName: "BarChart",
  supportedDataTypes: { dimensions: 0, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Numeric Column / Metric", multi: false, required: true },
  metrics: { label: "Metrics (Optional)", multi: false, required: false },
  options: {
    bins: { type: "number", label: "Number of Bins", default: 8 },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimension ? [formValues.dimension] : [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    row_limit: formValues.row_limit || 1000,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  options: Record<string, any> = {}
): HistogramProps => {
  const { rows } = queryResult;
  if (!rows || rows.length === 0) {
    return { option: { title: { text: "No data available", left: "center", top: "center" } } };
  }

  const values = rows.map((r) => Number(r[0] ?? 0)).filter((v) => !isNaN(v));
  if (values.length === 0) {
    return { option: { title: { text: "No numeric values found", left: "center", top: "center" } } };
  }

  const numBins = options.bins || 8;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const binWidth = (maxVal - minVal) / numBins || 1;

  const binCounts = new Array(numBins).fill(0);
  const binLabels: string[] = [];

  for (let i = 0; i < numBins; i++) {
    const low = minVal + i * binWidth;
    const high = low + binWidth;
    binLabels.push(`${low.toFixed(1)} - ${high.toFixed(1)}`);
  }

  values.forEach((v) => {
    let idx = Math.floor((v - minVal) / binWidth);
    if (idx >= numBins) idx = numBins - 1;
    if (idx < 0) idx = 0;
    binCounts[idx]++;
  });

  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "4%", right: "4%", bottom: "12%", top: 40, containLabel: true },
    xAxis: {
      type: "category",
      data: binLabels,
      axisLabel: { rotate: 25 },
    },
    yAxis: { type: "value", name: "Frequency" },
    series: [
      {
        name: "Frequency",
        type: "bar",
        data: binCounts,
        itemStyle: { color: "#6366f1", borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  return { option };
};

const Renderer: React.FC<HistogramProps> = ({ option, height = 380 }) => {
  return <ReactECharts option={option} style={{ height, width: "100%" }} notMerge lazyUpdate />;
};

export const histogramPlugin: ChartPlugin<HistogramProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default histogramPlugin;

