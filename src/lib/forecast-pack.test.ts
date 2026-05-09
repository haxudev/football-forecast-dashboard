import { describe, expect, it } from 'vitest';
import { parseForecastPackV2, ScenarioId } from './forecast-pack';
import { parseFixturesFile, sortFixtures } from './fixtures';
import { parseSentimentList, filterByEnabledCompetitions } from './sentiment';
import { derivePlayerBadge, type PlayerBadgeKind } from './playerBadge';
import type { PlayerSlim } from './forecast-pack';

// ============================================================================
// L1-01 ~ L1-13 forecast-pack-v2 zod
// ============================================================================
const minPack = {
  schema_version: 'forecast-pack-v2',
  pack_version: 'p2.1.0',
  match_id: 'fx_pl_2025_26_001_liv_che',
  competition_id: 'premier_league',
  season_id: 'pl:2025-26',
  matchday: 1,
  kickoff_utc: '2025-08-15T19:00:00Z',
  fixture_status: 'SCHEDULED',
  home: { team_id: 't_liv', name: 'Liverpool', name_zh: '利物浦', short_name_zh: '利物浦' },
  away: { team_id: 't_che', name: 'Chelsea', name_zh: '切尔西', short_name_zh: '切尔西' },
  venue: { name: 'Anfield', name_zh: '安菲尔德', city: 'Liverpool' },
  model_version: 'pl_elo_poisson_v2@p5s5',
  generated_at: '2025-08-14T10:00:00Z',
  data_truth_mode: 'SAMPLE_ONLY',
  warnings: [],
  dimension_status: {
    dim_1_outcome: { status: 'STUB', tier: 'P0' },
    dim_2_xg: { status: 'STUB', tier: 'P0' },
    dim_3_form: { status: 'STUB', tier: 'P0' },
    dim_4_player_availability: { status: 'STUB', tier: 'P0' },
    dim_5_h2h: { status: 'STUB', tier: 'P0' },
    dim_6_fatigue: { status: 'MISSING', tier: 'P1' },
    dim_7_tactical: { status: 'MISSING', tier: 'P1' },
    dim_8_referee: { status: 'MISSING', tier: 'P1' },
    dim_9_odds_diff: { status: 'MISSING', tier: 'P1' },
    dim_10_scenario: { status: 'STUB', tier: 'P1' },
  },
  win_draw_loss: { p_home: 0.4, p_draw: 0.3, p_away: 0.3 },
  scoreline_distribution: {
    matrix: [
      [0.05, 0.05, 0.03, 0.02, 0.01, 0.01],
      [0.07, 0.08, 0.04, 0.02, 0.01, 0.01],
      [0.06, 0.07, 0.03, 0.02, 0.01, 0.0],
      [0.04, 0.04, 0.02, 0.01, 0.01, 0.0],
      [0.02, 0.02, 0.01, 0.01, 0.0, 0.0],
      [0.01, 0.01, 0.0, 0.0, 0.0, 0.0],
    ],
    top3: [
      { home_goals: 1, away_goals: 1, probability: 0.08 },
      { home_goals: 2, away_goals: 1, probability: 0.07 },
      { home_goals: 1, away_goals: 0, probability: 0.07 },
    ],
  },
  expected_goals: { xg_home: 1.6, xg_away: 1.2 },
};

