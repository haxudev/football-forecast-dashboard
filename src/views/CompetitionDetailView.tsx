import { MatchCard, SampleBanner } from '@/components/Shell';
import { loadCompetitions, loadOverview, loadPredictions } from '@/lib/data';
import {
  format,
  getDictionary,
  localizedCompetitionName,
  localizedCompetitionShortName,
  type Locale,
} from '@/lib/i18n';
import { deriveMatchStage } from '@/lib/status';

export function CompetitionDetailView({ locale, competitionId }: { locale: Locale; competitionId: string }) {
  const t = getDictionary(locale);
  const overview = loadOverview();
  const isSample = overview.data_truth_mode_summary === 'SAMPLE_ONLY';
  const competitions = loadCompetitions();
  const comp = competitions.find((c) => c.competition_id === competitionId);
  const fallbackName = comp?.name ?? competitionId;
  const displayName = localizedCompetitionName(competitionId, fallbackName, locale);
  const preds = (() => {
    try {
      return loadPredictions(competitionId);
    } catch {
      return [];
    }
  })();

  const now = new Date();
  const enriched = preds
    .map((p) => ({ p, info: deriveMatchStage(p.kickoff_utc, { t, locale, now }) }))
    .sort((a, b) => new Date(a.p.kickoff_utc).getTime() - new Date(b.p.kickoff_utc).getTime());

  // Coming-up banner: nearest PRE within 24h
  const banner = enriched.find(({ p, info }) => {
    if (info.stage !== 'PRE') return false;
    const minutes = (new Date(p.kickoff_utc).getTime() - now.getTime()) / 60_000;
    return minutes >= 0 && minutes <= 24 * 60;
  });

  // This-week list: within +/- 7 days
  const weekMs = 7 * 86_400_000;
  const thisWeek = enriched.filter(({ p }) => {
    const ts = new Date(p.kickoff_utc).getTime();
    if (Number.isNaN(ts)) return false;
    return ts >= now.getTime() - weekMs && ts <= now.getTime() + weekMs;
  });

  return (
    <div className="space-y-6">
      <header className="page-header">
        <p className="page-eyebrow">
          {comp?.format === 'tournament' ? t.competitions.formatTournament : t.competitions.formatLeague}
          {' · '}
          {localizedCompetitionShortName(competitionId, fallbackName, locale)}
        </p>
        <h1 className="page-title">{displayName}</h1>
        <p className="page-sub">{t.competitions.researchNoteText}</p>
      </header>

      {isSample && <SampleBanner t={t} />}

      {banner && (
        <section className="upcoming-banner" aria-labelledby="upcoming-h">
          <h2 id="upcoming-h" className="upcoming-title">
            <span aria-hidden="true">🟢</span> {t.competitions.upcomingBanner}
          </h2>
          <MatchCard p={banner.p} t={t} locale={locale} isSample={isSample} />
        </section>
      )}

      <section aria-labelledby="week-h">
        <h2 id="week-h" className="section-title">
          {t.competitions.thisWeekFixtures}{' '}
          <span className="section-meta">{format(t.competitions.thisWeekCount, { n: thisWeek.length })}</span>
        </h2>
        {thisWeek.length ? (
          <div className="match-grid">
            {thisWeek.map(({ p }) => (
              <MatchCard key={p.prediction_id} p={p} t={t} locale={locale} isSample={isSample} />
            ))}
          </div>
        ) : enriched.length ? (
          <div className="match-grid">
            {enriched.slice(0, 6).map(({ p }) => (
              <MatchCard key={p.prediction_id} p={p} t={t} locale={locale} isSample={isSample} />
            ))}
          </div>
        ) : (
          <p className="muted">{t.competitions.noUpcoming}</p>
        )}
      </section>
    </div>
  );
}
