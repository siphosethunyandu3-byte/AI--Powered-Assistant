import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AiOutput({
  content,
  loading,
  placeholder = "Output will appear here.",
}: {
  content: string;
  loading?: boolean;
  placeholder?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card relative flex min-h-[280px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />
          <span className="text-xs font-medium tracking-wide text-muted-foreground">
            {loading ? "GENERATING…" : "OUTPUT"}
          </span>
        </div>
        {content && !loading && (
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto px-5 py-4">
        {loading && !content ? (
          <div className="space-y-3">
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        ) : content ? (
          <div className="prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-primary">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        )}
      </div>
    </div>
  );
}
