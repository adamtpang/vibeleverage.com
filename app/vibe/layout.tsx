"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { VibeGlyph } from "@/components/lever-mark";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/vibe/code", label: "Code" },
  { href: "/vibe/media", label: "Media" },
  { href: "/vibe/capital", label: "Capital" },
  { href: "/vibe/labor", label: "Labor" },
] as const;

export default function VibeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-[0.035]" />
      </div>

      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center gap-1 px-6 py-3">
          <Link
            href="/"
            className="mr-5 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <VibeGlyph className="text-lever" />
            vibe leverage
          </Link>
          {TABS.map((tab) => {
            const active = pathname?.startsWith(tab.href) ?? false;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                {tab.label}
                {active && <span aria-hidden className="absolute inset-x-3 -bottom-[13px] h-px bg-lever" />}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </div>
  );
}
