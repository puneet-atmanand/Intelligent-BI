import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart3,
  Database,
  Terminal,
  Server,
  UploadCloud,
  Shield,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/features/auth/authStore";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.is_superuser || user?.roles.some((r) => r.name === "Admin");

  const navItems = [
    { name: "Home", path: "/", icon: LayoutDashboard },
    { name: "Dashboards", path: "/dashboards", icon: BarChart3 },
    { name: "Charts", path: "/charts", icon: BarChart3 },
    { name: "Datasets", path: "/datasets", icon: Database },
    { name: "SQL Lab", path: "/sqllab", icon: Terminal },
    { name: "Databases", path: "/databases", icon: Server },
    { name: "Uploads", path: "/uploads", icon: UploadCloud },
    { name: "Settings", path: "/settings", icon: SettingsIcon },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin", path: "/admin", icon: Shield });
  }

  return (
    <aside
      className={clsx(
        "h-screen flex flex-col border-r border-border/80 bg-card transition-all duration-300 select-none z-20",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-border/80 justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-sm flex-shrink-0">
            <Database className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm tracking-tight text-foreground truncate">
              Ask Your Data
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-border/80 text-[11px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Core: Superset Parity</span>
            <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">v0.1</span>
          </div>
        </div>
      )}
    </aside>
  );
}

