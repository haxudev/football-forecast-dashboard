import Link from 'next/link';
import {
  CompetitionCard,
  MatchCard,
  SampleBanner,
} from '@/components/Shell';
import { loadAllPredictions, loadCompetitions, loadOverview } from '@/lib/data';
import { format, getDictionary, type Locale } from '@/lib/i18n';
import { deriveMatchStage } from '@/lib/status';

export function OverviewView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const prefix = locale === 'en' ? '/en' : '';
  const overview = loadOverview();
  const preds = loadAllPredictions();
  const competitions = loadCompetitions();
  const isSample = overview.data_truth_mode_summary === 'SAMPLE_ONLY';

  // Group matches: PRE first, sorted by kickoff ascending
  const now = new Date();
  const upcoming = preds
    .map((p) => ({ p, info: deriveMatchStage(p.kickoff_utc, { t, locale, now }) }))
    .filter((x) => x.info.stage !== 'END')
    .sort((a, b) => new Date(a.p.kickoff_utc).getTime() - new Date(b.p.kickoff_utc).getTime());

  const featured = upcoming.slice(0, 3);
  const nearest = featured[0];
  const heroSubtitle = featured.length
    ? format(t.overview.subtitleHasMatches, {
        n: upcoming.length,
        nearest: nearest?.info.subline || nearest?.info.kickoffLabel || '',
      })
    : t.overview.subtitleNoMatches;

  // Per-competition this-week count (within ~7 days from now)
  const weekMs = 7 * 86_400_000;
  const thisWeekByComp = preds.reduce<Record<string, number>>((acc, p) => {
    const ts = new Date(p.kickoff_utc).getTime();
    if (!Number.isNaN(ts) && ts >= now.getTime() - weekMs && ts <= now.getTime() + weekMs) {
      acc[p.competition_id] = (acc[p.competition_id] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header className="hero-soft">
        <div>
          <h1 className="hero-title">{t.overview.title}</h1>
          <p className="hero-sub">{heroSubtitle}</p>
        </div>
        <div className="hero-actions" aria-label={t.overview.quickActions}>
          <Link className="hero-action" href={`${prefix}/competitions`}>{t.nav.competitions}</Link>
          <Link className="hero-action" href={`${prefix}/match-predictor`}>{t.overview.quickMatch}</Link>
          <Link className="hero-action" href={`${prefix}/tournament-simulator/world_cup_2026`}>{t.overview.quickTournament}</Link>
          <Link className="hero-action" href={`${prefix}/team-comparison`}>{t.overview.quickTeam}</Link>
          <Link className="hero-action" href={`${prefix}/sentiment`}>{t.overview.quickSentiment}</Link>
        </div>
      </header>

      {isSample && <SampleBanner t={t} />}

      <section aria-labelledby="today-h">
        <h2 id="today-h" className="section-title">{t.overview.todayHighlights}</h2>
        {featured.length ? (
          <div className="match-grid">
            {featured.map(({ p }) => (
              <MatchCard key={p.prediction_id} p={p} t={t} locale={locale} isSample={isSample} />
            ))}
          </div>
        ) : (
          <p className="muted">{t.common.noFixtures}</p>
        )}
      </section>

      <section aria-labelledby="comp-h">
        <h2 id="comp-h" className="section-title">{t.overview.browseCompetitions}</h2>
        <div className="comp-grid">
          {competitions.map((c) => (
            <CompetitionCard
              key={c.competition_id}
              competitionId={c.competition_id}
              fallbackName={c.name}
              format={c.format}
              thisWeekCount={thisWeekByComp[c.competition_id] ?? 0}
              isSample={isSample}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
