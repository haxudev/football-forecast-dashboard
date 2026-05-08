import { TruthChip, WarningBanner } from '@/components/Cards';
import { loadDataQuality, loadLatest, loadManifest } from '@/lib/data';
import { getDictionary, type Locale } from '@/lib/i18n';
import { packAgeLabel } from '@/lib/status';

export function DataQualityPage({ locale = 'zh' }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const q = loadDataQuality();
  const latest = loadLatest();
  const manifest = loadManifest();
  return <div className="space-y-6"><header className="page-header flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h1 className="text-3xl font-semibold">{t.quality.title}</h1><p className="mt-2 text-sm text-[#A8B4C8]">{t.quality.subtitle}</p></div><TruthChip value={q.data_truth_mode_summary} /></header><section className="data-quality-grid"><div className="card"><div className="text-xs text-[#A8B4C8]">{t.quality.forecastPack}</div><div className="mt-2 break-words font-mono text-xl">{q.pack_version}</div></div><div className="card"><div className="text-xs text-[#A8B4C8]">{t.quality.modelSummary}</div><div className="mt-2 break-words font-mono text-xl">{latest.model_version_summary}</div></div><div className="card"><div className="text-xs text-[#A8B4C8]">{t.quality.packAge}</div><div className="mt-2 break-words font-mono text-xl">{packAgeLabel(q.generated_at)}</div></div></section><section className="card"><h2 className="font-semibold">{t.quality.sourceFreshness}</h2><div className="mt-4 space-y-1">{q.source_freshness.map(s => <div className="data-row" key={s.source_name}><span className="min-w-0 break-words">{s.source_name}</span><span className="source-chip-row"><span className="chip truth-ok">{s.freshness_status}</span>{s.forecast_impact.map(i => <span key={i} className="chip">{i}</span>)}</span></div>)}</div></section><section className="card"><h2 className="font-semibold">{t.quality.fallbackImpact}</h2><div className="mt-4 space-y-3">{q.fallback_status.map(f => <div key={f.code} className="notice notice-warn"><b>{f.code}</b> · {f.detail} <a className="underline" href={locale === 'en' ? '/en/match-predictor' : '/match-predictor'}>{t.quality.affectedForecasts}</a></div>)}</div></section><section className="card"><h2 className="font-semibold">{t.quality.hashCoverage}</h2><p className="mt-2 text-sm text-[#A8B4C8]">{manifest.files.length} {t.quality.hashText}</p></section>{q.warnings.map(w => <WarningBanner key={w.code} tone="warn">{w.detail}</WarningBanner>)}</div>;
}
export default function Page() { return <DataQualityPage locale="zh" />; }
