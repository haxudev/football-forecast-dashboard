import { AdvancementBars } from '@/components/Charts';
import { BracketView } from '@/components/Bracket';
import { SampleBanner } from '@/components/Shell';
import { loadCompetitions, loadOverview, tryLoadTournament } from '@/lib/data';
import {
  getDictionary,
  localizedCompetitionShortName,
  localizedTeamFromId,
  type Locale,
} from '@/lib/i18n';

export function TournamentSimulatorView({ locale, competitionId }: { locale: Locale; competitionId: string }) {
  const t = getDictionary(locale);
  const overview = loadOverview();
  const isSample = overview.data_truth_mode_summary === 'SAMPLE_ONLY';
  const tournament = tryLoadTournament(competitionId);
  const sims = tournament?.simulations ?? [];
  const compName = localizedCompetitionShortName(
    competitionId,
    loadCompetitions().find((c) => c.competition_id === competitionId)?.name ?? competitionId,
    locale,
  );

  const sortedByChampion = sims.slice().sort((a, b) => b.champion_probability - a.champion_probability).slice(0, 8);
  const sortedByAdvance = sims.slice().sort((a, b) => b.advance_probability - a.advance_probability).slice(0, 8);

  return (
    <div className="space-y-6">
      <header className="page-header tour-header">
        <p className="page-eyebrow">{t.nav.tournamentSimulator}</p>
        <h1 className="page-title tour-title">{compName}</h1>
        <p className="page-sub">{t.tournament.subtitle}</p>
      </header>

      {isSample && <SampleBanner t={t} />}

      {sims.length ? (
        <>
          <section className="card chart-card">
            <h2 className="font-semibold mb-2">{t.tournament.advanceProbability}</h2>
            <AdvancementBars simulations={sims} t={t} locale={locale} />
          </section>

          <section className="podium-grid">
            <div className="card">
              <h2 className="font-semibold mb-2">🏆 {t.tournament.championProbability}</h2>
              <ol className="podium-list">
                {sortedByChampion.map((s) => (
                  <li key={s.team_id} className="podium-row">
                    <span className="podium-team">{localizedTeamFromId(s.team_id, locale)}</span>
                    <span className="podium-value">{(s.champion_probability * 100).toFixed(1)}%</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="card">
              <h2 className="font-semibold mb-2">⏭ {t.tournament.advanceProbability}</h2>
              <ol className="podium-list">
                {sortedByAdvance.map((s) => (
                  <li key={s.team_id} className="podium-row">
                    <span className="podium-team">{localizedTeamFromId(s.team_id, locale)}</span>
                    <span className="podium-value">{(s.advance_probability * 100).toFixed(1)}%</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <BracketView simulations={sims} t={t} locale={locale} />

          <p className="caveat">{t.tournament.caveat}</p>
        </>
      ) : (
        <p className="muted">{t.tournament.noSimulation}</p>
      )}
    </div>
  );
}
