import { cn } from "@/lib/utils";

/**
 * The single generated motif for the whole site: a beam balanced on a fulcrum.
 * The long arm (effort) carries a small input; the short arm lifts a large load.
 * The beam slowly works up and down: small effort, enormous load.
 */
export function LeverMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 260"
      role="img"
      aria-label="A lever balanced on a fulcrum. A small effort on the long arm lifts a large load on the short arm."
      className={cn("h-auto w-full", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ground line */}
      <line
        x1="32"
        y1="212"
        x2="408"
        y2="212"
        className="stroke-muted-foreground/30"
        strokeWidth="1.5"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      {/* plumb line down through the pivot */}
      <line
        x1="264"
        y1="150"
        x2="264"
        y2="212"
        className="stroke-muted-foreground/25"
        strokeWidth="1"
        strokeDasharray="3 5"
      />
      {/* fulcrum */}
      <path
        d="M264 150 L293 211 L235 211 Z"
        className="fill-lever/10 stroke-lever"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />

      {/* the working beam: load + effort ride with it */}
      <g className="lever-beam">
        <line
          x1="58"
          y1="150"
          x2="386"
          y2="150"
          className="stroke-lever"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* large load on the short arm */}
        <rect
          x="362"
          y="111"
          width="40"
          height="39"
          rx="3"
          className="fill-lever/15 stroke-lever"
          strokeWidth="2"
        />
        {/* small effort handle on the long arm */}
        <circle
          cx="58"
          cy="150"
          r="8.5"
          className="fill-background stroke-lever"
          strokeWidth="2.5"
        />
        {/* downward effort arrow */}
        <path
          d="M58 118 L58 136 M51.5 129.5 L58 136 L64.5 129.5"
          className="stroke-lever"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* static labels under each arm */}
      <text
        x="58"
        y="240"
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        style={{ fontSize: "9px", letterSpacing: "0.18em" }}
      >
        EFFORT
      </text>
      <text
        x="382"
        y="240"
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        style={{ fontSize: "9px", letterSpacing: "0.18em" }}
      >
        LOAD
      </text>
    </svg>
  );
}

/** Small fulcrum triangle, reused as a marker throughout the page. */
export function VibeGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 15"
      aria-hidden="true"
      className={cn("h-2.5 w-3 shrink-0", className)}
      fill="none"
    >
      <path d="M9 1 L17 14 H1 Z" fill="currentColor" />
    </svg>
  );
}
