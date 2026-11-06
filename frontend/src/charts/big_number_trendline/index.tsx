import React from "react";
import ReactECharts from "echarts-for-react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface BigNumberTrendlineProps {
  currentValue: string | number;
  label: string;
  sparklineOption: any;
}

const metadata: ChartMetadata = {
  id: "big_number_trendline",
  name: "Big Number with Trendline",
  description: "Prominent KPI metric with an embedded sparkline trendline.",
  tier: 1,
  category: "kpi",
  iconName: "TrendingUp",
  supportedDataTypes: { dimensions: 1, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Time Dimension", multi: false, required: true },
  metrics: { label: "Metric", multi: false, required: true },
  options: {
    format: { type: "select", label: "Format", options: ["currency", "standard"], default: "currency" },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimension ? [formValues.dimension] : [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    time_column: formValues.time_column || formValues.dimension,
    time_grain: formValues.time_grain || "month",
    row_limit: 30,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  options: Record<string, any> = {}
): BigNumberTrendlineProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0) {
    return {
      currentValue: 0,
      label: "No data",
      sparklineOption: {},
    };
  }

  // Sum or latest value
  const values = rows.map((r) => Number(r[1] ?? 0));
  const total = values.reduce((acc, v) => acc + v, 0);

  let formatted = String(total);
  if (options.format === "currency") {
    formatted = `$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  } else {
    formatted = total.toLocaleString();
  }

  const sparklineOption = {
    grid: { left: 0, right: 0, top: 10, bottom: 0 },
    xAxis: { type: "category", show: false },
    yAxis: { type: "value", show: false },
    series: [
      {
        data: values,
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { color: "#2563eb", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(37,99,235,0.4)" },
              { offset: 1, color: "rgba(37,99,235,0.0)" },
            ],
          },
        },
      },
    ],
  };

  return {
    currentValue: formatted,
    label: columns[1] || "Metric Total",
    sparklineOption,
  };
};

const Renderer: React.FC<BigNumberTrendlineProps> = ({ currentValue, label, sparklineOption }) => {
  return (
    <div className="h-full flex flex-col justify-between p-5 bg-white rounded-lg">
      <div>
        <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
          {currentValue}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
          {label}
        </div>
      </div>
      <div className="h-24 w-full mt-2">
        <ReactECharts option={sparklineOption} style={{ height: "100%", width: "100%" }} notMerge />
      </div>
    </div>
  );
};

export const bigNumberTrendlinePlugin: ChartPlugin<BigNumberTrendlineProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default bigNumberTrendlinePlugin;
