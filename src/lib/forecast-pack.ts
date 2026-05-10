// src/lib/forecast-pack.ts
// Phase A — forecast-pack-v2 zod schema 1:1 实现。
// 上游 schema: shared-artifacts/20260509-fixture-driven-platform-refactor/forecast-pack-v2.schema.json v2.1（已冻结）。
// 任何字段差异以 schema 真相为准（D-7 / NIT-1..4 处理）。
import { z } from 'zod';

// ────────────────────────────────────────────────────────────────────────────
// 共享 enum（与顶层 schema 6 项 / 7 项 / 4 态对齐）
// ────────────────────────────────────────────────────────────────────────────
export const TruthMode = z.enum([
  'REAL',
  'REAL_DERIVED',
  'MIXED',
  'FIXTURE_FALLBACK',
  'SAMPLE_ONLY',
  'UNKNOWN',
]);
export type TruthMode = z.infer<typeof TruthMode>;

export const FixtureStatus = z.enum([
  'SCHEDULED',
  'TIMED',
  'IN_PLAY',
  'PAUSED',
  'FINISHED',
  'POSTPONED',
  'CANCELED',
]);
export type FixtureStatus = z.infer<typeof FixtureStatus>;

export const DimStatusValue = z.enum(['READY', 'STUB', 'MISSING', 'DEGRADED']);
export type DimStatusValue = z.infer<typeof DimStatusValue>;

export const ConfidenceLabel = z.enum(['HIGH', 'MED', 'LOW']);

export const CompetitionId = z.enum(['premier_league', 'champions_league', 'world_cup_2026']);

export const ScenarioId = z.enum([
  'early_concede_home_15min',
  'early_concede_away_15min',
  'red_card_home',
  'red_card_away',
  'lead_at_ht_home',
  'lead_at_ht_away',
]);
export type ScenarioId = z.infer<typeof ScenarioId>;

export const InjuryStatus = z.enum(['FIT', 'DOUBTFUL', 'INJURED', 'RECOVERING']);
export const AvailabilityStatus = z.enum(['FIT', 'DOUBTFUL', 'RULED_OUT']);
export const AbsenteeReason = z.enum([
  'INJURY',
  'SUSPENSION_RED',
  'SUSPENSION_YELLOW_ACCUMULATION',
  'INTERNATIONAL_DUTY',
  'DOUBTFUL_ABSENT',
  'OTHER',
]);

// ────────────────────────────────────────────────────────────────────────────
// 子结构
// ────────────────────────────────────────────────────────────────────────────
export const Side = z.object({
  team_id: z.string(),
  name: z.string(),
  name_zh: z.string().nullable().optional(),
  short_name: z.string().nullable().optional(),
  short_name_zh: z.string().nullable().optional(),
  tla: z.string().nullable().optional(),
  crest_url: z.string().nullable().optional(),
  coach_name: z.string().nullable().optional(),
  coach_name_zh: z.string().nullable().optional(),
}).strict();
export type Side = z.infer<typeof Side>;

export const Venue = z.object({
  name: z.string(),
  name_zh: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  city_zh: z.string().nullable().optional(),
}).strict();

export const DimStatus = z.object({
  status: DimStatusValue,
  tier: z.enum(['P0', 'P1']),
  data_truth_mode: TruthMode.nullable().optional(),
  last_updated: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
}).strict();
export type DimStatus = z.infer<typeof DimStatus>;

export const DimensionStatusMap = z.object({
  dim_1_outcome: DimStatus,
  dim_2_xg: DimStatus,
  dim_3_form: DimStatus,
  dim_4_player_availability: DimStatus,
  dim_5_h2h: DimStatus,
  dim_6_fatigue: DimStatus,
  dim_7_tactical: DimStatus,
  dim_8_referee: DimStatus,
  dim_9_odds_diff: DimStatus,
  dim_10_scenario: DimStatus,
}).strict();
export type DimensionStatusMap = z.infer<typeof DimensionStatusMap>;

