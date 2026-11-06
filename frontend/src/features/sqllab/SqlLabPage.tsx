import { Terminal, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SqlLabPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">SQL Lab</h1>
          <p className="text-xs text-muted-foreground">
            Multi-tab SQL workspace with schema-aware autocomplete, limit enforcement, and query history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 border-primary/30 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Generate SQL
          </Button>
          <Button size="sm" className="gap-1.5">
            <Play className="h-3.5 w-3.5" />
            Run Query
          </Button>
        </div>
      </div>

      <div className="flex-1 rounded-xl border border-border bg-card flex flex-col items-center justify-center p-12 text-center space-y-2">
        <Terminal className="h-8 w-8 text-muted-foreground mb-2" />
        <h3 className="text-sm font-semibold text-foreground">SQL Lab Ready for Phase 1</h3>
        <p className="text-xs text-muted-foreground max-w-md">
          Monaco Editor with schema-aware autocompletion and Jinja templating will be activated in Phase 1.
        </p>
      </div>
    </div>
  );
}

