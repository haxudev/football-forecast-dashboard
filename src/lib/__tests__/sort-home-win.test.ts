// src/lib/__tests__/sort-home-win.test.ts
// Phase B (B-5) — sortFixturesByHomeWinDesc 单测。
import { describe, expect, it } from 'vitest';
import { sortFixturesByHomeWinDesc, type FixtureRow } from '../fixtures';

function row(id: string, kickoff: string, pHome: number | null): FixtureRow {
  const base: any = {
    match_id: id,
    competition_id: 'premier_league',
    season_id: 'pl:2025-26',
    matchday: 1,
    stage: null,
    kickoff_utc: kickoff,
    fixture_status: 'SCHEDULED',
    home: { team_id: 'club:eng:home', name: 'Home', name_zh: '主队', short_name_zh: '主队' },
    away: { team_id: 'club:eng:away', name: 'Away', name_zh: '客队', short_name_zh: '客队' },
  };
  if (pHome != null) {
    base.prediction_summary = { p_home: pHome, p_draw: 0.25, p_away: Math.max(0, 1 - pHome - 0.25) };
  }
  return base as FixtureRow;
}

describe('sortFixturesByHomeWinDesc (Phase B B-5)', () => {
  it('orders by p_home DESC, NaN/missing → bottom', () => {
    const a = row('m1', '2025-08-15T19:00:00Z', 0.42);
    const b = row('m2', '2025-08-23T16:30:00Z', 0.62);
    const c = row('m3', '2025-08-30T14:00:00Z', null);
    const d = row('m4', '2025-09-13T14:00:00Z', 0.48);
    const sorted = sortFixturesByHomeWinDesc([a, b, c, d]);
    expect(sorted.map((r) => r.match_id)).toEqual(['m2', 'd' === 'd' ? 'm4' : 'm4', 'm1', 'm3']);
  });

  it('tiebreaks by kickoff ASC then match_id ASC when p_home equal', () => {
    const a = row('m_b', '2025-08-15T19:00:00Z', 0.50);
    const b = row('m_a', '2025-08-23T16:30:00Z', 0.50);
    const c = row('m_c', '2025-08-23T16:30:00Z', 0.50);
    const sorted = sortFixturesByHomeWinDesc([a, b, c]);
    // p_home all equal → kickoff_utc ASC tiebreak: a (08-15) first
    expect(sorted[0].match_id).toBe('m_b');
    // among b/c (same kickoff), match_id ASC: m_a < m_c
    expect(sorted[1].match_id).toBe('m_a');
    expect(sorted[2].match_id).toBe('m_c');
  });

  it('does not mutate input array', () => {
    const input = [row('m1', '2025-08-15T19:00:00Z', 0.4), row('m2', '2025-08-16T19:00:00Z', 0.7)];
    const before = input.map((r) => r.match_id);
    sortFixturesByHomeWinDesc(input);
    expect(input.map((r) => r.match_id)).toEqual(before);
  });
});
