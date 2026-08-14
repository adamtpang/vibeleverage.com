import { listJobs, startMediaJob } from "@/lib/fulcrum/media-jobs";

// Fulcrum Media is local-first: it shells out to podcast-pipeline's Python
// scripts (Whisper transcription, ffmpeg cutting), neither of which run on
// Vercel's serverless Node runtime. This route only works with `next dev`
// against a local machine that has the pipeline installed.
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

  const sourcePath = (body as { sourcePath?: unknown }).sourcePath;
  if (typeof sourcePath !== "string" || !sourcePath.trim()) {
    return Response.json({ error: "sourcePath is required." }, { status: 400 });
  }

  try {
    const job = startMediaJob(sourcePath.trim());
    return Response.json({ job });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to start job." },
      { status: 400 }
    );
  }
}
