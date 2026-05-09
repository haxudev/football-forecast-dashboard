#!/usr/bin/env tsx
/**
 * Phase A — generate sample data per fixtures-v1 / forecast-pack-v2 / sentiment-list-v1.
 * - public/data/fixtures.json （≥5 场，PL）
 * - public/data/match-pack/<match_id>.json （5 场，每场 schema 真相 STUB / DEGRADED / READY 混合）
 * - public/data/sentiment.json （≥6 项，含 PL / CL / WC / other 混合）
 *
 * Source: 现有 public/data/predictions/premier_league.json 5 个 future fixtures。
 * 注意：所有 sample 必须通过 zod parse；sample data_truth_mode='SAMPLE_ONLY' 顶层 + 维度 STUB / MISSING 标记。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { parseFixturesFile, type FixtureRow, type FixturesFile } from '../src/lib/fixtures';
import { parseForecastPackV2, type ForecastPackV2 } from '../src/lib/forecast-pack';
import { parseSentimentList, type SentimentListFile } from '../src/lib/sentiment';

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'public', 'data');
const PACK_DIR = path.join(DATA, 'match-pack');

if (!existsSync(PACK_DIR)) mkdirSync(PACK_DIR, { recursive: true });

// ────────────────────────────────────────────────────────────────────────────
// 5 场 fixture 样本（PL 25/26 第 1-3 轮典型对阵；short_name_zh 来自 0509 site-config 字典）
// ────────────────────────────────────────────────────────────────────────────
type SampleFixture = {
  match_id: string;
  matchday: number;
  kickoff_utc: string;
  fixture_status: 'SCHEDULED' | 'TIMED' | 'FINISHED';
  home: { team_id: string; name: string; name_zh: string; short_name_zh: string };
  away: { team_id: string; name: string; name_zh: string; short_name_zh: string };
  venue: { name: string; name_zh: string; city: string };
  has_pack: boolean;
  prediction_summary?: { p_home: number; p_draw: number; p_away: number };
};

const SAMPLES: SampleFixture[] = [
  {
    match_id: 'fx_pl_2025_26_001_liv_bou',
    matchday: 1,
    kickoff_utc: '2025-08-15T19:00:00Z',
    fixture_status: 'SCHEDULED',
    home: { team_id: 'club:eng:liverpool', name: 'Liverpool FC', name_zh: '利物浦', short_name_zh: '利物浦' },
    away: { team_id: 'club:eng:bournemouth', name: 'AFC Bournemouth', name_zh: '伯恩茅斯', short_name_zh: '伯恩茅斯' },
    venue: { name: 'Anfield', name_zh: '安菲尔德球场', city: 'Liverpool' },
    has_pack: true,
    prediction_summary: { p_home: 0.56, p_draw: 0.26, p_away: 0.18 },
  },
  {
    match_id: 'fx_pl_2025_26_002_ars_che',
    matchday: 2,
    kickoff_utc: '2025-08-23T16:30:00Z',
    fixture_status: 'SCHEDULED',
    home: { team_id: 'club:eng:arsenal', name: 'Arsenal FC', name_zh: '阿森纳', short_name_zh: '阿森纳' },
    away: { team_id: 'club:eng:chelsea', name: 'Chelsea FC', name_zh: '切尔西', short_name_zh: '切尔西' },
    venue: { name: 'Emirates Stadium', name_zh: '酋长球场', city: 'London' },
    has_pack: true,
    prediction_summary: { p_home: 0.48, p_draw: 0.28, p_away: 0.24 },
  },
  {
    match_id: 'fx_pl_2025_26_003_mci_tot',
    matchday: 3,
    kickoff_utc: '2025-08-30T14:00:00Z',
    fixture_status: 'SCHEDULED',
    home: { team_id: 'club:eng:man_city', name: 'Manchester City FC', name_zh: '曼城', short_name_zh: '曼城' },
    away: { team_id: 'club:eng:tottenham', name: 'Tottenham Hotspur FC', name_zh: '热刺', short_name_zh: '热刺' },
    venue: { name: 'Etihad Stadium', name_zh: '阿提哈德球场', city: 'Manchester' },
    has_pack: true,
    prediction_summary: { p_home: 0.62, p_draw: 0.22, p_away: 0.16 },
  },
  {
    match_id: 'fx_pl_2025_26_004_mun_new',
    matchday: 3,
    kickoff_utc: '2025-08-30T16:30:00Z',
    fixture_status: 'SCHEDULED',
    home: { team_id: 'club:eng:man_united', name: 'Manchester United FC', name_zh: '曼联', short_name_zh: '曼联' },
    away: { team_id: 'club:eng:newcastle', name: 'Newcastle United FC', name_zh: '纽卡斯尔', short_name_zh: '纽卡' },
    venue: { name: 'Old Trafford', name_zh: '老特拉福德球场', city: 'Manchester' },
    has_pack: true,
    prediction_summary: { p_home: 0.40, p_draw: 0.30, p_away: 0.30 },
  },
  {
    match_id: 'fx_pl_2025_26_005_bri_eve',
    matchday: 4,
    kickoff_utc: '2025-09-13T14:00:00Z',
    fixture_status: 'SCHEDULED',
    home: { team_id: 'club:eng:brighton', name: 'Brighton & Hove Albion FC', name_zh: '布莱顿', short_name_zh: '布莱顿' },
    away: { team_id: 'club:eng:everton', name: 'Everton FC', name_zh: '埃弗顿', short_name_zh: '埃弗顿' },
    venue: { name: 'The American Express Community Stadium', name_zh: '美国运通社区球场', city: 'Brighton' },
    has_pack: true,
    prediction_summary: { p_home: 0.42, p_draw: 0.30, p_away: 0.28 },
  },
  {
    match_id: 'fx_pl_2025_26_006_whu_for',
    matchday: 4,
    kickoff_utc: '2025-09-14T13:00:00Z',
    fixture_status: 'SCHEDULED',
    home: { team_id: 'club:eng:west_ham', name: 'West Ham United FC', name_zh: '西汉姆', short_name_zh: '西汉姆' },
    away: { team_id: 'club:eng:nott_forest', name: 'Nottingham Forest FC', name_zh: '诺丁汉森林', short_name_zh: '诺森' },
    venue: { name: 'London Stadium', name_zh: '伦敦球场', city: 'London' },
    has_pack: false, // degraded fixture-card 演示（G-A6 fixture_status=SCHEDULED 但未发布 pack）
    prediction_summary: undefined,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// fixtures.json
// ────────────────────────────────────────────────────────────────────────────
const fixturesFile: FixturesFile = {
  schema_version: 'fixtures-v1',
  generated_at: new Date().toISOString(),
  competition_id: 'premier_league',
  season_id: 'pl:2025-26',
  data_truth_mode: 'SAMPLE_ONLY',
  fixtures: SAMPLES.map((s): FixtureRow => ({
    match_id: s.match_id,
    competition_id: 'premier_league',
    season_id: 'pl:2025-26',
    matchday: s.matchday,
    stage: null,
    kickoff_utc: s.kickoff_utc,
    fixture_status: s.fixture_status,
    home: s.home,
    away: s.away,
    venue: s.venue,
    match_pack_path: s.has_pack ? `data/match-pack/${s.match_id}.json` : null,
    prediction_summary: s.prediction_summary
      ? { ...s.prediction_summary, confidence_label: 'MED', data_truth_mode: 'SAMPLE_ONLY' }
      : null,
  })),
};
parseFixturesFile(fixturesFile);
writeFileSync(path.join(DATA, 'fixtures.json'), JSON.stringify(fixturesFile, null, 2) + '\n');
console.log('[ok] fixtures.json written');

// ────────────────────────────────────────────────────────────────────────────
// match-pack/<id>.json （4 场 — 第 5 场 brighton-everton 故意无 pack 演示 degraded card）
// ────────────────────────────────────────────────────────────────────────────
function makePack(s: SampleFixture, idx: number): ForecastPackV2 {
  const ps = s.prediction_summary!;
  // dimension 状态混合：1/2/3/4/5/10 = STUB；6/7/8/9 = MISSING（典型 Phase A 形态）
  // 第 4 场（曼联-纽卡）整体故意走 0.40/0.30/0.30 STUB 兜底（schema description 兜底）
  const isStubBaseline = idx === 3;
  const wdl = isStubBaseline
    ? { p_home: 0.40, p_draw: 0.30, p_away: 0.30 }
    : { p_home: ps.p_home, p_draw: ps.p_draw, p_away: ps.p_away };
  // 6 状态球员 mock（home 6 名，每名一种状态；away 全 FIT）
  const home6States = [
    { player_id: 'p_001', name: 'A. Striker', name_zh: '射手 A', shirt_number: 9, position: 'Centre-Forward', injury_status: 'FIT' as const, doubtful: false },
    { player_id: 'p_002', name: 'B. Midfielder', name_zh: '中场 B', shirt_number: 8, doubtful: true, injury_status: 'DOUBTFUL' as const, start_probability: 0.4 },
    { player_id: 'p_003', name: 'C. Defender', name_zh: '后卫 C', shirt_number: 4, yellow_card_count: 4, injury_status: 'FIT' as const },
    { player_id: 'p_004', name: 'D. Goalkeeper', name_zh: '门将 D', shirt_number: 1, red_card_suspension_active: true },
    { player_id: 'p_005', name: 'E. Winger', name_zh: '边锋 E', shirt_number: 11, injury_status: 'INJURED' as const },
    { player_id: 'p_006', name: 'F. Backup', name_zh: '替补 F', shirt_number: 22, international_duty_conflict: true },
  ];
  const filler = (i: number) => ({
    player_id: `p_filler_${i}`,
    name: `Player ${i}`,
    name_zh: `球员 ${i}`,
    shirt_number: 10 + i,
    injury_status: 'FIT' as const,
  });
  return {
    schema_version: 'forecast-pack-v2',
    pack_version: 'p2.1.0-sample',
    match_id: s.match_id,
    competition_id: 'premier_league',
    season_id: 'pl:2025-26',
    matchday: s.matchday,
    kickoff_utc: s.kickoff_utc,
    fixture_status: s.fixture_status as 'SCHEDULED',
    home: s.home,
    away: s.away,
    venue: s.venue,
    model_version: 'pl_elo_poisson_v2@sample',
    generated_at: new Date().toISOString(),
    data_truth_mode: 'SAMPLE_ONLY',
    data_completeness: 'sample_stub',
    confidence_label: 'MED',
    source_freshness_summary: { sample: 'FRESH' },
    warnings: [],
    dimension_status: {
      dim_1_outcome: { status: 'STUB', tier: 'P0', data_truth_mode: 'SAMPLE_ONLY' },
      dim_2_xg: { status: 'STUB', tier: 'P0', data_truth_mode: 'SAMPLE_ONLY' },
      dim_3_form: { status: idx === 0 ? 'READY' : 'STUB', tier: 'P0' },
      dim_4_player_availability: { status: 'STUB', tier: 'P0', data_truth_mode: 'SAMPLE_ONLY' },
      dim_5_h2h: { status: 'STUB', tier: 'P0' },
      dim_6_fatigue: { status: idx === 1 ? 'DEGRADED' : 'MISSING', tier: 'P1' },
      dim_7_tactical: { status: 'MISSING', tier: 'P1' },
      dim_8_referee: { status: 'MISSING', tier: 'P1' },
      dim_9_odds_diff: { status: 'MISSING', tier: 'P1' },
      dim_10_scenario: { status: 'STUB', tier: 'P1', data_truth_mode: 'SAMPLE_ONLY' },
    },
    win_draw_loss: wdl,
    scoreline_distribution: {
      matrix: [
        [0.06, 0.07, 0.04, 0.02, 0.01, 0.00],
        [0.08, 0.10, 0.06, 0.03, 0.01, 0.00],
        [0.07, 0.08, 0.04, 0.02, 0.01, 0.00],
        [0.04, 0.04, 0.02, 0.01, 0.00, 0.00],
        [0.02, 0.01, 0.01, 0.00, 0.00, 0.00],
        [0.01, 0.00, 0.00, 0.00, 0.00, 0.00],
      ],
      top3: [
        { home_goals: 1, away_goals: 1, probability: 0.10 },
        { home_goals: 2, away_goals: 1, probability: 0.08 },
        { home_goals: 1, away_goals: 0, probability: 0.07 },
      ],
    },
    expected_goals: {
      xg_home: 1.6,
      xg_away: 1.2,
      xga_home: 1.1,
      xga_away: 1.5,
      // 第 0 场带 5 段 breakdown，其余走 fallback 演示 G-A15 Soft（M-3）
      ...(idx === 0
        ? {
            xg_breakdown_home: { xg_open_play: 0.9, xg_set_piece: 0.4, xg_penalty: 0.0, xg_counter_attack: 0.2, xg_other: 0.1 },
            xg_breakdown_away: { xg_open_play: 0.7, xg_set_piece: 0.2, xg_penalty: 0.0, xg_counter_attack: 0.2, xg_other: 0.1 },
          }
        : {}),
    },
    form: {
      home: {
        last_5: { wins: 3, draws: 1, losses: 1, goals_for: 8, goals_against: 4, ppg: 2.0 },
        last_10: { wins: 6, draws: 2, losses: 2, goals_for: 16, goals_against: 9, ppg: 2.0 },
      },
      away: {
        last_5: { wins: 2, draws: 1, losses: 2, goals_for: 6, goals_against: 7, ppg: 1.4 },
        last_10: { wins: 4, draws: 2, losses: 4, goals_for: 12, goals_against: 14, ppg: 1.4 },
      },
    },
    h2h: {
      matches: [
        { match_id: 'fx_h_001', kickoff_utc: '2025-04-12T15:00:00Z', home_team_id: s.home.team_id, away_team_id: s.away.team_id, home_goals: 2, away_goals: 1 },
        { match_id: 'fx_h_002', kickoff_utc: '2024-11-10T15:00:00Z', home_team_id: s.away.team_id, away_team_id: s.home.team_id, home_goals: 1, away_goals: 1 },
        { match_id: 'fx_h_003', kickoff_utc: '2024-08-25T15:00:00Z', home_team_id: s.home.team_id, away_team_id: s.away.team_id, home_goals: 3, away_goals: 0 },
      ],
      summary: { home_wins: 2, draws: 1, away_wins: 0, avg_goals_per_match: 2.7 },
    },
    player_availability: {
      home: {
        lineup: {
          method: 'last_5_mode',
          probability: 0.7,
          formation: '4-3-3',
          starting_xi: [
            ...home6States,
            filler(7), filler(8), filler(9), filler(10), filler(11),
          ],
          bench: [filler(12), filler(13), filler(14)],
        },
        absentees: [
          { player_id: 'p_abs_001', name: 'G. Suspended', name_zh: '停赛 G', reason: 'SUSPENSION_RED' },
          { player_id: 'p_abs_002', name: 'H. Doubtful', name_zh: '存疑 H', reason: 'DOUBTFUL_ABSENT' },
        ],
        yellow_watch: [
          { player_id: 'p_003', name: 'C. Defender', name_zh: '后卫 C', yellow_count: 4, next_threshold: 5 },
        ],
        key_players: [
          { player_id: 'p_001', name: 'A. Striker', name_zh: '射手 A', position: 'Centre-Forward', last5_goals: 5, last5_assists: 2, avg_rating_last5: 8.1 },
        ],
      },
      away: {
        lineup: {
          method: 'last_5_mode',
          probability: 0.65,
          formation: '4-2-3-1',
          starting_xi: [filler(1), filler(2), filler(3), filler(4), filler(5), filler(6), filler(7), filler(8), filler(9), filler(10), filler(11)],
          bench: [filler(12), filler(13)],
        },
        absentees: [],
        yellow_watch: [],
        key_players: [
          { player_id: 'p_away_001', name: 'X. Striker', name_zh: '射手 X', position: 'Centre-Forward', last5_goals: 3, last5_assists: 1, avg_rating_last5: 7.4 },
        ],
      },
      impact_coefficient: { home: -0.04, away: 0.02 },
      data_truth_mode: 'SAMPLE_ONLY',
      last_updated: new Date().toISOString(),
    },
    // 第 1 场（fx_pl_2025_26_002）fatigue DEGRADED demo
    ...(idx === 1
      ? {
          fatigue: {
            home: { matches_last_7d: 2, matches_last_14d: 4, rest_days_since_prev: 3, european_competition_active: true, fatigue_index: 0.6 },
            away: { matches_last_7d: 1, matches_last_14d: 3, rest_days_since_prev: 5, european_competition_active: false, fatigue_index: 0.3 },
          },
        }
      : {}),
    scenario_simulation: {
      scenarios: [
        { scenario_id: 'early_concede_home_15min', label_zh: '主队 15min 内丢球后', p_home: 0.30, p_draw: 0.30, p_away: 0.40, n_simulations: 5000 },
        { scenario_id: 'early_concede_away_15min', label_zh: '客队 15min 内丢球后', p_home: 0.65, p_draw: 0.20, p_away: 0.15, n_simulations: 5000 },
        { scenario_id: 'red_card_home', label_zh: '主队红牌后', p_home: 0.20, p_draw: 0.30, p_away: 0.50, n_simulations: 5000 },
        { scenario_id: 'red_card_away', label_zh: '客队红牌后', p_home: 0.70, p_draw: 0.20, p_away: 0.10, n_simulations: 5000 },
        { scenario_id: 'lead_at_ht_home', label_zh: '主队上半场领先', p_home: 0.78, p_draw: 0.15, p_away: 0.07, n_simulations: 5000 },
        { scenario_id: 'lead_at_ht_away', label_zh: '客队上半场领先', p_home: 0.10, p_draw: 0.18, p_away: 0.72, n_simulations: 5000 },
      ],
    },
  };
}

let count = 0;
for (const [i, s] of SAMPLES.entries()) {
  if (!s.has_pack) continue;
  const pack = parseForecastPackV2(makePack(s, i));
  writeFileSync(path.join(PACK_DIR, `${s.match_id}.json`), JSON.stringify(pack, null, 2) + '\n');
  count++;
}
console.log(`[ok] match-pack written: ${count} samples`);

// ────────────────────────────────────────────────────────────────────────────
// sentiment.json — 6 项（4 PL + 1 CL + 1 other）
// ────────────────────────────────────────────────────────────────────────────
const sentimentFile: SentimentListFile = {
  schema_version: 'sentiment-list-v1',
  generated_at: new Date().toISOString(),
  data_truth_mode: 'SAMPLE_ONLY',
  competition_distribution: { premier_league: 4, champions_league: 1, other: 1 },
  items: [
    {
      item_id: 'sent_pl_001',
      captured_at: '2025-08-14T10:00:00Z',
      published_at: '2025-08-14T08:00:00Z',
      competition_id: 'premier_league',
      team_ids: ['club:eng:liverpool'],
      title: 'Liverpool sign new midfielder for upcoming Premier League season',
      title_zh: '利物浦签下新中场，备战新赛季英超',
      summary: 'Liverpool announced their summer signing in a presser at Anfield.',
      summary_zh: '利物浦在安菲尔德球场召开发布会，宣布夏窗中场新援加盟。',
      source: 'theguardian',
      url: 'https://example.com/sample-pl-001',
      sentiment_score: 0.6,
      sentiment_label: 'POSITIVE',
      tags: ['transfer'],
      data_truth_mode: 'SAMPLE_ONLY',
    },
    {
      item_id: 'sent_pl_002',
      captured_at: '2025-08-13T15:30:00Z',
      competition_id: 'premier_league',
      team_ids: ['club:eng:arsenal', 'club:eng:chelsea'],
      title: 'Arsenal and Chelsea fans split over derby outlook',
      title_zh: '阿森纳与切尔西球迷对德比走向分歧',
      summary: 'Pre-match social signals show divided fan sentiment.',
      summary_zh: '赛前社交信号显示双方球迷情绪分化，部分担忧防线表现。',
      source: 'twitter:officialaccount',
      url: 'https://example.com/sample-pl-002',
      sentiment_score: 0.0,
      sentiment_label: 'MIXED',
      tags: ['fan'],
      data_truth_mode: 'SAMPLE_ONLY',
    },
    {
      item_id: 'sent_pl_003',
      captured_at: '2025-08-12T11:00:00Z',
      competition_id: 'premier_league',
      team_ids: ['club:eng:man_city'],
      title: 'Man City coaching staff downplay injury concerns',
      title_zh: '曼城教练组淡化伤病困扰',
      summary_zh: '主教练在媒体见面会中表示主力门将赛前可参加合练。',
      source: 'bbc-sport',
      url: 'https://example.com/sample-pl-003',
      sentiment_label: 'POSITIVE',
      data_truth_mode: 'SAMPLE_ONLY',
    },
    {
      item_id: 'sent_pl_004',
      captured_at: '2025-08-11T09:00:00Z',
      competition_id: 'premier_league',
      team_ids: ['club:eng:man_united'],
      title: 'Manchester United supporters frustrated by transfer pace',
      title_zh: '曼联球迷对引援节奏感到沮丧',
      summary_zh: '近期社媒讨论中负面情绪占比 47%，关注度集中在中场。',
      source: 'reddit:reddevils',
      url: 'https://example.com/sample-pl-004',
      sentiment_label: 'NEGATIVE',
      data_truth_mode: 'SAMPLE_ONLY',
    },
    {
      item_id: 'sent_cl_001',
      captured_at: '2025-08-10T10:00:00Z',
      competition_id: 'champions_league',
      title: 'Real Madrid prepare for Champions League opener',
      title_zh: '皇马备战欧冠揭幕战',
      source: 'marca',
      url: 'https://example.com/sample-cl-001',
      sentiment_label: 'POSITIVE',
      data_truth_mode: 'SAMPLE_ONLY',
    },
    {
      item_id: 'sent_other_001',
      captured_at: '2025-08-09T08:00:00Z',
      competition_id: 'other',
      title: 'FIFA reveals new ball for global tournaments',
      title_zh: 'FIFA 公布全球赛事新用球',
      source: 'fifa',
      url: 'https://example.com/sample-other-001',
      sentiment_label: 'NEUTRAL',
      data_truth_mode: 'SAMPLE_ONLY',
    },
  ],
};
parseSentimentList(sentimentFile);
writeFileSync(path.join(DATA, 'sentiment.json'), JSON.stringify(sentimentFile, null, 2) + '\n');
console.log('[ok] sentiment.json written');

// ────────────────────────────────────────────────────────────────────────────
// Augment manifest.json with v2 paths (Minor-5 legacy_v1_paths + pack_versions_v2)
// ────────────────────────────────────────────────────────────────────────────
const manifestPath = path.join(DATA, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.legacy_v1_paths = [
  'predictions/premier_league.json',
  'predictions/champions_league.json',
  'predictions/world_cup_2026.json',
  'overview.json',
  'competitions.json',
  'teams.json',
  'team_compare.json',
];
manifest.pack_versions_v2 = {
  fixtures: { schema_version: 'fixtures-v1', path: 'fixtures.json' },
  match_pack: { schema_version: 'forecast-pack-v2', path_prefix: 'match-pack/', count: SAMPLES.filter((s) => s.has_pack).length },
  sentiment: { schema_version: 'sentiment-list-v1', path: 'sentiment.json' },
};
manifest.schema_version_v2 = 'forecast-pack-v2';
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('[ok] manifest.json augmented (legacy_v1_paths + pack_versions_v2)');

// 重新计算 latest.json.manifest_sha256（v1 latest 仍指向 manifest 主文件）
import { createHash } from 'node:crypto';
const manifestRaw = readFileSync(manifestPath);
const sha = createHash('sha256').update(manifestRaw).digest('hex');
const latestPath = path.join(DATA, 'latest.json');
const latest = JSON.parse(readFileSync(latestPath, 'utf8'));
latest.manifest_sha256 = sha;
writeFileSync(latestPath, JSON.stringify(latest, null, 2) + '\n');
console.log('[ok] latest.json sha256 refreshed');

console.log('\nAll Phase A samples generated.');
