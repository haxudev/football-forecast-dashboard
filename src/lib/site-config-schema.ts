import { z } from 'zod';

/**
 * SWA EPL-only refactor — site-config schema.
 *
 * 单一事实源（`public/site-config.json`）。
 * Loader 见 `./site-config.ts`。
 *
 * Cross-field refines（D-001 / D-002 可定制性硬约束）：
 *   1) display_locale != 'multi' → display_locale ∈ available_locales
 *      display_locale == 'multi' → available_locales.length >= 2
 *   2) default_landing 必须指向某个 enabled_competitions 或 '/'（即根 landing）
 */
export const SiteConfigSchema = z
  .object({
    enabled_competitions: z
      .array(z.enum(['world_cup', 'premier_league', 'champions_league']))
      .min(1, 'at least one competition must be enabled'),
    display_locale: z.enum(['zh', 'en', 'multi']),
    available_locales: z.array(z.enum(['zh', 'en'])).min(1),
    brand_name: z.string().min(1),
    brand_short_name: z.string().min(1),
    default_landing: z
      .string()
      .regex(/^\/[a-z0-9_\-/]*\/?$/i, 'default_landing must be a relative path starting with "/"'),
  })
  .refine(
    (c) =>
      c.display_locale === 'multi'
        ? c.available_locales.length >= 2
        : c.available_locales.includes(c.display_locale as 'zh' | 'en'),
    {
      message: 'display_locale must be in available_locales (or multi requires ≥ 2 locales)',
      path: ['display_locale'],
    },
  )
  .refine(
    (c) =>
      c.default_landing === '/' ||
      c.enabled_competitions.some((id) => c.default_landing.includes(id)),
    {
      message: 'default_landing must be "/" or contain an enabled competition id',
      path: ['default_landing'],
    },
  );

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

/** 已知赛事 id 联合类型，便于 enabledCompetitions 过滤复用。 */
export type CompetitionId = 'world_cup' | 'premier_league' | 'champions_league';

/** Routing-side competition id（dashboard URL 内 wc 实际写法是 world_cup_2026）。 */
export const COMPETITION_ID_TO_ROUTE: Record<CompetitionId, string> = {
  world_cup: 'world_cup_2026',
  premier_league: 'premier_league',
  champions_league: 'champions_league',
};
