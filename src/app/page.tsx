import Link from 'next/link';
import { DataStatePanel, MatchCard, TruthChip, WarningBanner } from '@/components/Cards';
import { loadAllPredictions, loadCompetitions, loadManifest, loadOverview } from '@/lib/data';
import { packAgeLabel } from '@/lib/status';

export default function Page() {
  const manifest = loadManifest();
  const overview = loadOverview();
  const preds = loadAllPredictions();
  const competitions = loadCompetitions();
  const metrics = [
    ['System', overview.system_status, 'Static export + data pack loaded'],
    ['Truth', overview.data_truth_mode_summary, 'Fallback/sample states stay amber'],
    ['Models', `${Object.keys(manifest.model_version).length} scopes`, overview.model_version_summary],
    ['Last pack', packAgeLabel(manifest.generated_at), manifest.generated_at],
    ['Sources', `${Object.keys(manifest.source_freshness).length}/1 fresh`, Object.entries(manifest.source_freshness).map(([k, v]) => `${k}: ${v}`).join(', ')],
  ];
  return <div className="space-y-6">
    <header className="page-header flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h1 className="text-3xl font-semibold">Forecast Overview</h1><p className="mt-2 text-sm text-[#A8B4C8]">Static forecast cockpit · probabilities, truth mode, confidence, model health, and data quality stay visible together.</p></div><TruthChip value={overview.data_truth_mode_summary} /></header>
    <DataStatePanel generatedAt={overview.generated_at} />
    <section className="metric-grid" aria-label="Five key forecast cockpit metrics">{metrics.map(([a, b, c]) => <div className="card" key={a}><div className="flex items-center justify-between gap-2"><div className="text-xs text-[#A8B4C8]">{a}</div><span className="text-[#10B981]">●</span></div><div className="mt-2 break-words font-mono text-2xl">{b}</div><p className="mt-2 text-xs text-[#A8B4C8]">{c}</p></div>)}</section>
    <section className="overview-section-grid"><div><h2 className="mb-3 text-xl font-semibold">Top confidence picks</h2><div className="grid gap-4">{preds.slice(0, 3).map(p => <MatchCard key={p.prediction_id} p={p} />)}</div></div><div><h2 className="mb-3 text-xl font-semibold">Upset watch / sample warnings</h2><div className="grid gap-4">{preds.slice(3, 6).map(p => <MatchCard key={p.prediction_id} p={p} />)}{!preds.slice(3, 6).length && <WarningBanner tone="info">Limited fixture coverage in this SAMPLE_ONLY pack; no production confidence is implied.</WarningBanner>}</div></div></section>
    <section><h2 className="mb-3 text-xl font-semibold">Featured competitions</h2><div className="competition-grid">{competitions.map(c => <Link href={`/competitions/${c.competition_id}`} className="card block no-underline" key={c.competition_id}><div className="text-xs uppercase tracking-wide text-[#A8B4C8]">{c.format}</div><h3 className="mt-2 font-semibold">{c.name}</h3><p className="mt-2 text-sm text-[#A8B4C8]">Truth <TruthChip value={overview.data_truth_mode_summary} /> · Pack {packAgeLabel(overview.generated_at)}</p></Link>)}</div></section>
    <section className="overview-section-grid"><div className="card"><h2 className="font-semibold">Model health</h2><p className="mt-2 text-sm text-[#A8B4C8]">Backtest metrics and calibration are available in Model Diagnostics. Current model version: <span className="font-mono">{overview.model_version_summary}</span>.</p><Link className="mt-3 inline-block text-sm text-[#22D3EE] underline" href="/model-diagnostics">View diagnostics →</Link></div><div className="card"><h2 className="font-semibold">Data pack snapshot</h2><p className="mt-2 text-sm text-[#A8B4C8]">Pack <span className="font-mono">{manifest.pack_version}</span> · generated <span className="font-mono">{manifest.generated_at}</span> · warnings {manifest.warnings.length}. Fallback/sample states are amber and never treated as real-data success.</p></div></section>
  </div>;
}
