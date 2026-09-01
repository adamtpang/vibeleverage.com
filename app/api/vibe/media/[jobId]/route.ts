import { applyMediaJobCuts, loadJob } from "@/lib/vibe/media-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  const job = loadJob(params.jobId);
  if (!job) return Response.json({ error: "Job not found." }, { status: 404 });
  return Response.json({ job });
}

// The human-approval step. Never called automatically, only from a user
// action in the review UI, and only with the cut list they actually saw.
export async function POST(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const cuts = (body as { cuts?: unknown }).cuts;
  if (!Array.isArray(cuts)) {
    return Response.json({ error: "cuts array is required." }, { status: 400 });
  }

  try {
    const job = await applyMediaJobCuts(params.jobId, cuts);
    return Response.json({ job });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to apply cuts." },
      { status: 400 }
    );
  }
}
