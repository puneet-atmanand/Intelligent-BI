import { useNavigate } from "react-router-dom";
import {
  Database,
  UploadCloud,
  BarChart3,
  Terminal,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuthStore } from "@/features/auth/authStore";

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Hero */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect your databases, upload flat files to DuckDB, explore semantic datasets, or query via SQL Lab.
        </p>
      </div>

      {/* Connect Data Wizard (Two Big Choices per spec Section 9) */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Get Started: Connect Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Choice 1: Connect a Database */}
          <Card
            onClick={() => navigate("/databases")}
            className="cursor-pointer border-border hover:border-primary/50 hover:shadow-md transition-all group bg-card"
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Database className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center justify-between">
                  Connect a Database
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                </CardTitle>
                <CardDescription className="text-xs">
                  PostgreSQL, MySQL, SQLite, MSSQL, ClickHouse, and more.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect external analytical data warehouses with encrypted credentials, schema inspection, and row-level security.
              </p>
            </CardContent>
          </Card>

          {/* Choice 2: Upload a File */}
          <Card
            onClick={() => navigate("/uploads")}
            className="cursor-pointer border-border hover:border-primary/50 hover:shadow-md transition-all group bg-card"
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center justify-between">
                  Upload a File
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                </CardTitle>
                <CardDescription className="text-xs">
                  CSV, TSV, Excel (.xlsx), Parquet, and JSON / JSONL.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drag and drop files up to 200MB. Auto-inferred schemas are parsed and stored in an internal high-speed DuckDB instance.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card
            onClick={() => navigate("/sqllab")}
            className="cursor-pointer hover:border-border/80 transition-all p-4 flex items-center gap-3 bg-card"
          >
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Terminal className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">SQL Lab</h4>
              <p className="text-[11px] text-muted-foreground">Monaco SQL editor with auto-complete</p>
            </div>
          </Card>

          <Card
            onClick={() => navigate("/charts")}
            className="cursor-pointer hover:border-border/80 transition-all p-4 flex items-center gap-3 bg-card"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Chart Explore</h4>
              <p className="text-[11px] text-muted-foreground">Explore datasets and build visualizations</p>
            </div>
          </Card>

          <Card
            onClick={() => navigate("/dashboards")}
            className="cursor-pointer hover:border-border/80 transition-all p-4 flex items-center gap-3 bg-card"
          >
            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Dashboards</h4>
              <p className="text-[11px] text-muted-foreground">Assemble responsive analytical layouts</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity / Seed State Banner */}
      <Card className="border-border/70 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Platform Status & Phase 0 Verification</CardTitle>
              <CardDescription className="text-xs">
                Ask Your Data platform scaffolded with Superset-parity architecture
              </CardDescription>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Healthy & Ready
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <span className="text-muted-foreground block text-[11px]">Metadata DB</span>
              <span className="font-semibold text-foreground">PostgreSQL 16 (Async)</span>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <span className="text-muted-foreground block text-[11px]">Uploads Engine</span>
              <span className="font-semibold text-foreground">DuckDB (Columnar)</span>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <span className="text-muted-foreground block text-[11px]">Worker Queue</span>
              <span className="font-semibold text-foreground">Celery + Redis</span>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border/60">
              <span className="text-muted-foreground block text-[11px]">Security Guardrail</span>
              <span className="font-semibold text-foreground">sqlglot AST + Fernet</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

