"use client";

import * as React from "react";

import {
  LEGACY_STORAGE_KEYS,
  STORAGE_KEYS,
  type TransferableStorageKey,
} from "@/lib/storage-keys";

const NEW_ORIGIN = "https://vibeleverage.com";
const OLD_HOSTS = new Set(["archimedes.life", "www.archimedes.life"]);
const TRANSFERABLE_KEYS: TransferableStorageKey[] = [
  "answers",
  "scores",
  "completedPlays",
  "history",
  "project",
];

function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/#diagnostic";
  return value;
}

export default function MigrationPage() {
  const [status, setStatus] = React.useState("Moving your leverage profile...");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = safeNextPath(params.get("next"));

    try {
      if (OLD_HOSTS.has(window.location.hostname)) {
        const payload = Object.fromEntries(
          TRANSFERABLE_KEYS.flatMap((key) => {
            const value =
              localStorage.getItem(STORAGE_KEYS[key]) ??
              localStorage.getItem(LEGACY_STORAGE_KEYS[key]);
            return value === null ? [] : [[key, value]];
          })
        );
        const fragment = encodeURIComponent(JSON.stringify(payload));
        window.location.replace(
          `${NEW_ORIGIN}/migrate?next=${encodeURIComponent(next)}#${fragment}`
        );
        return;
      }

      if (window.location.hash.length > 1) {
        const payload = JSON.parse(
          decodeURIComponent(window.location.hash.slice(1))
        ) as Partial<Record<TransferableStorageKey, unknown>>;

        for (const key of TRANSFERABLE_KEYS) {
          const value = payload[key];
          if (typeof value === "string") {
            const migratedValue =
              key === "project" && value === "archimedes.life"
                ? "vibeleverage.com"
                : value;
            localStorage.setItem(STORAGE_KEYS[key], migratedValue);
          }
        }
      }

      window.history.replaceState(null, "", `/migrate?next=${encodeURIComponent(next)}`);
      window.location.replace(next);
    } catch {
      setStatus("Your saved profile could not be moved. Continue to Vibe Leverage and rerun the audit.");
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase text-lever">Vibe Leverage</p>
        <h1 className="mt-4 text-2xl font-semibold">{status}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your evidence stays in your browser. API keys are never transferred.
        </p>
      </div>
    </main>
  );
}
