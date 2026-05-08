import { z } from 'zod';

export const TruthMode = z.enum(['REAL', 'REAL_DERIVED', 'MIXED', 'FIXTURE_FALLBACK', 'SAMPLE_ONLY', 'UNKNOWN']);
export const Confidence = z.enum(['HIGH', 'MED', 'LOW']);
export const Warning = z.object({ code: z.string(), scope: z.string(), detail: z.string(), severity: z.string() });
export const CommonHeader = z.object({
  pack_version: z.string(),
  schema_version: z.literal('forecast-pack-v1'),
  generated_at: z.string(),
  warnings: z.array(Warning).default([]),
  source_freshness_summary: z.record(z.string(), z.string()).default({}),
});
export const LatestSchema = z.object({ pack_version: z.string(), generated_at: z.string(), manifest_path: z.literal('manifest.json'), manifest_sha256: z.string(), data_truth_mode_summary: TruthMode, model_version_summary: z.string(), warnings_count: z.number() });
export const ManifestSchema = z.object({ pack_version: z.string(), schema_version: z.literal('forecast-pack-v1'), generated_at: z.string(), run_id: z.string(), model_version: z.record(z.string(), z.string()), data_truth_mode: z.record(z.string(), TruthMode), source_freshness: z.record(z.string(), z.string()), warnings: z.array(Warning), files: z.array(z.object({ path: z.string(), sha256: z.string(), bytes: z.number() })), competitions: z.array(z.string()), retention: z.object({ keep_days: z.number(), pinned: z.boolean() }), exported_by: z.string() });
export const Competition = z.object({ competition_id: z.string(), name: z.string(), scope: z.string(), format: z.string(), source_origin: z.string().optional() });
export const Team = z.object({ team_id: z.string(), canonical_name: z.string(), scope: z.string().optional() });
export const Prediction = z.object({ prediction_id: z.string(), fixture_id: z.string(), competition_id: z.string(), season_id: z.string(), kickoff_utc: z.string(), home_team_id: z.string(), away_team_id: z.string(), home_team: z.string().nullable().optional(), away_team: z.string().nullable().optional(), model_version: z.string(), generated_at: z.string(), p_home: z.number().min(0).max(1), p_draw: z.number().min(0).max(1), p_away: z.number().min(0).max(1), expected_goals_home: z.number(), expected_goals_away: z.number(), scoreline_top3: z.array(z.object({ home_goals: z.number(), away_goals: z.number(), probability: z.number().min(0).max(1) })).max(3), top_drivers: z.array(z.object({ name: z.string(), impact: z.number() })).max(10), confidence_label: Confidence, data_completeness: z.string(), data_truth_mode: TruthMode, source_freshness_summary: z.record(z.string(), z.string()).optional(), warnings: z.array(z.string()) }).refine(p => Math.abs(p.p_home + p.p_draw + p.p_away - 1) < 1e-6, 'probabilities must sum to 1');
export const OverviewSchema = CommonHeader.extend({ system_status: z.string(), data_truth_mode_summary: TruthMode, model_version_summary: z.string(), highlight_fixture_ids: z.array(z.string()) });
export const CompetitionsSchema = CommonHeader.extend({ data_truth_mode_summary: TruthMode, model_version_summary: z.string().optional(), competitions: z.array(Competition) });
export const TeamsSchema = CommonHeader.extend({ data_truth_mode_summary: TruthMode, model_version_summary: z.string().optional(), teams: z.array(Team) });
export const TeamCompareSchema = TeamsSchema;
export const PredictionsFileSchema = CommonHeader.extend({ competition_id: z.string(), model_version_used: z.string(), data_truth_mode: TruthMode, predictions: z.array(Prediction) });
export const TournamentFileSchema = CommonHeader.extend({ competition_id: z.string(), model_version_used: z.string(), data_truth_mode: TruthMode, simulations: z.array(z.object({ team_id: z.string(), champion_probability: z.number().min(0).max(1), advance_probability: z.number().min(0).max(1) })) });
export const DiagnosticsSchema = CommonHeader.extend({ data_truth_mode_summary: TruthMode, model_version_summary: z.string().optional(), model_registry: z.array(z.record(z.string(), z.unknown())), backtest_summary: z.record(z.string(), z.unknown()), calibration_curve: z.array(z.record(z.string(), z.unknown())).default([]), feature_importance: z.array(z.object({ name: z.string(), importance: z.number() })).max(10) });
export const DataQualitySchema = CommonHeader.extend({ data_truth_mode_summary: TruthMode, model_version_summary: z.string().optional(), source_freshness: z.array(z.object({ source_name: z.string(), freshness_status: z.string(), forecast_impact: z.array(z.string()) })), fallback_status: z.array(z.object({ code: z.string(), severity: z.string(), detail: z.string() })) });
export type Manifest = z.infer<typeof ManifestSchema>;
export type Prediction = z.infer<typeof Prediction>;
export type Competition = z.infer<typeof Competition>;
export type Team = z.infer<typeof Team>;
