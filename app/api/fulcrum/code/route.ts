import { listJobs, startCodeJob } from "@/lib/fulcrum/code-jobs";

// Fulcrum Code is local-first: it runs `git` and the local `claude` CLI
// directly against a repo on this machine. Only works with `next dev`.
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

  const repoPath = (body as { repoPath?: unknown }).repoPath;
  const task = (body as { task?: unknown }).task;
  if (typeof repoPath !== "string" || !repoPath.trim()) {
    return Response.json({ error: "repoPath is required." }, { status: 400 });
  }
  if (typeof task !== "string" || !task.trim()) {
    return Response.json({ error: "task is required." }, { status: 400 });
  }

  try {
    const job = startCodeJob(repoPath.trim(), task.trim());
    return Response.json({ job });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to start job." },
      { status: 400 }
    );
  }
}
