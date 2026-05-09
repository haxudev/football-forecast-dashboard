// Placeholder route — only built when site-config 包含 champions_league（multi-comp 实例）。
// zh-only 场景下被 prebuild-prune 软删除为 _disabled_champions_league。
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
        <h1 className="page-title">UEFA Champions League 2025/26</h1>
        <p className="muted">Swiss-stage view will be available when this competition is enabled in site-config.</p>
      </header>
      {isSample && <SampleBanner t={t} />}
      <section className="card">
        <h2 className="font-semibold">About this route</h2>
        <p className="mt-2 text-base">
          This page is a placeholder rendered when <code>enabled_competitions</code> includes
          <code> champions_league</code>. Detailed Swiss table & knockout content is out of Phase A scope.
        </p>
      </section>
    </div>
  );
}
