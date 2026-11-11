# Ask Your Data — User Guide & Workflow Walkthrough

**Ask Your Data** is an enterprise Business Intelligence platform combining the power of Apache Superset data exploration with a strictly grounded, anti-hallucinatory AI data analyst.

---

## 1. Quick Start & Navigation

Launch the workspace:
1. **Frontend**: Open `http://localhost:5173` in your browser.
2. **Backend**: Running on `http://127.0.0.1:8000` with interactive API docs at `http://127.0.0.1:8000/docs`.

Top Navigation & Sidebar:
- **Dashboards**: Multi-chart executive layouts with real-time cross-filtering.
- **Charts / Explore**: No-code visual chart builder with 11 Tier 1 chart types.
- **Datasets**: Semantic dataset manager with custom SQL metrics.
- **SQL Lab**: Multi-tab Monaco SQL editor with schema browser and exports.
- **Databases**: Live database connection manager (Postgres, MySQL, SQLite, DuckDB, etc.).
- **Uploads**: Drag-and-drop file ingestion (CSV, Excel, Parquet, JSON) into DuckDB.
- **Ask AI**: Slide-over AI Analyst button located in the top bar.

---

## 2. Ingesting Data (Uploads)

1. Navigate to **Uploads** in the sidebar.
2. Drag and drop any `.csv`, `.tsv`, `.xlsx`, `.jsonl`, or `.parquet` file.
3. The platform parses the schema, auto-detects encoding, and shows a 100-row preview.
4. Review inferred column data types (e.g. `VARCHAR`, `BIGINT`, `DOUBLE`, `TIMESTAMP`).
5. Choose your table name and import. The data is stored in the internal DuckDB engine and automatically registered as an accessible semantic Dataset!

---

## 3. Creating & Exploring Charts

1. Navigate to **Charts** and click **Create Chart** (or click Explore on any dataset).
2. Select your Dataset (e.g. `Global Sales`).
3. Pick a Chart Type from the 11 Tier 1 plugins:
   - **Big Number**: Prominent KPI card with currency and unit formatting.
   - **Big Number with Trendline**: KPI summary with integrated sparkline trend.
   - **Bar Chart**: Categorical comparison with horizontal, vertical, and stacked modes.
   - **Line Chart**: Continuous time-series performance curves.
   - **Area Chart**: Stacked cumulative volume progression.
   - **Pie / Donut**: Proportional share distribution.
   - **Scatter Plot**: 2D metric correlation with hover tooltips.
   - **Heatmap**: 2D categorical matrix density.
   - **Histogram**: Frequency distribution over continuous bins.
   - **Table**: Paginated tabular grid with search and sort.
   - **Pivot Table**: Cross-tabulation matrix with totals.
4. Select Dimensions, Metrics, and ad-hoc Filters.
5. Click **Run Query** to render the chart in Apache ECharts.
6. Click **Save Chart** to store it in your catalog.

---

## 4. Building Dashboards

1. Navigate to **Dashboards** and open the seeded **Executive Sales Performance** dashboard.
2. Use the **Native Filter Bar** at the top:
   - Filter by **Region** (e.g. `North America`, `EMEA`, `APAC`, `LATAM`).
   - Filter by **Category** (e.g. `Electronics`, `Office Supplies`, `Software`).
   - All 10 charts update dynamically to reflect the filtered slice!
3. Click **Edit Mode** to rearrange chart tiles or add new charts from your catalog.
4. Set an **Auto-Refresh Interval** (10s, 30s, 1m, 5m) or toggle **Fullscreen** for presentation mode.

---

## 5. Using the Grounded AI Analyst

1. Click the **Ask AI** button with the sparkle icon in the top header.
2. The AI Analyst Drawer slides open from the right.
3. Type any analytical question in plain English, for example:
   - *"What is our total revenue breakdown by category?"*
   - *"Show revenue and net profit across all regions"*
   - *"What are our top 5 enterprise customers by revenue?"*
   - *"What is our overall total revenue and profit margin?"*
4. **Transparency & Zero Hallucination**:
   - The AI writes and runs safe read-only SQL queries against your data.
   - An automated **Anti-Hallucination Guardrail** parses every number in the proposed answer and verifies it against the returned query rows.
   - The **Verified Grounded in Data** badge confirms that 100% of figures are genuine.
   - Expand the **Executed SQL** section to inspect or copy the exact SQL.
   - Expand the **Query Data** section to inspect the raw database rows.
   - Click **Explore as Chart** to open the chart builder with the query pre-loaded!