export const PlayerSlim = z.object({
  player_id: z.string(),
  name: z.string(),
  name_zh: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  shirt_number: z.number().int().min(0).max(99).nullable().optional(),
  availability_status: AvailabilityStatus.nullable().optional(),
  injury_status: InjuryStatus.nullable().optional(),
  doubtful: z.boolean().nullable().optional(),
  red_card_suspension_active: z.boolean().nullable().optional(),
  yellow_card_count: z.number().int().min(0).max(50).nullable().optional(),
  start_probability: z.number().min(0).max(1).nullable().optional(),
  international_duty_conflict: z.boolean().nullable().optional(),
}).strict();
export type PlayerSlim = z.infer<typeof PlayerSlim>;

export const FormResult = z.object({
  match_id: z.string(),
  kickoff_utc: z.string(),
  outcome: z.enum(['W', 'D', 'L']),
  home: z.boolean().nullable().optional(),
  opponent_team_id: z.string().nullable().optional(),
  goals_for: z.number().int().min(0),
  goals_against: z.number().int().min(0),
}).strict();

export const FormWindow = z.object({
  wins: z.number().int().min(0),
  draws: z.number().int().min(0),
  losses: z.number().int().min(0),
  goals_for: z.number().int().min(0),
  goals_against: z.number().int().min(0),
  ppg: z.number().min(0).max(3).nullable().optional(),
  results: z.array(FormResult).max(10).optional(),
}).strict();

export const TeamForm = z.object({
  last_5: FormWindow.nullable(),
  last_10: FormWindow.nullable(),
  home_split: FormWindow.nullable().optional(),
  away_split: FormWindow.nullable().optional(),
}).strict();

export const XGBreakdown = z
  .object({
    xg_open_play: z.number().min(0),
    xg_set_piece: z.number().min(0),
    xg_penalty: z.number().min(0),
    xg_counter_attack: z.number().min(0),
    xg_other: z.number().min(0),
  })
  .strict()
  .nullable();
export type XGBreakdown = z.infer<typeof XGBreakdown>;

export const ExpectedGoals = z.object({
  xg_home: z.number().min(0),
  xg_away: z.number().min(0),
  xga_home: z.number().min(0).nullable().optional(),
  xga_away: z.number().min(0).nullable().optional(),
  shot_volume_home: z.number().min(0).nullable().optional(),
  shot_volume_away: z.number().min(0).nullable().optional(),
  xg_breakdown_home: XGBreakdown.optional(),
  xg_breakdown_away: XGBreakdown.optional(),
}).strict();
export type ExpectedGoals = z.infer<typeof ExpectedGoals>;

export const WinDrawLoss = z.object({
  p_home: z.number().min(0).max(1),
  p_draw: z.number().min(0).max(1),
  p_away: z.number().min(0).max(1),
  top_drivers: z
    .array(
      z.object({
        name: z.string(),
        name_zh: z.string().nullable().optional(),
        impact: z.number(),
      }).strict(),
    )
    .max(10)
    .optional(),
}).strict();

export type ScorelineDistribution = z.infer<typeof ScorelineDistribution_>;
export const ScorelineDistribution_ = z.object({
  matrix: z.array(z.array(z.number().min(0).max(1)).length(6)).length(6),
  top3: z
    .array(
      z.object({
        home_goals: z.number().int().min(0),
        away_goals: z.number().int().min(0),
        probability: z.number().min(0).max(1),
      }).strict(),
    )
    .max(3),
}).strict();
export const ScorelineDistribution = ScorelineDistribution_;

