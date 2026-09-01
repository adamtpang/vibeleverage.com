"use client";

interface ApprovalCardProps {
  title: string;
  subtitle?: string;
  body: React.ReactNode;
  status: "pending" | "approved" | "skipped";
  onApprove: () => void;
  onSkip: () => void;
  disabled?: boolean;
}

/**
 * One proposed action, reviewed on its own. The approval-card upgrade:
 * actions surface individually as you'd review them, not folded into a
 * flat checkbox list at the end. Modeled on the "shell commands, file
 * edits, and questions surface as inline cards, Allow/Deny in chat"
 * pattern, scoped to what Vibe actually proposes: cuts and diffs.
 */
export function ApprovalCard({
  title,
  subtitle,
  body,
  status,
  onApprove,
  onSkip,
  disabled,
}: ApprovalCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        status === "approved"
          ? "border-lever/50 bg-lever/5"
          : status === "skipped"
            ? "border-border bg-transparent opacity-50"
            : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {subtitle && <p className="mt-0.5 font-mono text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onApprove}
            disabled={disabled}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              status === "approved"
                ? "bg-lever text-background"
                : "border border-border text-muted-foreground hover:border-lever hover:text-foreground"
            }`}
          >
            {status === "approved" ? "Approved" : "Approve"}
          </button>
          <button
            onClick={onSkip}
            disabled={disabled}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              status === "skipped"
                ? "bg-destructive text-destructive-foreground"
                : "border border-border text-muted-foreground hover:border-destructive hover:text-foreground"
            }`}
          >
            {status === "skipped" ? "Skipped" : "Skip"}
          </button>
        </div>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{body}</div>
    </div>
  );
}
