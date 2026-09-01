import { jobFile, loadJob } from "@/lib/vibe/capital-jobs";
import { jobEventStream } from "@/lib/vibe/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  return jobEventStream(jobFile(params.jobId), () => loadJob(params.jobId));
}
