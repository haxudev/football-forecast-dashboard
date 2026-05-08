import Link from 'next/link';
import { DataStatePanel, MatchCard, TruthChip, WarningBanner } from '@/components/Cards';
import { loadAllPredictions, loadCompetitions, loadManifest, loadOverview } from '@/lib/data';
import { formatCompetitionFormat, formatCompetitionName, getDictionary, type Locale } from '@/lib/i18n';
import { packAgeLabel } from '@/lib/status';

export function OverviewPage({ locale = 'zh' }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const prefix = locale === 'en' ? '/en' : '';
  const manifest = loadManifest();
  const overview = loadOverview();
  const preds = loadAllPredictions();
  const competitions = loadCompetitions();
  const metrics = [
    [t.overview.system, overview.system_status, t.overview.systemText],
    [t.common.truth, overview.data_truth_mode_summary, t.overview.truthText],
    [t.overview.models, `${Object.keys(manifest.model_version).length} ${t.overview.scopes}`, overview.model_version_summary],
    [t.overview.lastPack, packAgeLabel(manifest.generated_at), manifest.generated_at],
    [t.overview.sources, `${Object.keys(manifest.source_freshness).length}/1 ${t.overview.sourceText}`, Object.entries(manifest.source_freshness).map(([k, v]) => `${k}: ${v}`).join(', ')],
  ];
  return <div className="space-y-6">
    <header className="page-header flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h1 className="text-3xl font-semibold">{t.overview.title}</h1><p className="mt-2 text-sm text-[#A8B4C8]">{t.overview.subtitle}</p></div><TruthChip value={overview.data_truth_mode_summary} /></header>
    <DataStatePanel generatedAt={overview.generated_at} t={t} />
    <section className="metric-grid" aria-label={t.overview.metricsLabel}>{metrics.map(([a, b, c]) => <div className="card" key={a}><div className="flex items-center justify-between gap-2"><div className="text-xs text-[#A8B4C8]">{a}</div><span className="text-[#10B981]">●</span></div><div className="mt-2 break-words font-mono text-2xl">{b}</div><p className="mt-2 text-xs text-[#A8B4C8]">{c}</p></div>)}</section>
    <section className="card hero-competition"><div><div className="text-sm font-semibold text-[#14B8A6]">{t.overview.competitionFocus}</div><h2 className="mt-2 text-2xl font-semibold">{t.overview.featuredCompetitions}</h2><p className="mt-2 text-sm text-[#A8B4C8]">{t.overview.competitionFocusText}</p></div><Link className="nav-link hero-link" href={`${prefix}/competitions`}>{t.nav.competitions}</Link></section>
    <section className="overview-section-grid"><div><h2 className="mb-3 text-xl font-semibold">{t.overview.topResearchCases}</h2><div className="grid gap-4">{preds.slice(0, 3).map(p => <MatchCard key={p.prediction_id} p={p} t={t} />)}</div></div><div><h2 className="mb-3 text-xl font-semibold">{t.overview.uncertaintyWatch}</h2><div className="grid gap-4">{preds.slice(3, 6).map(p => <MatchCard key={p.prediction_id} p={p} t={t} />)}{!preds.slice(3, 6).length && <WarningBanner tone="info">{t.overview.limitedCoverage}</WarningBanner>}</div></div></section>
    <section><h2 className="mb-3 text-xl font-semibold">{t.overview.featuredCompetitions}</h2><div className="competition-grid">{competitions.map(c => <Link href={`${prefix}/competitions/${c.competition_id}`} className="card competition-card block no-underline" key={c.competition_id}><div className="text-xs uppercase tracking-wide text-[#A8B4C8]">{formatCompetitionFormat(c.format, locale)}</div><h3 className="mt-2 font-semibold">{formatCompetitionName(c.name, locale)}</h3><p className="mt-2 text-sm text-[#A8B4C8]">{t.common.truth} <TruthChip value={overview.data_truth_mode_summary} /> · {t.common.pack} {packAgeLabel(overview.generated_at)}</p><p className="mt-3 text-sm text-[#22D3EE]">{t.common.openCompetition}</p></Link>)}</div></section>
    <section className="overview-section-grid"><div className="card"><h2 className="font-semibold">{t.overview.modelHealth}</h2><p className="mt-2 text-sm text-[#A8B4C8]">{t.overview.modelHealthText}<span className="font-mono">{overview.model_version_summary}</span>.</p><Link className="mt-3 inline-block text-sm text-[#22D3EE] underline" href={`${prefix}/model-diagnostics`}>{t.common.viewDiagnostics}</Link></div><div className="card"><h2 className="font-semibold">{t.overview.dataPackSnapshot}</h2><p className="mt-2 text-sm text-[#A8B4C8]">{t.common.pack} <span className="font-mono">{manifest.pack_version}</span> · {t.common.generated} <span className="font-mono">{manifest.generated_at}</span> · {t.common.warnings} {manifest.warnings.length}. {t.overview.fallbackNote}</p></div></section>
  </div>;
}

export default function Page() { return <OverviewPage locale="zh" />; }
