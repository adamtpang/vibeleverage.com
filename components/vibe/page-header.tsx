import { VibeGlyph } from "@/components/lever-mark";

/** Shared eyebrow + title + description block, matching the homepage's reveal-staggered header pattern. */
export function VibePageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <>
      <p className="reveal label flex items-center gap-2 text-[0.7rem] text-lever" style={{ animationDelay: "0ms" }}>
        <VibeGlyph className="text-lever" />
        {eyebrow}
      </p>
      <h1
        className="reveal mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        style={{ animationDelay: "80ms" }}
      >
        {title}
      </h1>
      <p
        className="reveal mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground"
        style={{ animationDelay: "160ms" }}
      >
        {description}
      </p>
    </>
  );
}
