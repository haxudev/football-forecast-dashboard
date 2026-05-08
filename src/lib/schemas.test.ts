import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  isPackStale,
  isPredictorDisabled,
  friendlyFreshness,
  deriveMatchStage,
} from './status';
import { loadAllPredictions, loadManifest } from './data';
import { getDictionary } from './i18n';

describe('forecast pack schemas', () => {
  it('loads manifest and predictions', () => {
    const manifest = loadManifest();
    expect(manifest.competitions.length).toBeGreaterThan(0);
    expect(loadAllPredictions().length).toBeGreaterThan(0);
  });

  it('applies stale and disabled pack thresholds', () => {
    const now = new Date('2026-05-08T12:00:00Z');
    expect(isPackStale('2026-05-07T11:30:00Z', now)).toBe(true);
    expect(isPredictorDisabled('2026-05-05T11:30:00Z', now)).toBe(true);
    expect(isPredictorDisabled('2026-05-07T11:30:00Z', now)).toBe(false);
  });
});

describe('friendlyFreshness', () => {
  const tZh = getDictionary('zh');
  const tEn = getDictionary('en');

  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('< 1 minute -> just updated', () => {
    const now = new Date('2026-05-08T12:00:30Z');
    expect(friendlyFreshness('2026-05-08T12:00:00Z', tZh, now)).toBe(tZh.common.justUpdated);
    expect(friendlyFreshness('2026-05-08T12:00:00Z', tEn, now)).toBe(tEn.common.justUpdated);
  });

  it('< 30 minutes -> minutes ago', () => {
    const now = new Date('2026-05-08T12:15:00Z');
    expect(friendlyFreshness('2026-05-08T12:00:00Z', tZh, now)).toContain('15');
    expect(friendlyFreshness('2026-05-08T12:00:00Z', tEn, now)).toContain('15');
  });

  it('< 6 hours -> hours ago', () => {
    const now = new Date('2026-05-08T15:00:00Z');
    expect(friendlyFreshness('2026-05-08T12:00:00Z', tZh, now)).toContain('3');
  });

  it('6h-24h -> stale', () => {
    const now = new Date('2026-05-08T22:00:00Z');
    const v = friendlyFreshness('2026-05-08T12:00:00Z', tZh, now);
    expect(v).toContain('10');
  });

  it('>= 24h -> very stale', () => {
    const now = new Date('2026-05-09T13:00:00Z');
    expect(friendlyFreshness('2026-05-08T12:00:00Z', tZh, now)).toBe(tZh.common.veryStale);
  });

  it('hides when generatedAt missing', () => {
    expect(friendlyFreshness(undefined, tZh)).toBeNull();
  });

  it('does not contain forbidden tokens', () => {
    const now = new Date('2026-05-08T12:30:00Z');
    const v = friendlyFreshness('2026-05-08T12:00:00Z', tZh, now);
    expect(v).not.toMatch(/pack\s*age|freshness=|truth=|sha256/i);
  });
});

describe('deriveMatchStage', () => {
  const t = getDictionary('zh');

  it('PRE: now < kickoff', () => {
    const now = new Date('2026-06-18T17:00:00Z');
    const out = deriveMatchStage('2026-06-18T20:00:00Z', { t, locale: 'zh', now });
    expect(out.stage).toBe('PRE');
    expect(out.subline).toMatch(/小时/);
    expect(out.kickoffLabel).toContain('2026-06-18');
  });

  it('LIVE: kickoff ≤ now ≤ kickoff + 120m and status in_progress', () => {
    const kickoff = '2026-06-18T20:00:00Z';
    const now = new Date('2026-06-18T20:45:00Z');
    const out = deriveMatchStage(kickoff, { t, locale: 'zh', now, status: 'in_progress', liveMinute: 45 });
    expect(out.stage).toBe('LIVE');
    expect(out.subline).toContain('45');
  });

  it('END: now > kickoff + 150m', () => {
    const kickoff = '2026-06-18T20:00:00Z';
    const now = new Date('2026-06-18T22:31:00Z');
    const out = deriveMatchStage(kickoff, { t, locale: 'zh', now });
    expect(out.stage).toBe('END');
    expect(out.subline).toBe(t.common.finished);
  });

  it('END when status=finished', () => {
    const kickoff = '2026-06-18T20:00:00Z';
    const now = new Date('2026-06-18T20:30:00Z');
    const out = deriveMatchStage(kickoff, { t, locale: 'zh', now, status: 'finished' });
    expect(out.stage).toBe('END');
  });

  it('graceful degrade: missing kickoff', () => {
    const out = deriveMatchStage(undefined, { t, locale: 'zh' });
    expect(out.stage).toBe('PRE');
    expect(out.kickoffLabel).toBeNull();
  });
});
