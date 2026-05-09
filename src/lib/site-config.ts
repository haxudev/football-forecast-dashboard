import rawJson from '../../public/site-config.json';
import {
  SiteConfigSchema,
  COMPETITION_ID_TO_ROUTE,
  type CompetitionId,
  type SiteConfig,
} from './site-config-schema';

let cached: SiteConfig | null = null;

/**
 * 单一事实源 — 解析 `public/site-config.json` 并以 zod 校验。
 * 任意运行时/构建时 site-config 读取均必须经过本函数，禁止硬编码 enabled / locale。
 */
export function getSiteConfig(): SiteConfig {
  if (!cached) {
    cached = SiteConfigSchema.parse(rawJson);
  }
  return cached;
}

/** 测试钩子：覆盖 cache（仅用于 vitest，不暴露到 production runtime 路径）。 */
export function __setSiteConfigForTest(cfg: SiteConfig | null): void {
  cached = cfg;
}

/** 是否启用某 routing 形态赛事 id（如 'world_cup_2026' / 'premier_league' / 'champions_league'）。 */
export function isCompetitionRouteEnabled(routeId: string): boolean {
  const cfg = getSiteConfig();
  return cfg.enabled_competitions.some((id) => COMPETITION_ID_TO_ROUTE[id as CompetitionId] === routeId);
}

/** 是否启用某 schema 形态赛事 id（'world_cup' / 'premier_league' / 'champions_league'）。 */
export function isCompetitionEnabled(id: CompetitionId): boolean {
  return getSiteConfig().enabled_competitions.includes(id);
}

/** 当前实例是否仅启用单一 locale。 */
export function isSingleLocale(): boolean {
  const cfg = getSiteConfig();
  return cfg.display_locale !== 'multi' && cfg.available_locales.length === 1;
}

/** 是否裁剪 (en)/* 整组（display_locale 不为 'en' 且 available_locales 不含 'en'）。 */
export function shouldPruneEnRoutes(): boolean {
  const cfg = getSiteConfig();
  if (cfg.display_locale === 'en' || cfg.display_locale === 'multi') return false;
  return !cfg.available_locales.includes('en');
}

/** 不启用赛事的 routing id 列表（用于 staticwebapp redirect / build prune）。 */
export function disabledCompetitionRouteIds(): string[] {
  const cfg = getSiteConfig();
  const enabledRoutes = new Set(
    cfg.enabled_competitions.map((id) => COMPETITION_ID_TO_ROUTE[id as CompetitionId]),
  );
  return Object.values(COMPETITION_ID_TO_ROUTE).filter((rid) => !enabledRoutes.has(rid));
}

export type { SiteConfig, CompetitionId } from './site-config-schema';
