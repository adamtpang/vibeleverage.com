import Link from "next/link";

const TABS = [
  { href: "/fulcrum/code", label: "Code", built: true },
  { href: "/fulcrum/media", label: "Media", built: true },
  { href: "/fulcrum/capital", label: "Capital", built: true },
  { href: "/fulcrum/labor", label: "Labor", built: true },
] as const;

export default function FulcrumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center gap-1 px-6 py-3">
          <Link
            href="/"
            className="mr-4 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            archimedes
          </Link>
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground"
            >
              {tab.label}
              {!tab.built && <span className="ml-1.5 text-[10px] text-muted-foreground/60">spec</span>}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
