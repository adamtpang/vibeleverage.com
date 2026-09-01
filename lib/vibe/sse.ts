import { watch } from "node:fs";

const TERMINAL_PHASES = new Set(["done", "error", "merged"]);

/**
 * Turns a job-on-disk into a live SSE stream: sends the current state
 * immediately, then again every time the job file changes, until the job
 * reaches a terminal phase or the client disconnects. This is the
 * approval-card upgrade's actual delivery mechanism, replacing client-side
 * polling with real server push, OpenMausBot's "one event bus -> one SSE
 * stream every client folds" pattern, scoped down to one job's own file
 * instead of a shared process-wide event bus.
 */
export function jobEventStream<T extends { phase: string }>(
  filePath: string,
  loadJob: () => T | null
): Response {
  const encoder = new TextEncoder();
  let watcher: ReturnType<typeof watch> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = () => {
        if (closed) return;
        const job = loadJob();
        if (!job) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(job)}\n\n`));
        if (TERMINAL_PHASES.has(job.phase)) finish();
      };

      const finish = () => {
        if (closed) return;
        closed = true;
        watcher?.close();
        try {
          controller.close();
        } catch {
          // already closed by the client aborting, fine
        }
      };

      send();
      try {
        watcher = watch(filePath, () => send());
      } catch {
        // file may not exist yet at the exact instant of connecting; the
        // initial send() above already covered "not found", nothing more to do
      }
    },
    cancel() {
      closed = true;
      watcher?.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
