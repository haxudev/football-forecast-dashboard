import Link from 'next/link';
import type { Prediction } from '@/lib/schemas';
import { isPackStale, isPredictorDisabled, packAgeLabel } from '@/lib/status';

export function formatCompetitionId(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export function TruthChip({ value }: { value: string }) {
  const tone = value === 'REAL' || value === 'REAL_DERIVED' ? 'truth-ok' : value === 'UNKNOWN' ? 'truth-err' : 'truth-warn';
  return <span className={`chip ${tone}`}>{value.replace('SAMPLE_ONLY', 'SAMPLE')}</span>;
}

export function ConfidenceChip({ value }: { value: string }) {
  return <span className={`chip confidence-${value.toLowerCase()}`}>{value}</span>;
}

export function StatusStrip({ truth = 'SAMPLE_ONLY', model = 'football_ensemble@local', generatedAt }: { truth?: string; model?: string; generatedAt?: string }) {
  const stale = generatedAt ? isPackStale(generatedAt) : false;
  return (
    <div className="status-strip" role="status" aria-live="polite">
      <span className={stale ? 'text-[#F59E0B]' : 'text-[#10B981]'}>●</span>
      <span>System {stale ? 'stale' : 'healthy'}</span>
      <span className="hidden sm:inline">|</span>
      <span>Truth: <b className="text-[#F59E0B]">{truth.replace('SAMPLE_ONLY', 'SAMPLE')}</b></span>
      {generatedAt && <span className="hidden min-[520px]:inline">| Pack: {packAgeLabel(generatedAt)}</span>}
      <span className="hidden md:inline">| Model: {model}</span>
    </div>
  );
}

export function WarningBanner({ children, tone = 'warn' }: { children: React.ReactNode; tone?: 'warn' | 'err' | 'info' }) {
  return <div className={`notice notice-${tone}`} role={tone === 'err' ? 'alert' : 'status'}>{children}</div>;
}

export function ProbabilityBar({ p }: { p: Prediction }) {
  const label = `Win/draw/loss probabilities: home ${(p.p_home * 100).toFixed(1)} percent, draw ${(p.p_draw * 100).toFixed(1)} percent, away ${(p.p_away * 100).toFixed(1)} percent.`;
  const rows = [['Home', p.p_home], ['Draw', p.p_draw], ['Away', p.p_away]] as const;
  return (
    <div role="img" aria-label={label} className="min-w-0">
      <div className="space-y-2 sm:hidden">
        {rows.map(([name, value]) => <div className="prob-mobile-row grid gap-1" key={name}><div className="font-mono text-xs">{name} {(value * 100).toFixed(1)}%</div><div className="probbar"><span style={{ width: name === 'Home' ? `${value * 100}%` : '0%' }} /><span style={{ width: name === 'Draw' ? `${value * 100}%` : '0%' }} /><span style={{ width: name === 'Away' ? `${value * 100}%` : '0%' }} /></div></div>)}
      </div>
      <div className="hidden sm:block">
        <div className="prob-label-row">
          <span>H {(p.p_home * 100).toFixed(1)}%</span>
          <span>D {(p.p_draw * 100).toFixed(1)}%</span>
          <span>A {(p.p_away * 100).toFixed(1)}%</span>
        </div>
        <div className="probbar"><span style={{ width: `${p.p_home * 100}%` }} /><span style={{ width: `${p.p_draw * 100}%` }} /><span style={{ width: `${p.p_away * 100}%` }} /></div>
      </div>
      <table className="sr-only"><caption>Probability table</caption><tbody><tr><th scope="row">Home</th><td>{p.p_home}</td></tr><tr><th scope="row">Draw</th><td>{p.p_draw}</td></tr><tr><th scope="row">Away</th><td>{p.p_away}</td></tr></tbody></table>
    </div>
  );
}

export function MatchCard({ p }: { p: Prediction }) {
  return (
    <article className="card min-w-0" aria-label={`${p.home_team ?? p.home_team_id} versus ${p.away_team ?? p.away_team_id}`}>
      <div className="mb-3 flex min-w-0 flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm text-[#A8B4C8]">{formatCompetitionId(p.competition_id)}</div>
          <h3 className="truncate font-semibold">{p.home_team ?? p.home_team_id} vs {p.away_team ?? p.away_team_id}</h3>
        </div>
        <TruthChip value={p.data_truth_mode} />
      </div>
      <ProbabilityBar p={p} />
      <div className="prob-mobile-row mt-3 flex min-w-0 flex-wrap justify-between gap-2 text-xs text-[#A8B4C8]">
        <ConfidenceChip value={p.confidence_label} />
        <span className="min-w-0 break-words font-mono">xG {p.expected_goals_home.toFixed(2)} – {p.expected_goals_away.toFixed(2)}</span>
      </div>
    </article>
  );
}

export function DataStatePanel({ generatedAt }: { generatedAt: string }) {
  const disabled = isPredictorDisabled(generatedAt);
  const stale = isPackStale(generatedAt);
  if (!stale) return null;
  return <WarningBanner tone={disabled ? 'err' : 'warn'}>{disabled ? 'Forecast pack is older than 72h. Match Predictor run controls are disabled; showing last-known static data.' : 'Forecast pack is stale (>24h). Treat predictions as lower confidence last-known data.'}</WarningBanner>;
}

export function Nav() {
  const items = [['/', 'Overview'], ['/competitions', 'Competitions'], ['/match-predictor', 'Match Predictor'], ['/tournament-simulator/world_cup_2026', 'Tournament Simulator'], ['/team-comparison', 'Team Comparison'], ['/model-diagnostics', 'Model Diagnostics'], ['/data-quality', 'Data Quality']];
  return <nav aria-label="Primary" className="nav-scroll">{items.map(([href, label]) => <Link className="nav-link" key={href} href={href}>{label}</Link>)}</nav>;
}
