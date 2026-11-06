import React from "react";
import { Settings as SettingsIcon, Shield, User, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { useAuthStore } from "@/features/auth/authStore";

export function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">User Settings</h1>
        <p className="text-xs text-muted-foreground">Manage profile, personal API tokens, and preferences</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Profile Details</CardTitle>
          </div>
          <CardDescription className="text-xs">Your identity on Ask Your Data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground block text-[11px]">Full Name</span>
              <span className="font-semibold text-foreground">{user?.full_name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Email Address</span>
              <span className="font-semibold text-foreground">{user?.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Superuser Status</span>
              <span className="font-semibold text-foreground">{user?.is_superuser ? "Yes" : "No"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Assigned Roles</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {user?.roles?.map((r) => (
                  <span key={r.name} className="px-1.5 py-0.5 rounded text-[10px] bg-secondary font-medium">
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