describe('forecast-pack-v2 zod', () => {
  it('L1-01 parses minimal valid pack', () => {
    const p = parseForecastPackV2(minPack);
    expect(p.match_id).toBe('fx_pl_2025_26_001_liv_che');
  });

  it('L1-02 rejects probabilities not summing to 1', () => {
    const bad = { ...minPack, win_draw_loss: { p_home: 0.5, p_draw: 0.4, p_away: 0.5 } };
    expect(() => parseForecastPackV2(bad)).toThrow();
  });

  it('L1-03 STUB tolerance 0.40/0.30/0.30 sums to 1', () => {
    const p = parseForecastPackV2(minPack);
    expect(p.win_draw_loss.p_home + p.win_draw_loss.p_draw + p.win_draw_loss.p_away).toBeCloseTo(1, 3);
  });

  it('L1-04 dimension_status requires all 10 keys (NIT-3: dim_4_player_availability)', () => {
    const bad: Record<string, unknown> = JSON.parse(JSON.stringify(minPack));
    const dim = bad.dimension_status as Record<string, unknown>;
    delete dim.dim_4_player_availability;
    expect(() => parseForecastPackV2(bad)).toThrow();
  });

  it('L1-05 DimStatus.status enum 4 态', () => {
    for (const s of ['READY', 'STUB', 'MISSING', 'DEGRADED']) {
      const ok = JSON.parse(JSON.stringify(minPack));
      ok.dimension_status.dim_1_outcome = { status: s, tier: 'P0' };
      expect(() => parseForecastPackV2(ok)).not.toThrow();
    }
    const bad = JSON.parse(JSON.stringify(minPack));
    bad.dimension_status.dim_1_outcome = { status: 'OK', tier: 'P0' };
    expect(() => parseForecastPackV2(bad)).toThrow();
  });

  it('L1-06 scenario_id 6 项 enum 字面 1:1', () => {
    expect(ScenarioId.options).toEqual([
      'early_concede_home_15min',
      'early_concede_away_15min',
      'red_card_home',
      'red_card_away',
      'lead_at_ht_home',
      'lead_at_ht_away',
    ]);
  });

  it('L1-07 data_truth_mode rejects deprecated SAMPLE', () => {
    const bad = { ...minPack, data_truth_mode: 'SAMPLE' };
    expect(() => parseForecastPackV2(bad)).toThrow();
  });

  it('L1-08 fixture_status 7 项 enum', () => {
    for (const s of ['SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELED']) {
      const ok = { ...minPack, fixture_status: s };
      expect(() => parseForecastPackV2(ok)).not.toThrow();
    }
    const bad = { ...minPack, fixture_status: 'PRE' };
    expect(() => parseForecastPackV2(bad)).toThrow();
  });

  it('L1-09 absentees.reason includes DOUBTFUL_ABSENT (NIT-1)', () => {
    const withAbsentees = JSON.parse(JSON.stringify(minPack));
    withAbsentees.player_availability = {
      home: {
        lineup: { method: 'last_5_mode', starting_xi: [] },
        absentees: [
          {
            player_id: 'p_x',
            name: 'Player X',
            reason: 'DOUBTFUL_ABSENT',
          },
        ],
      },
      away: {
        lineup: { method: 'last_5_mode', starting_xi: [] },
        absentees: [],
      },
      impact_coefficient: { home: -0.05, away: 0 },
      data_truth_mode: 'REAL_DERIVED',
    };
    expect(() => parseForecastPackV2(withAbsentees)).not.toThrow();
  });

  it('L1-10 injury_status UPPER_SNAKE only (NIT-2)', () => {
    const ok = JSON.parse(JSON.stringify(minPack));
    ok.player_availability = {
      home: {
        lineup: {
          method: 'last_5_mode',
          starting_xi: [
            { player_id: 'p1', name: 'P1', injury_status: 'INJURED' },
          ],
        },
        absentees: [],
      },
      away: { lineup: { method: 'last_5_mode', starting_xi: [] }, absentees: [] },
      impact_coefficient: { home: 0, away: 0 },
    };
    expect(() => parseForecastPackV2(ok)).not.toThrow();

    const bad = JSON.parse(JSON.stringify(ok));
    bad.player_availability.home.lineup.starting_xi[0].injury_status = 'injured';
    expect(() => parseForecastPackV2(bad)).toThrow();
  });

  it('L1-12 player_availability.data_truth_mode 6 项全集 (M-4)', () => {
    for (const m of ['REAL', 'REAL_DERIVED', 'MIXED', 'FIXTURE_FALLBACK', 'SAMPLE_ONLY', 'UNKNOWN']) {
      const ok = JSON.parse(JSON.stringify(minPack));
      ok.player_availability = {
        home: { lineup: { method: 'default_xi', starting_xi: [] }, absentees: [] },
        away: { lineup: { method: 'default_xi', starting_xi: [] }, absentees: [] },
        impact_coefficient: { home: 0, away: 0 },
        data_truth_mode: m,
      };
      expect(() => parseForecastPackV2(ok)).not.toThrow();
    }
  });

  it('L1-13 xg_breakdown_home 5 段细分 (M-3)', () => {
    const ok = JSON.parse(JSON.stringify(minPack));
    ok.expected_goals.xg_breakdown_home = {
      xg_open_play: 0.8,
      xg_set_piece: 0.4,
      xg_penalty: 0.0,
      xg_counter_attack: 0.3,
      xg_other: 0.1,
    };
    expect(() => parseForecastPackV2(ok)).not.toThrow();
  });
});

// ============================================================================
// L1-11 playerBadge 6 case 短路
// ============================================================================
describe('playerBadge derive (6 状态短路)', () => {
  const base: PlayerSlim = { player_id: 'p', name: 'P' };

  const cases: Array<[string, Partial<PlayerSlim>, PlayerBadgeKind]> = [
    ['FIT default', {}, 'FIT'],
    ['RED_SUSPENDED', { red_card_suspension_active: true, injury_status: 'INJURED' }, 'RED_SUSPENDED'],
    ['INJURED', { injury_status: 'INJURED', international_duty_conflict: true }, 'INJURED'],
    ['INTL_DUTY', { international_duty_conflict: true, yellow_card_count: 5 }, 'INTL_DUTY'],
    ['YELLOW_WATCH', { yellow_card_count: 4, doubtful: true }, 'YELLOW_WATCH'],
    ['DOUBTFUL flag', { doubtful: true }, 'DOUBTFUL'],
    ['DOUBTFUL injury_status', { injury_status: 'DOUBTFUL' }, 'DOUBTFUL'],
    ['DOUBTFUL low start_probability', { start_probability: 0.3 }, 'DOUBTFUL'],
    ['FIT high start_probability', { start_probability: 0.9 }, 'FIT'],
  ];

  for (const [label, patch, expected] of cases) {
    it(`L1-11 ${label}`, () => {
      expect(derivePlayerBadge({ ...base, ...patch })).toBe(expected);
    });
  }
});

