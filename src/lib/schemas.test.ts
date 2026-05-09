import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  isPackStale,
  isPredictorDisabled,
  friendlyFreshness,
  deriveMatchStage,
} from './status';
import { loadAllPredictions, loadManifest } from './data';
import { getDictionary } from './i18n';
import { DataQualitySchema, DiagnosticsSchema } from './schemas';

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

describe('DataQualitySchema (P0-4)', () => {
  const validFixture = {
    pack_version: 'p2.1.0',
    schema_version: 'forecast-pack-v1',
    generated_at: '2026-05-09T00:00:00Z',
    warnings: [],
    source_freshness_summary: { worldcup: 'PARTIAL' },
    data_truth_mode_summary: 'MIXED',
    source_freshness: [
      { source_name: 'worldcup', freshness_status: 'PARTIAL', forecast_impact: ['elo'] },
    ],
    fallback_status: [
      { code: 'MIXED', competition_id: 'world_cup_2026', severity: 'warning', detail: 'mixed sources' },
    ],
  };
  it('accepts a valid fixture', () => {
    expect(() => DataQualitySchema.parse(validFixture)).not.toThrow();
  });
  it('rejects an unknown truth_mode', () => {
    expect(() => DataQualitySchema.parse({ ...validFixture, data_truth_mode_summary: 'WHATEVER' })).toThrow();
  });
  it('rejects when data_truth_mode_summary is missing', () => {
    const { data_truth_mode_summary: _omit, ...rest } = validFixture;
    expect(() => DataQualitySchema.parse(rest)).toThrow();
  });
  it('rejects malformed fallback_status entries', () => {
    expect(() => DataQualitySchema.parse({
      ...validFixture,
      fallback_status: [{ code: 123, severity: 'warning', detail: 'x' }],
    })).toThrow();
  });
});

describe('DiagnosticsSchema (P0-4)', () => {
  const validFixture = {
    pack_version: 'p2.1.0',
    schema_version: 'forecast-pack-v1',
    generated_at: '2026-05-09T00:00:00Z',
    warnings: [],
    source_freshness_summary: { worldcup: 'PARTIAL' },
    data_truth_mode_summary: 'MIXED',
    model_registry: [
      { model_version: 'football_ensemble@local', algorithm_layer: 'ensemble', trained_at: '2026-05-09T00:00:00Z', feature_set_hash: 'unknown/no-git' },
    ],
    backtest_summary: {
      run_id: 'p2-local-baseline',
      model_version: 'football_ensemble@abc',
      scope: 'all',
      method: 'sample_walk_forward',
      brier: 0.22,
      log_loss: 1.0,
      calibration_ece: 0.08,
      calibration_curve: [],
      n_matches: 4,
      fold: 0,
      generated_at: '2026-05-09T00:00:00Z',
      code_git_sha: 'unknown/no-git',
    },
    calibration_curve: [],
    feature_importance: [{ name: 'rating_diff', importance: 0.42 }],
  };
  it('accepts a valid fixture', () => {
    expect(() => DiagnosticsSchema.parse(validFixture)).not.toThrow();
  });
  it('rejects non-finite brier', () => {
    expect(() => DiagnosticsSchema.parse({
      ...validFixture,
      backtest_summary: { ...validFixture.backtest_summary, brier: Number.NaN },
    })).toThrow();
  });
  it('rejects when backtest_summary is missing', () => {
    const { backtest_summary: _omit, ...rest } = validFixture;
    expect(() => DiagnosticsSchema.parse(rest)).toThrow();
  });
  it('rejects feature_importance with wrong types', () => {
    expect(() => DiagnosticsSchema.parse({
      ...validFixture,
      feature_importance: [{ name: 'x', importance: 'high' }],
    })).toThrow();
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
