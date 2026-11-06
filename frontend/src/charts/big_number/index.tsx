import React from "react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface BigNumberProps {
  value: string | number;
  label: string;
  subheader?: string;
}

const metadata: ChartMetadata = {
  id: "big_number",
  name: "Big Number (KPI)",
  description: "Prominent single KPI aggregate number for summary dashboards.",
  tier: 1,
  category: "kpi",
  iconName: "Hash",
  supportedDataTypes: { dimensions: 0, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Dimensions (None)", multi: false, required: false },
  metrics: { label: "Metric", multi: false, required: true },
  options: {
    format: { type: "select", label: "Number Format", options: ["standard", "currency", "percentage"], default: "standard" },
    subheader: { type: "text", label: "Subheader / Note", default: "" },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    row_limit: 1,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  options: Record<string, any> = {}
): BigNumberProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0) {
    return { value: 0, label: "No data" };
  }

  const rawVal = rows[0][0];
  let formatted = String(rawVal ?? 0);

  if (typeof rawVal === "number") {
    if (options.format === "currency") {
      formatted = `$${rawVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (options.format === "percentage") {
      formatted = `${(rawVal * 100).toFixed(1)}%`;
    } else {
      formatted = rawVal.toLocaleString();
    }
  }

  return {
    value: formatted,
    label: columns[0] || "Total",
    subheader: options.subheader,
  };
};

const Renderer: React.FC<BigNumberProps> = ({ value, label, subheader }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-white rounded-lg">
      <div className="text-4xl lg:text-5xl font-extrabold text-blue-600 font-mono tracking-tight">
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2">
        {label}
      </div>
      {subheader && (
        <div className="text-[11px] text-slate-400 mt-1">
          {subheader}
        </div>
      )}
    </div>
  );
};

export const bigNumberPlugin: ChartPlugin<BigNumberProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default bigNumberPlugin;
