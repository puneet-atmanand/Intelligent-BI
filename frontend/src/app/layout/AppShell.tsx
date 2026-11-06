import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AIDrawer } from "@/features/ai/AIDrawer";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar onOpenAIDrawer={() => setAiDrawerOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
          <Outlet />
        </main>
      </div>

      {/* AI Assistant Drawer */}
      <AIDrawer isOpen={aiDrawerOpen} onClose={() => setAiDrawerOpen(false)} />
    </div>
  );
}

