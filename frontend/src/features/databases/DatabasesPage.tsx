import React from "react";
import { Server, Plus, Database, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function DatabasesPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Database Connections</h1>
          <p className="text-xs text-muted-foreground">
            Manage database connections with encrypted credentials and schema browsing
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {/* Built-in DuckDB Connection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">Uploads (DuckDB)</CardTitle>
                  <CardDescription className="text-xs">Internal System Connection</CardDescription>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                Connected
              </span>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>Built-in embedded columnar store powering uploaded CSV, TSV, Parquet, and Excel files.</p>
            <div className="pt-2 flex items-center gap-4 text-[11px] text-muted-foreground border-t border-border/60">
              <span>Dialect: <strong>DuckDB</strong></span>
              <span>Uploads: <strong>Enabled</strong></span>
              <span>SQL Lab: <strong>Enabled</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