export const SidePlayers = z.object({
  lineup: z.object({
    method: z.enum(['official_sheet', 'last_5_mode', 'default_xi', 'model_v0']),
    probability: z.number().min(0).max(1).nullable().optional(),
    predicted_at: z.string().nullable().optional(),
    formation: z.string().nullable().optional(),
    starting_xi: z.array(PlayerSlim).max(11),
    bench: z.array(PlayerSlim).max(12).optional(),
  }).strict(),
  absentees: z.array(
    z.object({
      player_id: z.string(),
      name: z.string(),
      name_zh: z.string().nullable().optional(),
      reason: AbsenteeReason,
      expected_return_date: z.string().nullable().optional(),
      source: z.string().nullable().optional(),
      source_freshness: z.string().nullable().optional(),
    }).strict(),
  ),
  yellow_watch: z
    .array(
      z.object({
        player_id: z.string(),
        name: z.string(),
        name_zh: z.string().nullable().optional(),
        yellow_count: z.number().int().min(0),
        next_threshold: z.number().int().nullable().optional(),
      }).strict(),
    )
    .optional(),
  key_players: z
    .array(
      z.object({
        player_id: z.string(),
        name: z.string(),
        name_zh: z.string().nullable().optional(),
        position: z.string().nullable().optional(),
        last5_goals: z.number().int().min(0).nullable().optional(),
        last5_assists: z.number().int().min(0).nullable().optional(),
        avg_rating_last5: z.number().min(0).max(10).nullable().optional(),
      }).strict(),
    )
    .optional(),
}).strict();
export type SidePlayers = z.infer<typeof SidePlayers>;

export const PlayerAvailability = z
  .object({
    home: SidePlayers,
    away: SidePlayers,
    impact_coefficient: z.object({
      home: z.number(),
      away: z.number(),
    }).strict(),
    data_truth_mode: TruthMode.optional(),
    last_updated: z.string().nullable().optional(),
  })
  .strict()
  .nullable();
export type PlayerAvailability = z.infer<typeof PlayerAvailability>;

export const H2H = z
  .object({
    matches: z
      .array(
        z.object({
          match_id: z.string(),
          kickoff_utc: z.string(),
          competition_id: z.string().nullable().optional(),
          venue_kind: z.enum(['HOME', 'AWAY', 'NEUTRAL']).nullable().optional(),
          home_team_id: z.string(),
          away_team_id: z.string(),
          home_goals: z.number().int().min(0),
          away_goals: z.number().int().min(0),
        }).strict(),
      )
      .max(10),
    summary: z.object({
      home_wins: z.number().int().min(0),
      draws: z.number().int().min(0),
      away_wins: z.number().int().min(0),
      avg_goals_per_match: z.number().min(0).nullable().optional(),
    }).strict(),
  })
  .strict()
  .nullable();

export const SideFatigue = z.object({
  matches_last_7d: z.number().int().min(0),
  matches_last_14d: z.number().int().min(0),
  rest_days_since_prev: z.number().int().min(0).nullable().optional(),
  european_competition_active: z.boolean(),
  fatigue_index: z.number().nullable().optional(),
}).strict();

export const Fatigue = z
  .object({ home: SideFatigue, away: SideFatigue })
  .strict()
  .nullable();

export const TacticalProfile = z.object({
  possession_pct: z.number().min(0).max(100).nullable().optional(),
  press_intensity: z.enum(['HIGH', 'MID', 'LOW']).nullable().optional(),
  build_up_style: z.enum(['SHORT_PASS', 'DIRECT', 'MIXED']).nullable().optional(),
  counter_rate: z.number().min(0).max(1).nullable().optional(),
  avg_def_line_height: z.enum(['HIGH', 'MID', 'LOW']).nullable().optional(),
}).strict();

export const Tactical = z
  .object({
    home: TacticalProfile,
    away: TacticalProfile,
    matchup_score: z.number().nullable().optional(),
  })
  .strict()
  .nullable();

export const Referee = z
  .object({
    referee_id: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    name_zh: z.string().nullable().optional(),
    matches_observed: z.number().int().min(0).nullable().optional(),
    avg_yellow_per_match: z.number().min(0).nullable().optional(),
    avg_red_per_match: z.number().min(0).nullable().optional(),
    penalty_per_match: z.number().min(0).nullable().optional(),
    home_bias_index: z.number().nullable().optional(),
  })
  .strict()
  .nullable();

export const OddsDiff = z
  .object({
    bookmaker: z.string(),
    captured_at: z.string().nullable().optional(),
    implied: z.object({
      p_home: z.number().min(0).max(1),
      p_draw: z.number().min(0).max(1),
      p_away: z.number().min(0).max(1),
    }).strict(),
    model: z.object({
      p_home: z.number(),
      p_draw: z.number(),
      p_away: z.number(),
    }).strict(),
    diff: z.object({
      d_home: z.number(),
      d_draw: z.number(),
      d_away: z.number(),
      edge_label: z.enum(['HOME', 'DRAW', 'AWAY', 'NEUTRAL']).nullable().optional(),
    }).strict(),
  })
  .strict()
  .nullable();

