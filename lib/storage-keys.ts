export const STORAGE_KEYS = {
  answers: "vibeleverage:evidence:v2",
  scores: "vibeleverage:scores:v1",
  completedPlays: "vibeleverage:plays:v1",
  history: "vibeleverage:history:v1",
  project: "vibeleverage:project:v1",
  byok: "vibeleverage:byok:v1",
} as const;

export const LEGACY_STORAGE_KEYS = {
  answers: "archimedes:evidence:v2",
  scores: "archimedes:scores:v1",
  completedPlays: "archimedes:plays:v1",
  history: "archimedes:history:v1",
  project: "archimedes:project:v1",
  byok: "archimedes:byok:v1",
} as const;

export type TransferableStorageKey = Exclude<keyof typeof STORAGE_KEYS, "byok">;

export function readStoredValue(
  key: keyof typeof STORAGE_KEYS,
  migrateLegacy = true
): string | null {
  const current = localStorage.getItem(STORAGE_KEYS[key]);
  if (current !== null || !migrateLegacy) return current;

  const legacy = localStorage.getItem(LEGACY_STORAGE_KEYS[key]);
  if (legacy !== null) localStorage.setItem(STORAGE_KEYS[key], legacy);
  return legacy;
}
