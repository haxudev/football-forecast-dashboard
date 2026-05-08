export const STALE_HOURS = 24;
export const DISABLE_HOURS = 72;

export function packAgeHours(generatedAt: string, now: Date = new Date()): number {
  const generated = new Date(generatedAt).getTime();
  if (Number.isNaN(generated)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (now.getTime() - generated) / 3_600_000);
}

export function isPackStale(generatedAt: string, now?: Date): boolean {
  return packAgeHours(generatedAt, now) > STALE_HOURS;
}

export function isPredictorDisabled(generatedAt: string, now?: Date): boolean {
  return packAgeHours(generatedAt, now) > DISABLE_HOURS;
}

export function packAgeLabel(generatedAt: string, now: Date = new Date()): string {
  const hours = packAgeHours(generatedAt, now);
  if (!Number.isFinite(hours)) return 'unknown';
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  if (hours < 48) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
