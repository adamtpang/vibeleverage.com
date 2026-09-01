const DOT_TONE = {
  active: "bg-lever animate-pulse",
  done: "bg-lever",
  error: "bg-destructive",
} as const;

/** Shared job-status card: a live tone dot, the phase label, optional meta, error, and a scrollable log tail. */
export function VibeStatusCard({
  label,
  tone,
  meta,
  error,
  log,
}: {
  label: string;
  tone: keyof typeof DOT_TONE;
  meta?: React.ReactNode;
  error?: string;
  log: string[];
}) {
  return (
    <div className="reveal rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${DOT_TONE[tone]}`} />
          {label}
        </span>
        {meta}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
        {log.slice(-14).join("\n")}
      </pre>
    </div>
  );
}
