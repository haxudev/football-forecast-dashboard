// src/lib/fixtures.ts
// Phase A — fixtures-v1 zod schema 1:1 实现。
// 上游 schema: shared-artifacts/20260509-fixture-driven-platform-refactor/fixtures.schema.json v1.0（已冻结）。
// 三处入口（/ 首页 / /match-comparison picker / /team-comparison picker）共享数据源（D-1）。
import { z } from 'zod';
import { CompetitionId, FixtureStatus, TruthMode } from './forecast-pack';

export const SideCardRef = z.object({
  team_id: z.string(),
  name: z.string(),
  name_zh: z.string().nullable().optional(),
  short_name: z.string().nullable().optional(),
  short_name_zh: z.string().nullable().optional(),
  tla: z.string().nullable().optional(),
  crest_url: z.string().nullable().optional(),
}).strict();
export type SideCardRef = z.infer<typeof SideCardRef>;

export const VenueCardRef = z.object({
  name: z.string(),
  name_zh: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  city_zh: z.string().nullable().optional(),
}).strict();
export type VenueCardRef = z.infer<typeof VenueCardRef>;

export const PredictionSummary = z
  .object({
    p_home: z.number().min(0).max(1),
    p_draw: z.number().min(0).max(1),
    p_away: z.number().min(0).max(1),
    confidence_label: z.enum(['HIGH', 'MED', 'LOW']).nullable().optional(),
    data_truth_mode: TruthMode.nullable().optional(),
  })
  .strict()
  .nullable();
export type PredictionSummary = z.infer<typeof PredictionSummary>;

export const ScoreFinal = z
  .object({
    home_goals: z.number().int().min(0),
    away_goals: z.number().int().min(0),
  })
  .strict()
  .nullable();

export const FixtureRow = z.object({
  match_id: z.string().regex(/^fx_[a-z0-9_:-]+$/),
  competition_id: CompetitionId,
  season_id: z.string(),
  matchday: z.number().int().min(1).nullable().optional(),
  stage: z.string().nullable().optional(),
  kickoff_utc: z.string(),
  fixture_status: FixtureStatus,
  home: SideCardRef,
  away: SideCardRef,
  venue: VenueCardRef,
  match_pack_path: z.string().nullable().optional(),
  prediction_summary: PredictionSummary.optional(),
  score_final: ScoreFinal.optional(),
}).strict();
export type FixtureRow = z.infer<typeof FixtureRow>;

export const FixturesFile = z.object({
  schema_version: z.literal('fixtures-v1'),
  generated_at: z.string(),
  competition_id: CompetitionId,
  season_id: z.string(),
  data_truth_mode: TruthMode.optional(),
  fixtures: z.array(FixtureRow),
}).strict();
export type FixturesFile = z.infer<typeof FixturesFile>;

export function parseFixturesFile(raw: unknown): FixturesFile {
  return FixturesFile.parse(raw);
}

/**
 * 三入口共享排序：kickoff_utc ASC + match_id ASC（tiebreak）。
 * G-A2 / T-5 / L1-16 强约束 byte-equal。
 */
export function sortFixtures(rows: readonly FixtureRow[]): FixtureRow[] {
  return [...rows].sort((a, b) => {
    if (a.kickoff_utc < b.kickoff_utc) return -1;
    if (a.kickoff_utc > b.kickoff_utc) return 1;
    if (a.match_id < b.match_id) return -1;
    if (a.match_id > b.match_id) return 1;
    return 0;
  });
}

/**
 * 卡片网格仅渲染 SCHEDULED / TIMED；FINISHED / POSTPONED / CANCELED / IN_PLAY / PAUSED 由调用方决定（design §3.2）。
 * 此处是工具函数；具体路由根据 mode 自行选择是否过滤。
 */
export function isUpcomingFixture(row: FixtureRow): boolean {
  return row.fixture_status === 'SCHEDULED' || row.fixture_status === 'TIMED';
}
