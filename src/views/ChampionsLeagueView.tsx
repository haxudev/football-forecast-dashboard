/**
 * P5 Sprint 4 — Stage 5 dashboard CL UI (eng-dev 接力 #2).
 *
 * Renders Champions League with:
 *  - Swiss league-phase 3-tier table (Top 8 / Playoff 9-24 / Dropout 25-36)
 *  - Knockout bracket as ranked list (R16 → Final → Champion probability)
 *
 * Data source: manifest.cl_league_phase_table (36 rows) + manifest.cl_knockout_bracket (36 rows).
 * Per D-008 contingency, bracket is a list view (not visual SVG) — kept inline simple.
 */
import { SampleBanner } from '@/components/Shell';
import { TruthBadge } from '@/components/TruthBadge';
import { loadManifest, loadOverview, loadTeams } from '@/lib/data';
import {
  formatCountry,
  formatVenue,
  getDictionary,
  localizedCompetitionName,
  localizedTeamFromId,
  type Locale,
} from '@/lib/i18n';

interface SwissRow {
  team_id: string;
  season_id: string;
  p_top8: number;
  p_playoff: number;
  p_dropout: number;
  expected_points: number;
  remaining_games: number;
}
interface KORow {
  team_id: string;
  season_id: string;
  p_r16: number;
  p_qf: number;
  p_sf: number;
  p_final: number;
  p_champion: number;
}

function pct(v: number | undefined): string {
  if (v === undefined || v === null) return '—';
  return `${(v * 100).toFixed(1)}%`;
}

