// Placeholder route — only built when site-config 包含 world_cup（multi-comp 实例）。
// zh-only 场景下被 prebuild-prune 软删除为 _disabled_world_cup_2026。
// 实际世界杯赛事 UI 不在 Phase A 范围；这里只保证架构可定制性 G10 通过。
import { SampleBanner } from '@/components/Shell';
import { tryLoadFixtures } from '@/lib/data-fixture';
import { getDictionary, type Locale } from '@/lib/i18n';

export default function Page() {
  const locale: Locale = 'en';
  const t = getDictionary(locale);
  const fixtures = tryLoadFixtures();
  const isSample = (fixtures?.data_truth_mode ?? 'SAMPLE_ONLY') === 'SAMPLE_ONLY';
  return (
    <div className="space-y-6">
      <header className="page-header">
        <h1 className="page-title">FIFA World Cup 2026</h1>
        <p className="muted">Tournament view will be available when this competition is enabled in site-config.</p>
      </header>
      {isSample && <SampleBanner t={t} />}
      <section className="card">
        <h2 className="font-semibold">About this route</h2>
        <p className="mt-2 text-base">
          This page is a placeholder rendered when <code>enabled_competitions</code> includes
          <code> world_cup</code>. Detailed bracket & simulator content is out of Phase A scope.
        </p>
      </section>
    </div>
  );
}
