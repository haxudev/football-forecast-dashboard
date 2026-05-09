// src/lib/__tests__/data-fixture.test.ts
// L1 + L2 — fixture data loading + view sample integration.
import { describe, expect, it } from 'vitest';
import { tryLoadFixtures, listMatchPackIds, tryLoadMatchPack, tryLoadSentimentList, findFixtureRow } from '../data-fixture';
import { sortFixtures, isUpcomingFixture } from '../fixtures';
import { filterByEnabledCompetitions } from '../sentiment';

describe('data-fixture loaders (L1-14, L2 sample integration)', () => {
  it('loads fixtures.json (≥5)', () => {
    const f = tryLoadFixtures();
    expect(f).not.toBeNull();
    expect(f!.fixtures.length).toBeGreaterThanOrEqual(5);
  });

  it('listMatchPackIds (≥5 sample packs)', () => {
    const ids = listMatchPackIds();
    expect(ids.length).toBeGreaterThanOrEqual(5);
  });

  it('tryLoadMatchPack returns null for unknown id', () => {
    expect(tryLoadMatchPack('fx_nonexistent_99999')).toBeNull();
  });

  it('findFixtureRow returns row for known sample', () => {
    const row = findFixtureRow('fx_pl_2025_26_001_liv_bou');
    expect(row).not.toBeNull();
    expect(row!.home.short_name_zh).toBe('利物浦');
  });

  it('sortFixtures returns kickoff_utc ASC + match_id ASC tiebreak (G-A2 / T-5)', () => {
    const f = tryLoadFixtures()!;
    const sorted = sortFixtures(f.fixtures);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const cur = sorted[i];
      const cmp =
        prev.kickoff_utc < cur.kickoff_utc
          ? -1
          : prev.kickoff_utc > cur.kickoff_utc
            ? 1
            : prev.match_id < cur.match_id
              ? -1
              : 1;
      expect(cmp).toBeLessThanOrEqual(0);
    }
  });

  it('three entries (overview / picker / single match) byte-equal (G-A2)', () => {
    // 三入口都通过 sortFixtures(f.fixtures) 渲染；比较三次结果是否完全一致。
    const f = tryLoadFixtures()!;
    const a = JSON.stringify(sortFixtures(f.fixtures));
    const b = JSON.stringify(sortFixtures(f.fixtures));
    const c = JSON.stringify(sortFixtures(f.fixtures.slice().reverse()));
    expect(a).toBe(b);
    expect(a).toBe(c); // 即使输入颠倒也应稳定
  });

  it('isUpcomingFixture filters SCHEDULED/TIMED', () => {
    const f = tryLoadFixtures()!;
    const upcoming = f.fixtures.filter(isUpcomingFixture);
    for (const r of upcoming) {
      expect(['SCHEDULED', 'TIMED']).toContain(r.fixture_status);
    }
  });
});

describe('match-pack zod 6-state players (T-4 / G-A5)', () => {
  it('first sample pack has 6 状态混合 players', () => {
    const pack = tryLoadMatchPack('fx_pl_2025_26_001_liv_bou');
    expect(pack).not.toBeNull();
    const xi = pack!.player_availability!.home.lineup.starting_xi;
    // 至少 1 名 RED_SUSPENDED + 1 名 INJURED + 1 名 INTL_DUTY + 1 名 YELLOW + 1 名 DOUBTFUL
    const redSus = xi.filter((p) => p.red_card_suspension_active === true).length;
    const inj = xi.filter((p) => p.injury_status === 'INJURED').length;
    const intl = xi.filter((p) => p.international_duty_conflict === true).length;
    const yellow = xi.filter((p) => (p.yellow_card_count ?? 0) >= 4).length;
    const doubt = xi.filter((p) => p.doubtful === true || p.injury_status === 'DOUBTFUL').length;
    expect(redSus).toBeGreaterThanOrEqual(1);
    expect(inj).toBeGreaterThanOrEqual(1);
    expect(intl).toBeGreaterThanOrEqual(1);
    expect(yellow).toBeGreaterThanOrEqual(1);
    expect(doubt).toBeGreaterThanOrEqual(1);
  });

  it('absentees include DOUBTFUL_ABSENT (NIT-1 fix)', () => {
    const pack = tryLoadMatchPack('fx_pl_2025_26_001_liv_bou')!;
    const reasons = pack.player_availability!.home.absentees.map((a) => a.reason);
    expect(reasons).toContain('DOUBTFUL_ABSENT');
  });
});

describe('scenario_simulation 6 项字面 (G-A4 / T-3)', () => {
  it('每个 sample pack 的 scenarios 都恰好 6 项且 id 字面正确', () => {
    const ids = listMatchPackIds();
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) {
      const pack = tryLoadMatchPack(id)!;
      const ss = pack.scenario_simulation;
      if (!ss) continue;
      expect(ss.scenarios).toHaveLength(6);
      expect(ss.scenarios.map((s) => s.scenario_id).sort()).toEqual([
        'early_concede_away_15min',
        'early_concede_home_15min',
        'lead_at_ht_away',
        'lead_at_ht_home',
        'red_card_away',
        'red_card_home',
      ]);
    }
  });
});

describe('DimStatus 4 态 (G-A3 / T-2)', () => {
  it('sample packs cover at least READY/STUB/MISSING (DEGRADED on idx=1)', () => {
    const ids = listMatchPackIds();
    const seen = new Set<string>();
    for (const id of ids) {
      const pack = tryLoadMatchPack(id)!;
      for (const v of Object.values(pack.dimension_status)) {
        seen.add(v.status);
      }
    }
    expect(seen.has('STUB')).toBe(true);
    expect(seen.has('MISSING')).toBe(true);
    expect(seen.has('READY')).toBe(true);
    expect(seen.has('DEGRADED')).toBe(true);
  });
});

describe('sentiment competition_id filter (G-A7 / T-6)', () => {
  it('PL-only filter retains only premier_league items', () => {
    const file = tryLoadSentimentList()!;
    expect(file.items.length).toBeGreaterThanOrEqual(6);
    const filtered = filterByEnabledCompetitions(file.items, ['premier_league']);
    expect(filtered.length).toBeGreaterThan(0);
    for (const it of filtered) expect(it.competition_id).toBe('premier_league');
    // 至少存在 1 个 'other' 条目被排除
    const other = file.items.filter((i) => i.competition_id === 'other');
    expect(other.length).toBeGreaterThanOrEqual(1);
  });
});

describe('fixture_status 7 enum chip 渲染来源 (G-A6 / T-7)', () => {
  it('所有 fixture row 均使用 schema enum，禁止 PRE/LIVE/END 旧值', () => {
    const f = tryLoadFixtures()!;
    const allowed = new Set(['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELED']);
    for (const r of f.fixtures) {
      expect(allowed.has(r.fixture_status)).toBe(true);
    }
  });
});