export const ScenarioSimulation = z
  .object({
    scenarios: z
      .array(
        z.object({
          scenario_id: ScenarioId,
          label_zh: z.string(),
          p_home: z.number().min(0).max(1),
          p_draw: z.number().min(0).max(1),
          p_away: z.number().min(0).max(1),
          n_simulations: z.number().int().min(0).nullable().optional(),
        }).strict(),
      )
      .max(6),
  })
  .strict()
  .nullable();

export const Warning = z.object({
  code: z.string(),
  scope: z.string(),
  severity: z.enum(['INFO', 'WARN', 'ERROR']),
  detail: z.string(),
}).strict();
export type Warning = z.infer<typeof Warning>;

// ────────────────────────────────────────────────────────────────────────────
// 顶层 forecast-pack-v2
// ────────────────────────────────────────────────────────────────────────────
export const ForecastPackV2 = z
  .object({
    schema_version: z.literal('forecast-pack-v2'),
    pack_version: z.string(),
    match_id: z.string().regex(/^fx_[a-z0-9_:-]+$/),
    competition_id: CompetitionId,
    season_id: z.string(),
    matchday: z.number().int().min(1).nullable().optional(),
    kickoff_utc: z.string(),
    fixture_status: FixtureStatus.optional(), // schema 标注 P0；保 optional 兼容老样本
    home: Side,
    away: Side,
    venue: Venue,
    model_version: z.string(),
    generated_at: z.string(),
    data_truth_mode: TruthMode,
    data_completeness: z.string().optional(),
    confidence_label: ConfidenceLabel.optional(),
    source_freshness_summary: z.record(z.string(), z.string()).optional(),

    warnings: z.array(Warning),
    dimension_status: DimensionStatusMap,

    win_draw_loss: WinDrawLoss,
    scoreline_distribution: ScorelineDistribution,
    expected_goals: ExpectedGoals,

    form: z.object({ home: TeamForm, away: TeamForm }).strict().optional(),
    player_availability: PlayerAvailability.optional(),
    h2h: H2H.optional(),
    fatigue: Fatigue.optional(),
    tactical: Tactical.optional(),
    referee: Referee.optional(),
    odds_diff: OddsDiff.optional(),
    scenario_simulation: ScenarioSimulation.optional(),
  })
  .strict()
  // 概率和约束（容差 1e-3 以适配 STUB 数据 0.40/0.30/0.30）
  .refine(
    (p) => Math.abs(p.win_draw_loss.p_home + p.win_draw_loss.p_draw + p.win_draw_loss.p_away - 1) < 1e-3,
    { message: 'win_draw_loss probabilities must sum to 1 (±1e-3)', path: ['win_draw_loss'] },
  );

export type ForecastPackV2 = z.infer<typeof ForecastPackV2>;

/** 解析 + 校验 forecast-pack-v2 JSON。校验失败抛 ZodError。 */
export function parseForecastPackV2(raw: unknown): ForecastPackV2 {
  return ForecastPackV2.parse(raw);
}

/** 安全解析（不抛错）。 */
export function safeParseForecastPackV2(raw: unknown) {
  return ForecastPackV2.safeParse(raw);
}

// 类型别名（charts/views 直接 import 类型时使用）
export type ScorelineDistributionT = z.infer<typeof ScorelineDistribution>;
export type TeamFormT = z.infer<typeof TeamForm>;
export type H2HT = z.infer<typeof H2H>;
export type FatigueT = z.infer<typeof Fatigue>;
export type TacticalT = z.infer<typeof Tactical>;
export type RefereeT = z.infer<typeof Referee>;
export type OddsDiffT = z.infer<typeof OddsDiff>;
export type ScenarioSimulationT = z.infer<typeof ScenarioSimulation>;
