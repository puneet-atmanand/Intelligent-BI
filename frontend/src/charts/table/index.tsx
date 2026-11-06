import React, { useState } from "react";
import { ChartPlugin, ChartMetadata, ControlPanelSchema, ChartQueryPayload } from "../types";

export interface TableChartProps {
  columns: string[];
  rows: any[][];
}

const metadata: ChartMetadata = {
  id: "table",
  name: "Table View",
  description: "Tabular representation of records with column formatting and sorting.",
  tier: 1,
  category: "table",
  iconName: "Table",
  supportedDataTypes: { dimensions: 1, metrics: 0 },
};

const controlPanel: ControlPanelSchema = {
  dimensions: { label: "Columns / Dimensions", multi: true, required: true },
  metrics: { label: "Metrics (Optional)", multi: true, required: false },
  options: {
    pageSize: { type: "number", label: "Page Size", default: 15 },
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
): TableChartProps => {
  return {
    columns: queryResult.columns || [],
    rows: queryResult.rows || [],
  };
};

const Renderer: React.FC<TableChartProps> = ({ columns, rows }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    return r.some((c) => c !== null && String(c).toLowerCase().includes(search.toLowerCase()));
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg overflow-hidden text-xs">
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <input
          type="text"
          placeholder="Filter rows..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 w-48"
        />
        <span className="text-[11px] text-slate-500">
          {filtered.length} rows total
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100 font-semibold text-slate-700 sticky top-0 border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-8 text-slate-400 font-mono text-[10px]">#</th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {pageRows.map((r, rIdx) => (
              <tr key={rIdx} className="hover:bg-blue-50/40">
                <td className="px-3 py-1.5 text-slate-400 text-[10px]">
                  {(currentPage - 1) * pageSize + rIdx + 1}
                </td>
                {r.map((c, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-800">
                    {c !== null && c !== undefined ? String(c) : <span className="text-slate-300">null</span>}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="py-8 text-center text-slate-400">
                  No records match the filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-600">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-0.5 border border-slate-300 rounded disabled:opacity-40 hover:bg-white"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-0.5 border border-slate-300 rounded disabled:opacity-40 hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const tableChartPlugin: ChartPlugin<TableChartProps> = {
  metadata,
  controlPanel,
  buildQuery,
  transformProps,
  Renderer,
};
export default tableChartPlugin;
