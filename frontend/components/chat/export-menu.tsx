"use client";

import { useState } from "react";
import { Download, Copy, Check, FileText, Table, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportMenuProps {
  exports?: Record<string, string>;
  posts?: Record<string, string>;
  title?: string;
}

export function ExportMenu({ exports, posts, title = "Export Assets" }: ExportMenuProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopyAll = () => {
    let textToCopy = "";
    if (exports?.plain_text) {
      textToCopy = exports.plain_text;
    } else if (posts) {
      textToCopy = Object.entries(posts)
        .map(([plat, content]) => `=== ${plat.toUpperCase()} ===\n${content}`)
        .join("\n\n");
    }

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy);
    setCopiedType("copy_all");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    let md = exports?.markdown;
    if (!md && posts) {
      md = `# Campaign Export\n\n` + Object.entries(posts)
        .map(([p, c]) => `## ${p.toUpperCase()}\n${c}\n`)
        .join("\n");
    }
    if (md) downloadFile(md, "claire-social-posts.md", "text/markdown");
  };

  const handleDownloadCSV = () => {
    let csv = exports?.buffer_csv;
    if (!csv && posts) {
      const today = new Date();
      csv = "Date,Time,Text,Platform\n" + Object.entries(posts)
        .map(([p, c], idx) => {
          const postDate = new Date(today);
          postDate.setDate(today.getDate() + idx + 1);
          const dateStr = postDate.toISOString().split("T")[0];
          const clean = c.replace(/"/g, '""');
          return `"${dateStr}","09:00 AM","${clean}","${p.toUpperCase()}"`;
        })
        .join("\n");
    }
    if (csv) downloadFile(csv, "buffer-ready-posts.csv", "text/csv");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/30 my-2">
      <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1">
        <Download className="w-3.5 h-3.5 text-purple-400" />
        {title}:
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyAll}
        className="h-7 px-2.5 text-[11px] bg-background/50 hover:bg-accent border-border/50 text-foreground flex items-center gap-1 rounded-lg"
      >
        {copiedType === "copy_all" ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Copied All</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 text-purple-400" />
            <span>Copy All</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadMarkdown}
        className="h-7 px-2.5 text-[11px] bg-background/50 hover:bg-accent border-border/50 text-foreground flex items-center gap-1 rounded-lg"
      >
        <FileCode className="w-3 h-3 text-blue-400" />
        <span>Markdown</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadCSV}
        className="h-7 px-2.5 text-[11px] bg-background/50 hover:bg-accent border-border/50 text-foreground flex items-center gap-1 rounded-lg"
      >
        <Table className="w-3 h-3 text-emerald-400" />
        <span>Buffer CSV</span>
      </Button>
    </div>
  );
}
