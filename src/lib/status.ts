import { format, type Dictionary, type Locale } from './i18n';

export const STALE_HOURS = 24;
export const DISABLE_HOURS = 72;

export function packAgeMinutes(generatedAt: string, now: Date = new Date()): number {
  const ts = new Date(generatedAt).getTime();
  if (Number.isNaN(ts)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (now.getTime() - ts) / 60_000);
}

export function packAgeHours(generatedAt: string, now: Date = new Date()): number {
  return packAgeMinutes(generatedAt, now) / 60;
}

export function isPackStale(generatedAt: string, now?: Date): boolean {
  return packAgeHours(generatedAt, now) > STALE_HOURS;
}

export function isPredictorDisabled(generatedAt: string, now?: Date): boolean {
  return packAgeHours(generatedAt, now) > DISABLE_HOURS;
}

/**
 * Friendly, consumer-grade freshness label.
 * - <1m → 刚刚更新 / Just updated
 * - <30m → X 分钟前
 * - <6h → X 小时前
 * - 6–24h → 数据较旧（X 小时前）
 * - >=24h → 数据明显过期，仅供参考
 * - unknown → null (caller may hide).
 */
export function friendlyFreshness(
  generatedAt: string | undefined,
  t: Dictionary,
  now: Date = new Date(),
): string | null {
  if (!generatedAt) return null;
  const minutes = packAgeMinutes(generatedAt, now);
  if (!Number.isFinite(minutes)) return null;
  if (minutes < 1) return t.common.justUpdated;
  if (minutes < 30) return format(t.common.minutesAgo, { n: Math.floor(minutes) });
  const hours = minutes / 60;
  if (hours < 6) return format(t.common.hoursAgo, { n: Math.floor(hours) });
  if (hours < 24) return format(t.common.hoursAgoStale, { n: Math.floor(hours) });
  return t.common.veryStale;
}

export type MatchStage = 'PRE' | 'LIVE' | 'END';

export interface MatchStageInfo {
  stage: MatchStage;
  /** Friendly subline like "明天 21:00 开赛" / "比赛进行中，第 67 分钟" / "比赛已结束". */
  subline: string;
  /** Localized kickoff date+time (e.g. "2026-06-18 21:00"). */
  kickoffLabel: string | null;
}

/**
 * Decide stage from kickoff_at and optional status / live minute.
 * - now < kickoff → PRE
 * - kickoff ≤ now ≤ kickoff+120m AND status='in_progress' → LIVE
 * - status='finished' OR now > kickoff+150m → END
 */
export function deriveMatchStage(
  kickoffAtUtc: string | undefined,
  options: { status?: string; liveMinute?: number; now?: Date; t: Dictionary; locale: Locale },
): MatchStageInfo {
  const t = options.t;
  const now = options.now ?? new Date();

  if (!kickoffAtUtc) {
    return { stage: 'PRE', subline: '', kickoffLabel: null };
  }
  const ts = new Date(kickoffAtUtc).getTime();
  if (Number.isNaN(ts)) {
    return { stage: 'PRE', subline: '', kickoffLabel: null };
  }

  const kickoffLabel = formatKickoff(kickoffAtUtc, options.locale);
  const minutesUntil = (ts - now.getTime()) / 60_000;
  const minutesSince = -minutesUntil;

  if (options.status === 'finished' || minutesSince > 150) {
    return { stage: 'END', subline: t.common.finished, kickoffLabel };
  }
  if ((options.status === 'in_progress' || (minutesSince >= 0 && minutesSince <= 120))) {
    if (minutesSince >= 0 && minutesSince <= 120) {
      const live = options.liveMinute && options.liveMinute > 0
        ? format(t.common.liveMinute, { n: options.liveMinute })
        : t.common.liveNoMinute;
      return { stage: 'LIVE', subline: live, kickoffLabel };
    }
  }

  // PRE
  return { stage: 'PRE', subline: friendlyKickoffDistance(ts, now, t, options.locale), kickoffLabel };
}

function pad(n: number): string { return String(n).padStart(2, '0'); }

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatKickoff(kickoffAtUtc: string, _locale: Locale): string {
  const d = new Date(kickoffAtUtc);
  if (Number.isNaN(d.getTime())) return '';
  // Use UTC display (we cannot rely on user TZ at static export time);
  // show as `YYYY-MM-DD HH:mm UTC` to be precise but consumer-friendly.
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  return `${date} ${time} UTC`;
}

function friendlyKickoffDistance(kickoffMs: number, now: Date, t: Dictionary, _locale: Locale): string {
  const minutes = (kickoffMs - now.getTime()) / 60_000;
  if (minutes < 60) {
    return format(t.common.minutesLater, { n: Math.max(1, Math.floor(minutes)) });
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return format(t.common.hoursLater, { n: Math.floor(hours) });
  }
  const days = hours / 24;
  if (days < 2) {
    const d = new Date(kickoffMs);
    const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
    if (isSameDay(d, new Date(now.getTime() + 86_400_000))) {
      return format(t.common.tomorrowAt, { time });
    }
  }
  if (days < 14) {
    return format(t.common.hoursLater, { n: Math.floor(hours) });
  }
  return format(t.common.hoursLater, { n: Math.floor(hours) });
}
