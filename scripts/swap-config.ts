/**
 * SWA EPL-only refactor — Stage 9 swap-config (架构假设硬保护 D-004.P3 / C-5).
 *
 * 用途：CI 中临时把 site-config 切到 multi-comp + multi-locale 触发完整 build，验证未来切换实例
 * 仍能正常产出 (en)/* + wc/cl 路由。完成后必须 restore（finally 兜底）。
 *
 * 用法：
 *   tsx scripts/swap-config.ts apply   # 备份当前 site-config 并替换为 multi 实例
 *   tsx scripts/swap-config.ts restore # 还原
 */
import { readFileSync, writeFileSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONFIG_FILE = resolve(ROOT, 'public/site-config.json');
const BACKUP_FILE = resolve(ROOT, 'public/site-config.backup.json');

const MULTI_COMP_FIXTURE = {
  enabled_competitions: ['world_cup', 'premier_league', 'champions_league'],
  display_locale: 'multi',
  available_locales: ['zh', 'en'],
  brand_name: 'Football Forecast',
  brand_short_name: 'FF',
  default_landing: '/',
};

function apply() {
  if (existsSync(BACKUP_FILE)) {
    throw new Error(`[swap-config] backup file already exists: ${BACKUP_FILE}. Run \`restore\` first.`);
  }
  copyFileSync(CONFIG_FILE, BACKUP_FILE);
  writeFileSync(CONFIG_FILE, JSON.stringify(MULTI_COMP_FIXTURE, null, 2) + '\n');
  console.log('[swap-config] applied multi-comp fixture; backup at', BACKUP_FILE);
}

function restore() {
  if (!existsSync(BACKUP_FILE)) {
    console.warn('[swap-config] no backup found, nothing to restore');
    return;
  }
  copyFileSync(BACKUP_FILE, CONFIG_FILE);
  unlinkSync(BACKUP_FILE);
  console.log('[swap-config] restored');
}

const cmd = process.argv[2];
if (cmd === 'apply') apply();
else if (cmd === 'restore') restore();
else {
  console.error('usage: tsx scripts/swap-config.ts {apply|restore}');
  process.exit(2);
}
