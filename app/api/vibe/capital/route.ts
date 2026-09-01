import { listJobs, startCapitalJob } from "@/lib/vibe/capital-jobs";

// Vibe Capital shells out to the local `claude` CLI for research, same as
// Vibe Media and Code. Runs fine on Vercel's Node runtime in principle
// (no Whisper/ffmpeg dependency here), but the `claude` CLI itself is a
// local subscription-auth binary, so this stays local-dev-only for now too.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ jobs: listJobs() });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { subject, context } = body as { subject?: unknown; context?: unknown };
  if (typeof subject !== "string" || !subject.trim()) {
    return Response.json({ error: "subject is required." }, { status: 400 });
  }

  try {
    const job = startCapitalJob(subject.trim(), typeof context === "string" ? context.trim() : "");
    return Response.json({ job });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to start job." },
      { status: 400 }
    );
  }
}
