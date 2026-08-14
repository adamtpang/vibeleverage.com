import { listJobs, startLaborJob } from "@/lib/fulcrum/labor-jobs";

// Fulcrum Labor shells out to the local `claude` CLI, same subscription as
// Media, Code, and Capital, not a metered ANTHROPIC_API_KEY. Local-dev-only
// for the same reason as the others: the CLI binary itself is local.
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

  const task = (body as { task?: unknown }).task;
  if (typeof task !== "string" || !task.trim()) {
    return Response.json({ error: "task is required." }, { status: 400 });
  }

  try {
    const job = startLaborJob(task.trim());
    return Response.json({ job });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to start job." },
      { status: 400 }
    );
  }
}
