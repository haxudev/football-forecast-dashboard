// src/views/OverviewView.tsx
// Phase A — 重写，赛程驱动首页（design §4.1）。
// hero quick action 仅 [舆情]（D-7 / M-1）；FixtureGrid mode='primary'。
// Phase B (B-5)：数据加载留 server；client 子组件管 sort segmented + 重新排序后的 FixtureGrid。
import Link from 'next/link';
import { SampleBanner } from '@/components/Shell';
import { tryLoadFixtures } from '@/lib/data-fixture';
import { isUpcomingFixture, type FixtureRow } from '@/lib/fixtures';
import { format, getDictionary, type Locale } from '@/lib/i18n';
import { TruthBadge } from '@/components/TruthBadge';
import { OverviewSortable } from './OverviewSortable';

export function OverviewView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const fixturesFile = tryLoadFixtures();
  const all: FixtureRow[] = (fixturesFile?.fixtures ?? []) as FixtureRow[];
  const upcoming = all.filter(isUpcomingFixture);
  const truthMode = fixturesFile?.data_truth_mode ?? 'SAMPLE_ONLY';
  const isSample = truthMode === 'SAMPLE_ONLY';
  const nearest = upcoming[0];

  const heroSubtitle = upcoming.length
    ? format(t.overview.subtitleHasMatches, {
        n: upcoming.length,
        nearest: nearest ? new Date(nearest.kickoff_utc).toLocaleString() : '',
      })
    : t.overview.subtitleNoMatches;

  return (
    <div className="space-y-6">
      <header className="hero-soft">
        <div>
          <h1 className="hero-title">{t.overview.title}</h1>
          <p className="hero-sub">{heroSubtitle}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2" data-testid="truth-badges">
            <TruthBadge mode={truthMode} locale={locale} />
          </div>
        </div>
        <div className="hero-actions" aria-label={t.overview.quickActions}>
          <Link className="hero-action" href="/sentiment">{t.overview.heroActions.sentiment}</Link>
        </div>
      </header>

      {isSample && <SampleBanner t={t} />}

      <OverviewSortable fixtures={upcoming} locale={locale} />
    </div>
  );
}