export function ChampionsLeagueView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const overview = loadOverview();
  const isSample = overview.data_truth_mode_summary === 'SAMPLE_ONLY';
  const manifest = loadManifest() as unknown as Record<string, unknown>;
  const competitionId = 'champions_league';

  const cl_league: SwissRow[] = (manifest.cl_league_phase_table as SwissRow[] | undefined) ?? [];
  const cl_ko: KORow[] = (manifest.cl_knockout_bracket as KORow[] | undefined) ?? [];
  const sim_var = (manifest.simulation_variance as { cl?: { p_top8_std?: number; p_playoff_std?: number; p_champion_std?: number; iterations_league?: number; iterations_ko?: number } } | undefined)?.cl;
  const playoff_status = (manifest.cl_playoff_status as string | undefined) ?? 'real';
  const compTruthMode = String((manifest.data_truth_mode as Record<string, string>)[competitionId] ?? overview.data_truth_mode_summary);

  // Sort league by expected_points desc → 3-tier split
  const ranked = cl_league.slice().sort((a, b) => b.expected_points - a.expected_points);
  const direct = ranked.slice(0, 8);
  const playoffZone = ranked.slice(8, 24);
  const dropout = ranked.slice(24);

  const koRanked = cl_ko.slice().sort((a, b) => b.p_champion - a.p_champion);
  const top8KO = koRanked.slice(0, 8);

  // Team metadata index (country/venue) for per-team annotation
  const teamsList = (() => {
    try {
      return loadTeams();
    } catch {
      return [];
    }
  })();
  const teamMeta = new Map<string, { country?: string | null; venue?: string | null; name: string }>();
  for (const tm of teamsList) teamMeta.set(tm.team_id, { country: tm.country, venue: tm.venue, name: tm.canonical_name });

  const displayName = localizedCompetitionName(competitionId, 'UEFA Champions League', locale);

  if (cl_league.length === 0 && cl_ko.length === 0) {
    return (
      <div className="space-y-6">
        <header className="page-header">
          <h1 className="page-title">{displayName}</h1>
        </header>
        <p className="muted">{t.cl.noData}</p>
      </div>
    );
  }

  const teamLabel = (tid: string) => {
    const meta = teamMeta.get(tid);
    if (meta) {
      // Use canonical name if found; falls back to team_id slug
      return meta.name;
    }
    return localizedTeamFromId(tid, locale);
  };

  const rowAnnotation = (tid: string): string => {
    const meta = teamMeta.get(tid);
    const parts: string[] = [];
    if (meta?.country) parts.push(formatCountry(meta.country, locale));
    if (meta?.venue) parts.push(formatVenue(meta.venue, locale));
    return parts.join(' · ');
  };

  const SectionTable = ({ title, rows, accent }: { title: string; rows: SwissRow[]; accent: string }) => (
    <section className="card" aria-labelledby={`section-${title}`}>
      <h2 id={`section-${title}`} className="font-semibold mb-3" style={{ color: accent }}>
        {title} <span className="text-sm text-[var(--text-secondary)]">· {rows.length}</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm" data-testid="cl-swiss-table">
          <thead>
            <tr className="text-left text-[var(--text-secondary)]">
              <th className="px-2 py-1">#</th>
              <th className="px-2 py-1">{t.cl.colTeam}</th>
              <th className="px-2 py-1 text-right">{t.cl.colExpectedPoints}</th>
              <th className="px-2 py-1 text-right">{t.cl.colPTop8}</th>
              <th className="px-2 py-1 text-right">{t.cl.colPPlayoff}</th>
              <th className="px-2 py-1 text-right">{t.cl.colPDropout}</th>
              <th className="px-2 py-1 text-right">{t.cl.colRemaining}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.team_id} className="border-t border-[var(--border-subtle)]">
                <td className="px-2 py-1 font-mono text-[var(--text-secondary)]">{i + 1}</td>
                <td className="px-2 py-1">
                  <div className="font-medium">{teamLabel(r.team_id)}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{rowAnnotation(r.team_id)}</div>
                </td>
                <td className="px-2 py-1 text-right font-mono">{r.expected_points.toFixed(1)}</td>
                <td className="px-2 py-1 text-right font-mono">{pct(r.p_top8)}</td>
                <td className="px-2 py-1 text-right font-mono">{pct(r.p_playoff)}</td>
                <td className="px-2 py-1 text-right font-mono">{pct(r.p_dropout)}</td>
                <td className="px-2 py-1 text-right font-mono">{r.remaining_games}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      <header className="page-header">
        <p className="page-eyebrow">{t.nav.tournamentSimulator}</p>
        <h1 className="page-title">{displayName}</h1>
        <p className="page-sub">{t.cl.subtitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2" data-testid="truth-badges">
          <TruthBadge mode={compTruthMode} locale={locale} label={`${competitionId}: ${compTruthMode}`} />
          {playoff_status === 'inferred_from_league_phase' && (
            <span className="text-xs text-[var(--text-secondary)]">{t.cl.playoffInferred}</span>
          )}
        </div>
      </header>

      {isSample && <SampleBanner t={t} />}

      {/* Swiss League Phase 3-tier */}
      <section aria-labelledby="cl-swiss-h">
        <h2 id="cl-swiss-h" className="section-title">{t.cl.tabSwiss}</h2>
        <div className="space-y-4">
          <SectionTable title={t.cl.swissDirect} rows={direct} accent="#10B981" />
          <SectionTable title={t.cl.swissPlayoff} rows={playoffZone} accent="#F59E0B" />
          <SectionTable title={t.cl.swissDropout} rows={dropout} accent="#9CA3AF" />
        </div>
      </section>

      {/* Knockout list view (per D-008 contingency: list, not SVG) */}
      <section className="card" aria-labelledby="cl-bracket-h">
        <h2 id="cl-bracket-h" className="font-semibold mb-3">{t.cl.tabBracket}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" data-testid="cl-bracket-table">
            <thead>
              <tr className="text-left text-[var(--text-secondary)]">
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">{t.cl.colTeam}</th>
                <th className="px-2 py-1 text-right">{t.cl.bracketRoundR16}</th>
                <th className="px-2 py-1 text-right">{t.cl.bracketRoundQF}</th>
                <th className="px-2 py-1 text-right">{t.cl.bracketRoundSF}</th>
                <th className="px-2 py-1 text-right">{t.cl.bracketRoundF}</th>
                <th className="px-2 py-1 text-right" style={{ color: '#22D3EE' }}>{t.cl.bracketRoundChampion}</th>
              </tr>
            </thead>
            <tbody>
              {top8KO.map((r, i) => (
                <tr key={r.team_id} className="border-t border-[var(--border-subtle)]">
                  <td className="px-2 py-1 font-mono text-[var(--text-secondary)]">{i + 1}</td>
                  <td className="px-2 py-1">
                    <div className="font-medium">{teamLabel(r.team_id)}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{rowAnnotation(r.team_id)}</div>
                  </td>
                  <td className="px-2 py-1 text-right font-mono">{pct(r.p_r16)}</td>
                  <td className="px-2 py-1 text-right font-mono">{pct(r.p_qf)}</td>
                  <td className="px-2 py-1 text-right font-mono">{pct(r.p_sf)}</td>
                  <td className="px-2 py-1 text-right font-mono">{pct(r.p_final)}</td>
                  <td className="px-2 py-1 text-right font-mono" style={{ color: '#22D3EE' }}>{pct(r.p_champion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sim_var && (
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            {t.cl.simulationVariance}: p_top8={sim_var.p_top8_std?.toFixed(4) ?? '—'} ·
            p_playoff={sim_var.p_playoff_std?.toFixed(4) ?? '—'} ·
            p_champion={sim_var.p_champion_std?.toFixed(4) ?? '—'} ·
            {' '}{t.cl.iterationsLabel} {sim_var.iterations_league ?? '—'} (league) / {sim_var.iterations_ko ?? '—'} (KO)
          </p>
        )}
      </section>
    </div>
  );
}
