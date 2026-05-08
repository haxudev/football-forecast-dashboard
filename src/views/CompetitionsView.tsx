import { CompetitionCard, SampleBanner } from '@/components/Shell';
import { loadAllPredictions, loadCompetitions, loadOverview } from '@/lib/data';
import { getDictionary, type Locale } from '@/lib/i18n';

export function CompetitionsView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const overview = loadOverview();
  const isSample = overview.data_truth_mode_summary === 'SAMPLE_ONLY';
  const preds = loadAllPredictions();
  const now = new Date().getTime();
  const weekMs = 7 * 86_400_000;
  const thisWeekByComp = preds.reduce<Record<string, number>>((acc, p) => {
    const ts = new Date(p.kickoff_utc).getTime();
    if (!Number.isNaN(ts) && ts >= now - weekMs && ts <= now + weekMs) {
      acc[p.competition_id] = (acc[p.competition_id] ?? 0) + 1;
    }
    return acc;
  }, {});
  return (
    <div className="space-y-6">
      <header className="page-header">
        <h1 className="page-title">{t.competitions.title}</h1>
        <p className="page-sub">{t.competitions.subtitle}</p>
      </header>
      {isSample && <SampleBanner t={t} />}
      <div className="comp-grid">
        {loadCompetitions().map((c) => (
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
      <p className="muted text-sm">{t.competitions.researchNoteText}</p>
    </div>
  );
}
