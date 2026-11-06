import { BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ChartsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Charts</h1>
          <p className="text-xs text-muted-foreground">
            Explore datasets and build Apache ECharts visualizations (Tier 1 & Tier 2)
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Chart
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No Charts Created</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Chart explore builder and plugin registry will be activated in Phase 2.
        </p>
      </div>
    </div>
  );
}

