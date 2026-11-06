/**
 * Chart Plugin Registry Type Definitions (ADR-005)
 */
import React from "react";

export type ChartTier = 1 | 2;

export interface ChartMetadata {
  id: string;
  name: string;
  description: string;
  tier: ChartTier;
  category: "comparison" | "trend" | "distribution" | "composition" | "flow" | "geo" | "kpi" | "table";
  iconName: string;
  supportedDataTypes: {
    dimensions: number; // min required
    metrics: number; // min required
  };
}

export interface ControlPanelSchema {
  dimensions: {
    label: string;
    description?: string;
    multi?: boolean;
    required?: boolean;
  };
  metrics: {
    label: string;
    description?: string;
    multi?: boolean;
    required?: boolean;
  };
  options?: Record<string, any>;
}

export interface ChartQueryPayload {
  dataset_id: string;
  dimensions: string[];
  metrics: string[];
  filters?: any[];
  time_column?: string;
  time_range?: string;
  time_grain?: string;
  order_by?: [string, "asc" | "desc"][];
  row_limit?: number;
}

export interface ChartPlugin<TProps = any, TOptions = any> {
  metadata: ChartMetadata;
  controlPanel: ControlPanelSchema;
  buildQuery: (formValues: Record<string, any>) => ChartQueryPayload;
  transformProps: (queryResult: { columns: string[]; rows: any[][] }, options?: TOptions) => TProps;
  Renderer: React.ComponentType<TProps>;
}

