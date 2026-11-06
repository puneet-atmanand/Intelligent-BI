import { useState } from "react";
import { Sparkles, Sun, Moon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/authStore";

interface TopBarProps {
  onOpenAIDrawer: () => void;
}

export function TopBar({ onOpenAIDrawer }: TopBarProps) {
  const { user } = useAuthStore();
  const [isDark, setIsDark] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="h-14 border-b border-border/80 bg-card px-6 flex items-center justify-between z-10">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">Analytics Workspace</h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Ask AI Trigger Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAIDrawer}
          className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">Ask AI</span>
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Toggle light/dark theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent text-xs font-medium transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <span className="text-xs text-foreground font-medium hidden sm:inline-block">
              {user?.full_name || user?.email}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-popover p-1 shadow-lg z-50">
              <div className="px-3 py-2 border-b border-border text-xs">
                <p className="font-semibold text-foreground truncate">{user?.full_name}</p>
                <p className="text-muted-foreground truncate text-[11px]">{user?.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user?.roles?.map((r) => (
                    <span
                      key={r.name}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground font-medium"
                    >
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  window.location.reload();
                }}
                className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Refresh Workspace
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

