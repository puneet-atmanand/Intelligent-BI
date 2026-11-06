import { describe, it, expect } from "vitest";
import { chartRegistry, ChartPlugin } from "../index";

describe("Chart Plugin Registry", () => {
  it("registers and retrieves a chart plugin correctly", () => {
    const mockBarChart: ChartPlugin = {
      metadata: {
        id: "mock_bar",
        name: "Mock Bar",
        description: "Test bar chart",
        tier: 1,
        category: "comparison",
        iconName: "BarChart3",
        supportedDataTypes: { dimensions: 1, metrics: 1 },
      },
      controlPanel: {
        dimensions: { label: "Category" },
        metrics: { label: "Value" },
      },
      buildQuery: (form) => ({
        dataset_id: form.dataset_id,
        dimensions: [form.dimension],
        metrics: [form.metric],
      }),
      transformProps: (res) => ({ data: res.rows }),
      Renderer: () => null,
    };

    chartRegistry.register(mockBarChart);
    expect(chartRegistry.has("mock_bar")).toBe(true);

    const retrieved = chartRegistry.get("mock_bar");
    expect(retrieved?.metadata.name).toBe("Mock Bar");
    expect(retrieved?.metadata.tier).toBe(1);
  });

  it("verifies all Tier 1 plugins are automatically registered", () => {
    const tier1Ids = [
      "bar",
      "line",
      "area",
      "pie",
      "table",
      "big_number",
      "big_number_trendline",
      "scatter",
      "heatmap",
      "histogram",
      "pivot_table",
    ];

    for (const id of tier1Ids) {
      expect(chartRegistry.has(id)).toBe(true);
      const plugin = chartRegistry.get(id);
      expect(plugin).toBeDefined();
      expect(plugin?.metadata.id).toBe(id);
      expect(plugin?.controlPanel).toBeDefined();
      expect(typeof plugin?.buildQuery).toBe("function");
      expect(typeof plugin?.transformProps).toBe("function");
      expect(plugin?.Renderer).toBeDefined();
    }
  });
});

