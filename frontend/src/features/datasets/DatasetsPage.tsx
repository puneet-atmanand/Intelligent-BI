import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DatasetsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Datasets</h1>
          <p className="text-xs text-muted-foreground">
            Semantic physical and virtual datasets, metrics, and calculated columns
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Dataset
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
          <Database className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">No Datasets Defined Yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Connect a database or upload a file to automatically define queryable semantic datasets.
        </p>
      </div>
    </div>
  );
}

