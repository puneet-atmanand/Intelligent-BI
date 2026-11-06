import React from "react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface PivotTableProps {
  rowCategories: string[];
  colCategories: string[];
  matrix: Record<string, Record<string, number>>;
  valueCol: string;
}

const metadata: ChartMetadata = {
  id: "pivot_table",
  name: "Pivot Table",
  description: "Cross-tabulation summarizing relationships between two categorical groups.",
  tier: 1,
  category: "table",
  iconName: "Table2",
  supportedDataTypes: { dimensions: 2, metrics: 1 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Row & Column Dimensions", multi: true, required: true },
  metrics: { label: "Value Metric", multi: false, required: true },
  options: {
    showTotals: { type: "boolean", label: "Show Row/Column Totals", default: true },
  },
};

const buildQuery = (formValues: Record<string, any>): ChartQueryPayload => {
  return {
    dataset_id: formValues.dataset_id,
    dimensions: formValues.dimensions || [],
    metrics: formValues.metrics || [],
    filters: formValues.filters || [],
    row_limit: formValues.row_limit || 500,
  };
};

const transformProps = (
  queryResult: { columns: string[]; rows: any[][] },
  _options: Record<string, any> = {}
): PivotTableProps => {
  const { columns, rows } = queryResult;
  if (!rows || rows.length === 0 || columns.length < 3) {
    return { rowCategories: [], colCategories: [], matrix: {}, valueCol: "Value" };
  }

  const rowSet = new Set<string>();
  const colSet = new Set<string>();
  const matrix: Record<string, Record<string, number>> = {};

  rows.forEach((r) => {
    const rowKey = String(r[0] ?? "");
    const colKey = String(r[1] ?? "");
    const val = Number(r[2] ?? 0);

    rowSet.add(rowKey);
    colSet.add(colKey);

    if (!matrix[rowKey]) matrix[rowKey] = {};
    matrix[rowKey][colKey] = (matrix[rowKey][colKey] || 0) + val;
  });

  return {
    rowCategories: Array.from(rowSet),
    colCategories: Array.from(colSet),
    matrix,
    valueCol: columns[2] || "Value",
  };
};

const Renderer: React.FC<PivotTableProps> = ({ rowCategories, colCategories, matrix, valueCol: _valueCol }) => {
  if (rowCategories.length === 0 || colCategories.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Requires 2 dimensions (Row, Column) and 1 aggregate value metric.
      </div>
    );
  }

  // Calculate totals
  const colTotals: Record<string, number> = {};
  colCategories.forEach((c) => (colTotals[c] = 0));

  let grandTotal = 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-auto max-h-96 text-xs font-mono">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
          <tr>
            <th className="px-3 py-2 border-r border-slate-200 bg-slate-200/50">Rows \ Cols</th>
            {colCategories.map((c) => (
              <th key={c} className="px-3 py-2 text-right whitespace-nowrap">
                {c}
              </th>
            ))}
            <th className="px-3 py-2 text-right bg-slate-200/50 font-bold">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rowCategories.map((r) => {
            let rowSum = 0;
            return (
              <tr key={r} className="hover:bg-slate-50">
                <td className="px-3 py-1.5 font-medium border-r border-slate-200 bg-slate-50/50 text-slate-800">
                  {r}
                </td>
                {colCategories.map((c) => {
                  const val = matrix[r]?.[c] || 0;
                  rowSum += val;
                  colTotals[c] = (colTotals[c] || 0) + val;
                  grandTotal += val;
                  return (
                    <td key={c} className="px-3 py-1.5 text-right text-slate-700">
                      {val > 0 ? val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—"}
                    </td>
                  );
                })}
                <td className="px-3 py-1.5 text-right font-bold text-slate-900 bg-slate-50/50">
                  {rowSum.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </td>
              </tr>
            );
          })}
          <tr className="bg-slate-100 font-bold border-t border-slate-300">
            <td className="px-3 py-2 border-r border-slate-200 text-slate-800">Total</td>
            {colCategories.map((c) => (
              <td key={c} className="px-3 py-2 text-right text-slate-900">
                {colTotals[c].toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </td>
            ))}
            <td className="px-3 py-2 text-right text-blue-700 bg-blue-50/50">
              {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const pivotTablePlugin: ChartPlugin<PivotTableProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default pivotTablePlugin;
