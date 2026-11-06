import { ChartPlugin, ChartMetadata } from "./types";

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
export * from "./types";

