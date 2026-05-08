import { ProbabilityEChart, ScorelineHeatmap } from '@/components/Charts';
import { MatchCard, SampleBanner, StageChip } from '@/components/Shell';
import { loadAllPredictions, loadOverview } from '@/lib/data';
import {
  format,
  getDictionary,
  localizedCompetitionShortName,
  localizedTeamFromId,
  localizedTeamName,
  type Locale,
} from '@/lib/i18n';
import { deriveMatchStage } from '@/lib/status';

export function MatchPredictorView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const overview = loadOverview();
  const isSample = overview.data_truth_mode_summary === 'SAMPLE_ONLY';
  const preds = loadAllPredictions();
  const p = preds[0];
  if (!p) {
    return (
      <div className="space-y-6">
        <header className="page-header">
          <h1 className="page-title">{t.match.title}</h1>
          <p className="page-sub">{t.match.subtitle}</p>
        </header>
        <p className="muted">{t.match.noData}</p>
      </div>
    );
  }
  const home = localizedTeamName(p.home_team, locale) || localizedTeamFromId(p.home_team_id, locale);
  const away = localizedTeamName(p.away_team, locale) || localizedTeamFromId(p.away_team_id, locale);
  const summary = format(t.match.summaryTemplate, {
    home,
    away,
    ph: Math.round(p.p_home * 100),
    pd: Math.round(p.p_draw * 100),
    pa: Math.round(p.p_away * 100),
  });
  const stage = deriveMatchStage(p.kickoff_utc, { t, locale });

  const factors = [
    t.match.factorHomeAdvantage,
    t.match.factorRecentForm,
    t.match.factorAttackDefense,
    t.match.factorScoringDiff,
    t.match.factorKeyPlayers,
  ];

  return (
    <div className="space-y-6">
      <header className="page-header">
        <h1 className="page-title">{t.match.title}</h1>
        <p className="page-sub">{t.match.subtitle}</p>
      </header>

      {isSample && <SampleBanner t={t} />}

      <section className="card" aria-labelledby="picker-h">
        <h2 id="picker-h" className="font-semibold">{t.match.selector}</h2>
        <div className="picker-grid">
          <select aria-label={t.nav.competitions} className="select-control">
            {Array.from(new Set(preds.map((x) => x.competition_id))).map((id) => (
              <option key={id} value={id}>{localizedCompetitionShortName(id, id.replaceAll('_', ' '), locale)}</option>
            ))}
          </select>
          <select aria-label={t.team.teamA} className="select-control" defaultValue={p.home_team_id}>
            {preds.map((x) => (
              <option key={`h-${x.prediction_id}`} value={x.home_team_id}>{localizedTeamName(x.home_team, locale) || localizedTeamFromId(x.home_team_id, locale)}</option>
            ))}
          </select>
          <select aria-label={t.team.teamB} className="select-control" defaultValue={p.away_team_id}>
            {preds.map((x) => (
              <option key={`a-${x.prediction_id}`} value={x.away_team_id}>{localizedTeamName(x.away_team, locale) || localizedTeamFromId(x.away_team_id, locale)}</option>
            ))}
          </select>
          <button type="button" className="select-control button-cta" disabled aria-disabled>
            {t.match.run}
          </button>
        </div>
      </section>

      <section className="big-prob-grid">
        <div className="big-prob-card">
          <div className="big-prob-label">{t.match.home}</div>
          <div className="big-prob-value">{(p.p_home * 100).toFixed(0)}<span className="big-prob-unit">%</span></div>
        </div>
        <div className="big-prob-card">
          <div className="big-prob-label">{t.match.draw}</div>
          <div className="big-prob-value">{(p.p_draw * 100).toFixed(0)}<span className="big-prob-unit">%</span></div>
        </div>
        <div className="big-prob-card">
          <div className="big-prob-label">{t.match.away}</div>
          <div className="big-prob-value">{(p.p_away * 100).toFixed(0)}<span className="big-prob-unit">%</span></div>
        </div>
      </section>

      <section className="card">
        <div className="match-card-head">
          <span className="chip chip-comp">{home} {t.common.vs} {away}</span>
          <StageChip stage={stage.stage} t={t} />
        </div>
        <p className="text-base mt-3">{summary}</p>
        {stage.kickoffLabel && <p className="muted text-sm mt-2">{stage.kickoffLabel}{stage.subline ? ` · ${stage.subline}` : ''}</p>}
      </section>

      <section className="chart-grid">
        <div className="card chart-card">
          <h2 className="font-semibold mb-2">{t.match.home} / {t.match.draw} / {t.match.away}</h2>
          <ProbabilityEChart prediction={p} t={t} />
        </div>
        <div className="card chart-card">
          <h2 className="font-semibold mb-2">{t.charts.heatmap}</h2>
          <ScorelineHeatmap prediction={p} t={t} />
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold mb-2">{t.match.factors}</h2>
        <div className="factor-row">
          {factors.map((f) => (
            <span key={f} className="chip chip-factor">{f}</span>
          ))}
        </div>
      </section>

      <section aria-labelledby="other-h">
        <h2 id="other-h" className="section-title">{t.competitions.thisWeekFixtures}</h2>
        <div className="match-grid">
          {preds.slice(0, 4).map((x) => (
            <MatchCard key={x.prediction_id} p={x} t={t} locale={locale} isSample={isSample} />
          ))}
        </div>
      </section>

      <p className="caveat">{t.match.caveat}</p>
    </div>
  );
}
