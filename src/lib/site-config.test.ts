import { describe, expect, it } from 'vitest';
import { SiteConfigSchema } from './site-config-schema';
import { getSiteConfig, disabledCompetitionRouteIds, shouldPruneEnRoutes, isSingleLocale } from './site-config';
import siteConfigJson from '../../public/site-config.json';

describe('site-config schema (G7 / 双向 parse + serialize)', () => {
  it('当前实例 public/site-config.json 通过 zod parse', () => {
    const parsed = SiteConfigSchema.parse(siteConfigJson);
    expect(parsed.enabled_competitions).toEqual(['premier_league']);
    expect(parsed.display_locale).toBe('zh');
    expect(parsed.brand_name).toBe('英超预测台');
    expect(parsed.brand_short_name).toBe('英超台');
    expect(parsed.default_landing).toBe('/');
  });

  it('parse + serialize round-trip 等价', () => {
    const parsed = SiteConfigSchema.parse(siteConfigJson);
    const serialized = JSON.stringify(parsed);
    const reparsed = SiteConfigSchema.parse(JSON.parse(serialized));
    expect(reparsed).toEqual(parsed);
  });

  it('multi-comp + multi-locale fixture（S9 swap-config 等价场景）通过', () => {
    const fixture = {
      enabled_competitions: ['world_cup', 'premier_league', 'champions_league'],
      display_locale: 'multi',
      available_locales: ['zh', 'en'],
      brand_name: 'Football Forecast',
      brand_short_name: 'FF',
      default_landing: '/',
    };
    const parsed = SiteConfigSchema.parse(fixture);
    expect(parsed.enabled_competitions).toHaveLength(3);
    expect(parsed.available_locales).toContain('en');
  });

  it('refine 失败：display_locale=zh 但 available_locales=[en]', () => {
    expect(() =>
      SiteConfigSchema.parse({
        enabled_competitions: ['premier_league'],
        display_locale: 'zh',
        available_locales: ['en'],
        brand_name: 'X',
        brand_short_name: 'X',
        default_landing: '/',
      }),
    ).toThrow(/display_locale/);
  });

  it('refine 失败：multi 但 available_locales 只 1 项', () => {
    expect(() =>
      SiteConfigSchema.parse({
        enabled_competitions: ['premier_league'],
        display_locale: 'multi',
        available_locales: ['zh'],
        brand_name: 'X',
        brand_short_name: 'X',
        default_landing: '/',
      }),
    ).toThrow(/display_locale/);
  });

  it('refine 失败：default_landing 指向未启用赛事', () => {
    expect(() =>
      SiteConfigSchema.parse({
        enabled_competitions: ['premier_league'],
        display_locale: 'zh',
        available_locales: ['zh'],
        brand_name: 'X',
        brand_short_name: 'X',
        default_landing: '/competitions/world_cup_2026/',
      }),
    ).toThrow(/default_landing/);
  });

  it('default_landing 接受 / 兜底', () => {
    const parsed = SiteConfigSchema.parse({
      enabled_competitions: ['premier_league'],
      display_locale: 'zh',
      available_locales: ['zh'],
      brand_name: 'X',
      brand_short_name: 'X',
      default_landing: '/',
    });
    expect(parsed.default_landing).toBe('/');
  });

  it('refine 失败：enabled_competitions 空数组', () => {
    expect(() =>
      SiteConfigSchema.parse({
        enabled_competitions: [],
        display_locale: 'zh',
        available_locales: ['zh'],
        brand_name: 'X',
        brand_short_name: 'X',
        default_landing: '/',
      }),
    ).toThrow();
  });

  it('refine 失败：default_landing 不是相对路径', () => {
    expect(() =>
      SiteConfigSchema.parse({
        enabled_competitions: ['premier_league'],
        display_locale: 'zh',
        available_locales: ['zh'],
        brand_name: 'X',
        brand_short_name: 'X',
        default_landing: 'https://example.com/',
      }),
    ).toThrow(/default_landing/);
  });
});

describe('site-config loader helpers', () => {
  it('getSiteConfig 返回当前实例', () => {
    const cfg = getSiteConfig();
    expect(cfg.enabled_competitions).toEqual(['premier_league']);
  });

  it('isSingleLocale = true（zh-only）', () => {
    expect(isSingleLocale()).toBe(true);
  });

  it('shouldPruneEnRoutes = true（zh-only）', () => {
    expect(shouldPruneEnRoutes()).toBe(true);
  });

  it('disabledCompetitionRouteIds 含 world_cup_2026 和 champions_league', () => {
    const ids = disabledCompetitionRouteIds();
    expect(ids).toContain('world_cup_2026');
    expect(ids).toContain('champions_league');
    expect(ids).not.toContain('premier_league');
  });
});
