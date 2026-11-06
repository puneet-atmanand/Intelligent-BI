# ADR-005: Open Plugin Architecture for Chart Registry

## Status
Accepted

## Context
Traditional BI systems often require modifying multiple core files across the frontend repository to introduce a new chart type (e.g. updating schemas, control panels, renderers, and query builders across 5+ files).

## Decision
1. Implement a decentralized plugin registry in `frontend/src/charts/`.
2. Each chart lives in its own dedicated directory (e.g., `frontend/src/charts/bar/`) and exports a unified contract:
   - `index.ts`: Chart metadata (ID, label, tier, icon, capabilities).
   - `controlPanel.ts`: Configuration controls schema (dimensions, metrics, filters, sorting, appearance).
   - `buildQuery.ts`: Transforms control values into a standardized query payload.
   - `transformProps.ts`: Transforms raw query rows and metadata into Apache ECharts options.
   - `Renderer.tsx`: Pure React component rendering the chart via `echarts-for-react`.
3. The central registry dynamically registers each chart folder using an index loader. Adding a new chart requires zero modifications to existing chart components.

## Consequences
- **Positive**: High developer velocity; modularity; clean separation of Tier 1 vs Tier 2 charts; ease of testing isolated charts.
- **Negative**: Requires strict interface adherence across all chart plugin folders.

