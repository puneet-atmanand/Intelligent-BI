import { ChartPlugin, ChartMetadata } from "./types";
import { barChartPlugin } from "./bar";
import { lineChartPlugin } from "./line";
import { areaChartPlugin } from "./area";
import { pieChartPlugin } from "./pie";
import { tableChartPlugin } from "./table";
import { bigNumberPlugin } from "./big_number";
import { bigNumberTrendlinePlugin } from "./big_number_trendline";
import { scatterChartPlugin } from "./scatter";
import { heatmapChartPlugin } from "./heatmap";
import { histogramPlugin } from "./histogram";
import { pivotTablePlugin } from "./pivot_table";

class ChartRegistry {
  private plugins: Map<string, ChartPlugin> = new Map();

  register(plugin: ChartPlugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      console.warn(`Chart plugin '${plugin.metadata.id}' is already registered. Overwriting.`);
    }
    this.plugins.set(plugin.metadata.id, plugin);
  }

  get(id: string): ChartPlugin | undefined {
    return this.plugins.get(id);
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  getAll(): ChartPlugin[] {
    return Array.from(this.plugins.values());
  }

  getAllMetadata(): ChartMetadata[] {
    return this.getAll().map((p) => p.metadata);
  }

  getByTier(tier: 1 | 2): ChartPlugin[] {
    return this.getAll().filter((p) => p.metadata.tier === tier);
  }
}

export const chartRegistry = new ChartRegistry();

// Register Tier 1 Charts on initialization
chartRegistry.register(barChartPlugin);
chartRegistry.register(lineChartPlugin);
chartRegistry.register(areaChartPlugin);
chartRegistry.register(pieChartPlugin);
chartRegistry.register(tableChartPlugin);
chartRegistry.register(bigNumberPlugin);
chartRegistry.register(bigNumberTrendlinePlugin);
chartRegistry.register(scatterChartPlugin);
chartRegistry.register(heatmapChartPlugin);
chartRegistry.register(histogramPlugin);
chartRegistry.register(pivotTablePlugin);

export * from "./types";
