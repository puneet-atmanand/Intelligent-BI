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
});