// ============================================================================
// L1-14 ~ L1-16 fixtures + sentiment
// ============================================================================
describe('fixtures schema + sortFixtures (L1-14, L1-16)', () => {
  const fixturesRaw = {
    schema_version: 'fixtures-v1',
    generated_at: '2025-08-14T10:00:00Z',
    competition_id: 'premier_league',
    season_id: 'pl:2025-26',
    fixtures: [
      {
        match_id: 'fx_pl_2025_26_002',
        competition_id: 'premier_league',
        season_id: 'pl:2025-26',
        kickoff_utc: '2025-08-16T15:00:00Z',
        fixture_status: 'SCHEDULED',
        home: { team_id: 'a', name: 'A' },
        away: { team_id: 'b', name: 'B' },
        venue: { name: 'V' },
      },
      {
        match_id: 'fx_pl_2025_26_001',
        competition_id: 'premier_league',
        season_id: 'pl:2025-26',
        kickoff_utc: '2025-08-15T19:00:00Z',
        fixture_status: 'SCHEDULED',
        home: { team_id: 'c', name: 'C' },
        away: { team_id: 'd', name: 'D' },
        venue: { name: 'V2' },
      },
    ],
  };

  it('L1-14 parses fixtures-v1', () => {
    const f = parseFixturesFile(fixturesRaw);
    expect(f.fixtures).toHaveLength(2);
  });

  it('L1-16 sortFixtures: kickoff_utc ASC + match_id ASC tiebreak', () => {
    const f = parseFixturesFile(fixturesRaw);
    const sorted = sortFixtures(f.fixtures);
    expect(sorted.map((r) => r.match_id)).toEqual([
      'fx_pl_2025_26_001',
      'fx_pl_2025_26_002',
    ]);
  });

  it('L1-16b tiebreak by match_id when kickoff equal', () => {
    const same = parseFixturesFile({
      ...fixturesRaw,
      fixtures: [
        { ...fixturesRaw.fixtures[0], match_id: 'fx_pl_2025_26_zzz', kickoff_utc: '2025-08-15T19:00:00Z' },
        { ...fixturesRaw.fixtures[1], match_id: 'fx_pl_2025_26_aaa', kickoff_utc: '2025-08-15T19:00:00Z' },
      ],
    });
    const sorted = sortFixtures(same.fixtures);
    expect(sorted[0].match_id).toBe('fx_pl_2025_26_aaa');
  });
});

describe('sentiment schema + filter (L1-15)', () => {
  const raw = {
    schema_version: 'sentiment-list-v1',
    generated_at: '2025-08-14T10:00:00Z',
    items: [
      {
        item_id: 's1',
        captured_at: '2025-08-14T09:00:00Z',
        competition_id: 'premier_league',
        title: 'PL news',
        source: 'theguardian',
        url: 'https://example.com/1',
      },
      {
        item_id: 's2',
        captured_at: '2025-08-14T08:00:00Z',
        competition_id: 'champions_league',
        title: 'CL news',
        source: 'bbc',
        url: 'https://example.com/2',
      },
      {
        item_id: 's3',
        captured_at: '2025-08-14T07:00:00Z',
        competition_id: 'other',
        title: 'Other',
        source: 'twitter',
        url: 'https://example.com/3',
      },
    ],
  };

  it('L1-15 parses sentiment-list-v1', () => {
    const s = parseSentimentList(raw);
    expect(s.items).toHaveLength(3);
  });

  it('L1-15 filterByEnabledCompetitions PL-only', () => {
    const s = parseSentimentList(raw);
    const filtered = filterByEnabledCompetitions(s.items, ['premier_league']);
    expect(filtered.map((i) => i.item_id)).toEqual(['s1']);
  });

  it('L1-15 world_cup id 映射 world_cup_2026', () => {
    const wc = parseSentimentList({
      ...raw,
      items: [
        { ...raw.items[0], item_id: 'w', competition_id: 'world_cup_2026', title: 'WC' },
      ],
    });
    const filtered = filterByEnabledCompetitions(wc.items, ['world_cup']);
    expect(filtered.map((i) => i.item_id)).toEqual(['w']);
  });
});
