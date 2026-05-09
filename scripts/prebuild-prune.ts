/**
 * SWA EPL-only refactor — Stage 3 prebuild prune.
 *
 * 行为：
 *   1. 读取 public/site-config.json（zod 校验由 site-config.ts 负责，本脚本仅读 JSON）。
 *   2. 根据 enabled_competitions / available_locales / display_locale 决定要"软删除"的路由源目录。
 *   3. 用 fs.rename 把目标目录改名为 `_disabled_<原名>`，写 prune-state.json 记录原始路径。
 *   4. Next.js 对以 `_` 开头的路由段视为 private folder，不会编译/不生成静态页 (G8)。
 *
 * 必须配合 `postbuild-restore.ts` 在 build 完成后恢复，避免污染 source。
 *
 * 失败策略（D-001 / C-4 / 不允许 silent fallback）：
 *   - prune-state.json 已存在 → 立即抛错（说明上次 build 没 restore，必须人工修复）。
 *   - 路径不存在 → log warning + skip（fixture 多 comp 兜底）。
 */
import { readFileSync, renameSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const STATE_FILE = resolve(ROOT, '.route-prune-state.json');
const CONFIG_FILE = resolve(ROOT, 'public/site-config.json');

type CompetitionId = 'world_cup' | 'premier_league' | 'champions_league';
const COMPETITION_ID_TO_ROUTE: Record<CompetitionId, string> = {
  world_cup: 'world_cup_2026',
  premier_league: 'premier_league',
  champions_league: 'champions_league',
};

type SiteConfigJson = {
  enabled_competitions: CompetitionId[];
  display_locale: 'zh' | 'en' | 'multi';
  available_locales: ('zh' | 'en')[];
  brand_name: string;
  brand_short_name: string;
  default_landing: string;
};

type PruneEntry = { from: string; to: string };
type PruneState = { renames: PruneEntry[]; site_config_hash: string; timestamp: string };

function readConfig(): SiteConfigJson {
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as SiteConfigJson;
}

function configHash(cfg: SiteConfigJson): string {
  // Lightweight stable hash for state correlation.
  return Buffer.from(JSON.stringify(cfg)).toString('base64');
}

function disabledRouteDirs(cfg: SiteConfigJson): string[] {
  const enabledRoutes = new Set(
    cfg.enabled_competitions.map((id) => COMPETITION_ID_TO_ROUTE[id]),
  );
  return Object.values(COMPETITION_ID_TO_ROUTE).filter((rid) => !enabledRoutes.has(rid));
}

function shouldPruneEnGroup(cfg: SiteConfigJson): boolean {
  if (cfg.display_locale === 'en' || cfg.display_locale === 'multi') return false;
  return !cfg.available_locales.includes('en');
}

function planRenames(cfg: SiteConfigJson): PruneEntry[] {
  const out: PruneEntry[] = [];

  if (shouldPruneEnGroup(cfg)) {
    const from = resolve(ROOT, 'src/app/(en)');
    const to = resolve(ROOT, 'src/app/_disabled_(en)');
    if (existsSync(from)) out.push({ from, to });
    else console.warn('[prebuild-prune] (en) group not found, skipping');
  }

  const disabled = disabledRouteDirs(cfg);
  for (const routeId of disabled) {
    // (zh) competitions/<id> 顶级 route（如有专用 page.tsx）
    const compPath = resolve(ROOT, `src/app/(zh)/competitions/${routeId}`);
    if (existsSync(compPath)) {
      out.push({ from: compPath, to: resolve(ROOT, `src/app/(zh)/competitions/_disabled_${routeId}`) });
    }
    // tournament-simulator/<id>（如有硬编码目录；目前只有 [competitionId] 动态路由）
    const tsPath = resolve(ROOT, `src/app/(zh)/tournament-simulator/${routeId}`);
    if (existsSync(tsPath)) {
      out.push({ from: tsPath, to: resolve(ROOT, `src/app/(zh)/tournament-simulator/_disabled_${routeId}`) });
    }
  }

  // 若没有任何 tournament-format 赛事启用，整组裁掉 tournament-simulator/[competitionId]
  // （否则 generateStaticParams 返回空 next 会报错）。
  // 当前可识别 tournament 赛事仅 world_cup（cl 是 swiss_plus_knockout）。
  const hasTournament =
    cfg.enabled_competitions.includes('world_cup') || cfg.enabled_competitions.includes('champions_league');
  if (!hasTournament) {
    const tsRoot = resolve(ROOT, 'src/app/(zh)/tournament-simulator');
    const tsRootDisabled = resolve(ROOT, 'src/app/(zh)/_disabled_tournament-simulator');
    if (existsSync(tsRoot)) out.push({ from: tsRoot, to: tsRootDisabled });
  }

  return out;
}

function main() {
  if (existsSync(STATE_FILE)) {
    throw new Error(
      `[prebuild-prune] ${STATE_FILE} already exists. Last build did not restore. ` +
        `Run \`pnpm exec tsx scripts/postbuild-restore.ts\` to recover, or manually rename _disabled_* directories back.`,
    );
  }

  const cfg = readConfig();
  const renames = planRenames(cfg);

  console.log(`[prebuild-prune] site-config:`, {
    enabled: cfg.enabled_competitions,
    locale: cfg.display_locale,
    available: cfg.available_locales,
  });
  if (renames.length === 0) {
    console.log('[prebuild-prune] no routes to prune (multi-comp + multi-locale)');
    writeFileSync(STATE_FILE, JSON.stringify({ renames: [], site_config_hash: configHash(cfg), timestamp: new Date().toISOString() }, null, 2));
    return;
  }

  for (const { from, to } of renames) {
    renameSync(from, to);
    console.log(`[prebuild-prune] rename: ${from} -> ${to}`);
  }

  const state: PruneState = { renames, site_config_hash: configHash(cfg), timestamp: new Date().toISOString() };
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log(`[prebuild-prune] wrote state: ${STATE_FILE}`);
}

main();
