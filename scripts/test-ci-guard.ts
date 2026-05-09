// scripts/test-ci-guard.ts
// T-10 / G-A9 — 静态校验 deploy.yml 的 if guard 表达式是否正确（Phase A CI guard 防 main → 生产 SWA）。
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const yml = readFileSync(path.join(ROOT, '.github/workflows/deploy.yml'), 'utf8');

const checks: Array<[string, boolean, string]> = [
  ['has on.push.main', /on:\s*\n\s*push:\s*\n\s*branches:\s*\[main\]/m.test(yml), 'main push trigger present'],
  ['has job-level if guard', /^\s*if:\s*\|/m.test(yml), 'job-level if (multi-line) present'],
  ['guard mentions vars.PHASE', /vars\.PHASE\s*==\s*'B'/.test(yml), 'guard checks vars.PHASE'],
  ['guard allows [hotfix]', /\[hotfix\]/.test(yml), 'guard allows [hotfix] commit'],
  ['no else branch', !/\bif:.+\belse\b/m.test(yml), 'no else branch (job 直接 skip)'],
];

let failed = 0;
for (const [name, ok, detail] of checks) {
  console.log(`${ok ? '✅' : '❌'} ${name}: ${detail}`);
  if (!ok) failed++;
}

if (failed) {
  console.error(`\n${failed} CI guard check(s) failed (G-A9 / T-10).`);
  process.exit(1);
}
console.log('\nAll Phase A CI guard checks PASS.');
