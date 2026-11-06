import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function UploadsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">File Uploads</h1>
          <p className="text-xs text-muted-foreground">
            Upload CSV, TSV, Parquet, JSON, and Excel files directly into DuckDB
          </p>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-xl p-10 text-center bg-card flex flex-col items-center justify-center space-y-3 cursor-pointer">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports CSV, TSV, XLSX, Parquet, JSON / JSONL up to 200 MB
          </p>
        </div>
        <Button size="sm" variant="outline">
          Select File
        </Button>
      </div>
    </div>
  );
}

