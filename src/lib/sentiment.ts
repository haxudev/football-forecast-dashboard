// src/lib/sentiment.ts
// Phase A — sentiment-list-v1 zod schema 1:1 实现。
// 上游 schema: shared-artifacts/20260509-fixture-driven-platform-refactor/sentiment-list.schema.json v1.0（已冻结）。
// /sentiment 页面按 site-config.enabled_competitions 过滤（D-3 / L-11）。
import { z } from 'zod';
import { TruthMode } from './forecast-pack';

const SentimentCompetitionId = z.enum([
  'premier_league',
  'champions_league',
  'world_cup_2026',
  'other',
]);
export type SentimentCompetitionId = z.infer<typeof SentimentCompetitionId>;

export const SentimentItem = z.object({
  item_id: z.string(),
  captured_at: z.string(),
  published_at: z.string().nullable().optional(),
  competition_id: SentimentCompetitionId,
  team_ids: z.array(z.string()).optional(),
  title: z.string().min(1),
  title_zh: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  summary_zh: z.string().nullable().optional(),
  source: z.string(),
  url: z.string().url(),
  sentiment_score: z.number().min(-1).max(1).nullable().optional(),
  sentiment_label: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED']).nullable().optional(),
  tags: z.array(z.string()).optional(),
  data_truth_mode: TruthMode.nullable().optional(),
}).strict();
export type SentimentItem = z.infer<typeof SentimentItem>;

export const SentimentListFile = z.object({
  schema_version: z.literal('sentiment-list-v1'),
  generated_at: z.string(),
  data_truth_mode: TruthMode.optional(),
  competition_distribution: z.record(z.string(), z.number().int().min(0)).optional(),
  items: z.array(SentimentItem),
}).strict();
export type SentimentListFile = z.infer<typeof SentimentListFile>;

export function parseSentimentList(raw: unknown): SentimentListFile {
  return SentimentListFile.parse(raw);
}

/** 按 site-config.enabled_competitions 过滤（schema 形态 id：'premier_league' / 'world_cup' / 'champions_league'）。 */
export function filterByEnabledCompetitions(
  items: readonly SentimentItem[],
  enabledIds: readonly string[],
): SentimentItem[] {
  // schema id 'world_cup' → sentiment competition_id 'world_cup_2026' 的映射
  const mapped = new Set<string>();
  for (const id of enabledIds) {
    if (id === 'world_cup') mapped.add('world_cup_2026');
    else mapped.add(id);
  }
  return items.filter((it) => mapped.has(it.competition_id));
}
