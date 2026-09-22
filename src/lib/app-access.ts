/** Client-side app unlock (hardcoded gate). */
export const APP_PASSWORD = "ecom";
export const ACCESS_STORAGE_KEY = "mergelabel-access";
export const ACCESS_VALID_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export type AccessRecord = {
  expiresAt: number;
};

export function isAccessValid(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as AccessRecord;
    return (
      typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export function createAccessRecord(): AccessRecord {
  return { expiresAt: Date.now() + ACCESS_VALID_MS };
}
