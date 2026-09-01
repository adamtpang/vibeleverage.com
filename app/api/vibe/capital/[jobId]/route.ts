import { loadJob, saveCapitalDraft } from "@/lib/vibe/capital-jobs";

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

// The human-approval step. Writes the reviewed draft to a local file.
// Never called automatically, and there is no further step after this,
// no send, no execute, that stays entirely outside this app, by design.
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

  const draftDocument = (body as { draftDocument?: unknown }).draftDocument;
  if (typeof draftDocument !== "string" || !draftDocument.trim()) {
    return Response.json({ error: "draftDocument is required." }, { status: 400 });
  }

  try {
    const job = await saveCapitalDraft(params.jobId, draftDocument);
    return Response.json({ job });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to save draft." },
      { status: 400 }
    );
  }
}
