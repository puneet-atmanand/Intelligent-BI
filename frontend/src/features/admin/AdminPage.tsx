import React from "react";
import { Shield, Users, Server, FileText, Key, BrainCircuit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export function AdminPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">System Administration</h1>
        <p className="text-xs text-muted-foreground">
          Platform-level governance, role-based access control, audit logs, and AI settings
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <h3 className="text-sm font-semibold text-foreground">Users & Roles</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage user accounts, assign roles (Admin, Editor, Viewer, SQL Lab), and define custom permissions.
          </p>
        </Card>

        <Card className="border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <h3 className="text-sm font-semibold text-foreground">Audit Log</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Review immutable system event logs including user sign-ins, connection updates, AI queries, and data exports.
          </p>
        </Card>

        <Card className="border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <BrainCircuit className="h-5 w-5" />
            <h3 className="text-sm font-semibold text-foreground">AI Governance & Token Budget</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure LLM provider keys, schema allow-lists, per-user rate limits, and daily token spend.
          </p>
        </Card>
      </div>
    </div>
  );
}

