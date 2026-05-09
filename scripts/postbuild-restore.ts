/**
 * SWA EPL-only refactor — Stage 3 postbuild restore.
 *
 * 读取 prebuild-prune 产出的 .route-prune-state.json，把所有 _disabled_<routeId> rename 回原名。
 * 失败则非零退出（CI 必 fail），保证不污染 source。
 */
import { existsSync, readFileSync, renameSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const STATE_FILE = resolve(ROOT, '.route-prune-state.json');

type PruneEntry = { from: string; to: string };
type PruneState = { renames: PruneEntry[] };

function main() {
  if (!existsSync(STATE_FILE)) {
    console.log('[postbuild-restore] no state file; nothing to restore.');
    return;
  }
  const state = JSON.parse(readFileSync(STATE_FILE, 'utf-8')) as PruneState;
  let restored = 0;
  // 反向：先 rename 嵌套子项；当前列表无嵌套，按顺序倒回即可。
  for (const { from, to } of [...state.renames].reverse()) {
    if (!existsSync(to)) {
      console.warn(`[postbuild-restore] missing ${to}, cannot restore to ${from}`);
      continue;
    }
    renameSync(to, from);
    restored++;
    console.log(`[postbuild-restore] restored: ${to} -> ${from}`);
  }
  unlinkSync(STATE_FILE);
  console.log(`[postbuild-restore] done; restored ${restored}/${state.renames.length}`);
}

main();
