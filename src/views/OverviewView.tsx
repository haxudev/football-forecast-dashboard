// src/views/OverviewView.tsx
// Phase A — 重写，赛程驱动首页（design §4.1）。
// hero quick action 仅 [舆情]（D-7 / M-1）；FixtureGrid mode='primary'。
import Link from 'next/link';
import { SampleBanner } from '@/components/Shell';
import { FixtureGrid } from '@/components/fixture/FixtureGrid';
import { tryLoadFixtures } from '@/lib/data-fixture';
import { isUpcomingFixture } from '@/lib/fixtures';
import { format, getDictionary, type Locale } from '@/lib/i18n';
import { TruthBadge } from '@/components/TruthBadge';

export function OverviewView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const fixturesFile = tryLoadFixtures();
  const all = fixturesFile?.fixtures ?? [];
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
          {/* Phase A: 仅保留 [舆情] quick action（M-1 删除 allTeams） */}
          <Link className="hero-action" href="/sentiment">{t.overview.heroActions.sentiment}</Link>
        </div>
      </header>

      {isSample && <SampleBanner t={t} />}

      <section aria-labelledby="upcoming-h">
        <h2 id="upcoming-h" className="section-title">{t.overview.todayHighlights}</h2>
        <FixtureGrid fixtures={upcoming} mode="primary" t={t} />
      </section>
    </div>
  );
}
