import { loadJob, mergeCodeJob } from "@/lib/fulcrum/code-jobs";

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

// The human-approval step: merges the reviewed branch locally. Never pushes,
// never deploys. Only called from an explicit user action after reading the diff.
export async function POST(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await mergeCodeJob(params.jobId);
    return Response.json({ job });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to merge." },
      { status: 400 }
    );
  }
}
