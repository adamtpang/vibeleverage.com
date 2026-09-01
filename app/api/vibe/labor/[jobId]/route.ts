import { loadJob } from "@/lib/vibe/labor-jobs";

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
