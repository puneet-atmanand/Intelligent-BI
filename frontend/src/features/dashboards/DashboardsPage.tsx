import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboards</h1>
          <p className="text-xs text-muted-foreground">
            Responsive grid dashboards with native filters, cross-filtering, and PDF exports
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Dashboard
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
          <Layers className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No Dashboards Created</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          React-grid-layout dashboard editor, scoped cross-filters, and seeded demo dashboard in Phase 3.
        </p>
      </div>
    </div>
  );
}

