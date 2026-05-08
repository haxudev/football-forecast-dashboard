import { RadarChart } from '@/components/Charts';
import { SampleBanner } from '@/components/Shell';
import { loadOverview, loadTeamCompare } from '@/lib/data';
import { getDictionary, localizedTeamName, type Locale } from '@/lib/i18n';

export function TeamComparisonView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const overview = loadOverview();
  const isSample = overview.data_truth_mode_summary === 'SAMPLE_ONLY';
  const data = loadTeamCompare();
  const teams = data.teams.slice(0, 2);

  const stats = [
    { label: t.team.recentForm, a: 'W W D L W', b: 'W D W W L' },
    { label: t.team.avgScore, a: '1.6', b: '1.5' },
    { label: t.team.avgConceded, a: '1.1', b: '1.3' },
    { label: t.team.homeStrength, a: '★★★★☆', b: '★★★☆☆' },
    { label: t.team.awayStrength, a: '★★★☆☆', b: '★★★★☆' },
    { label: t.team.keyAvailability, a: '90%', b: '85%' },
  ];

  return (
    <div className="space-y-6">
      <header className="page-header">
        <h1 className="page-title">{t.team.title}</h1>
        <p className="page-sub">{t.team.subtitle}</p>
      </header>

      {isSample && <SampleBanner t={t} />}

      <section className="card">
        <div className="picker-grid">
          <select aria-label={t.team.teamA} className="select-control" defaultValue={teams[0]?.team_id}>
            {data.teams.map((tm) => (
              <option key={`a-${tm.team_id}`} value={tm.team_id}>{localizedTeamName(tm.canonical_name, locale)}</option>
            ))}
          </select>
          <select aria-label={t.team.teamB} className="select-control" defaultValue={teams[1]?.team_id}>
            {data.teams.map((tm) => (
              <option key={`b-${tm.team_id}`} value={tm.team_id}>{localizedTeamName(tm.canonical_name, locale)}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="compare-grid">
        <div className="card compare-col">
          <h2 className="compare-team-name">{localizedTeamName(teams[0]?.canonical_name ?? '', locale) || t.team.teamA}</h2>
        </div>
        <div className="compare-vs" aria-hidden="true">{t.common.vs}</div>
        <div className="card compare-col">
          <h2 className="compare-team-name">{localizedTeamName(teams[1]?.canonical_name ?? '', locale) || t.team.teamB}</h2>
        </div>
      </section>

      <section className="card">
        <table className="compare-table">
          <caption className="sr-only">{t.team.title}</caption>
          <thead>
            <tr>
              <th scope="col">{t.common.team}</th>
              <th scope="col">{localizedTeamName(teams[0]?.canonical_name ?? '', locale) || t.team.teamA}</th>
              <th scope="col">{localizedTeamName(teams[1]?.canonical_name ?? '', locale) || t.team.teamB}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.a}</td>
                <td>{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card chart-card">
        <h2 className="font-semibold mb-2">{t.charts.radar}</h2>
        <RadarChart teams={teams.map((tm) => tm.canonical_name)} t={t} locale={locale} />
      </section>

      <p className="caveat">{t.team.caveat}</p>
    </div>
  );
}
