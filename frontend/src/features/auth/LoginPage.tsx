import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database, Lock, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuthStore } from "./authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await login(email, password);
    if (success) {
      navigate("/");
    }
  };

  const handleFillDemo = () => {
    clearError();
    setEmail("admin@askyourdata.local");
    setPassword("admin123456");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20 text-primary shadow-sm mb-2">
            <Database className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
            Ask Your Data
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              v0.1.0
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Intelligent Business Intelligence & Data Exploration
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-lg backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access your datasets and dashboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
                <span className="text-xs font-semibold uppercase mt-0.5">Error:</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@askyourdata.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Seed Credentials helper */}
            <div className="mt-6 pt-5 border-t border-border/60 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Fill Default Admin Credentials
              </button>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Enterprise RBAC & Fernet encrypted credentials at rest
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

