import React, { useState, useEffect } from "react";
import { X, Sparkles, Send, ShieldAlert, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface AIDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIDrawer({ isOpen, onClose }: AIDrawerProps) {
  const [aiStatus, setAiStatus] = useState<{ enabled: boolean; provider?: string } | null>(null);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetch("/api/v1/ai/status")
        .then((res) => (res.ok ? res.json() : { enabled: false }))
        .then((data) => setAiStatus(data))
        .catch(() => setAiStatus({ enabled: false }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ask AI Assistant</h3>
            <p className="text-[10px] text-muted-foreground">Grounded Natural Language to SQL</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {aiStatus && (
            <Badge variant={aiStatus.enabled ? "success" : "secondary"}>
              {aiStatus.enabled ? "Online" : "AI Disabled"}
            </Badge>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {aiStatus?.enabled === false ? (
          <div className="p-4 rounded-lg bg-secondary/50 border border-border/80 text-center space-y-3 mt-8">
            <div className="inline-flex p-3 rounded-full bg-muted text-muted-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">AI Assistant is Disabled</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Per platform configuration, AI features are currently turned off. All core BI features
              (connectors, datasets, SQL Lab, charts, dashboards) operate without external LLM dependencies.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-primary/5 border border-primary/20 text-xs text-primary space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Anti-Hallucination Grounding Rule:
              </p>
              <p className="text-[11px] text-muted-foreground">
                The assistant answers only from executed query rows. Numbers are verified against actual data.
              </p>
            </div>

            <div className="text-xs text-muted-foreground text-center py-12">
              Ask a question about any connected dataset or uploaded file.
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer Input */}
      {aiStatus?.enabled && (
        <div className="p-3 border-t border-border bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuestion("");
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask a question about your data..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 bg-muted/50 rounded-md border border-input px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button size="sm" type="submit" disabled={!question.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

