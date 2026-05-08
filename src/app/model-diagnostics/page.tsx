import { CalibrationCurve, FeatureImportanceChart } from '@/components/Charts';
import { TruthChip, WarningBanner } from '@/components/Cards';
import { loadDiagnostics } from '@/lib/data';
import { getDictionary, type Locale } from '@/lib/i18n';

export function ModelDiagnosticsPage({ locale = 'zh' }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const d = loadDiagnostics();
  const b = d.backtest_summary as Record<string, unknown>;
  const ece = Number(b.calibration_ece ?? 0);
  return <div className="space-y-6"><header className="page-header flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h1 className="text-3xl font-semibold">{t.diagnostics.title}</h1><p className="mt-2 text-sm text-[#A8B4C8]">{t.diagnostics.subtitle}</p></div><TruthChip value={d.data_truth_mode_summary} /></header><section className="diagnostic-grid">{['brier', 'log_loss', 'calibration_ece'].map(k => <div className="card" key={k}><div className="text-xs text-[#A8B4C8]">{k}</div><div className="font-mono text-2xl">{Number(b[k] ?? 0).toFixed(3)}</div></div>)}</section><section className="chart-grid"><div className="card chart-card"><h2 className="font-semibold">{t.diagnostics.calibration}</h2><CalibrationCurve ece={ece} t={t} /></div><div className="card chart-card"><h2 className="font-semibold">{t.diagnostics.featureImportance}</h2><FeatureImportanceChart items={d.feature_importance} t={t} /><p className="mt-2 text-xs text-[#A8B4C8]">{t.diagnostics.causalityNote}</p></div></section><section className="card"><h2 className="font-semibold">{t.diagnostics.registry}</h2><div className="table-scroll"><table className="mt-3 w-full min-w-[620px] text-left text-sm"><thead><tr className="text-[#A8B4C8]"><th scope="col">{t.diagnostics.version}</th><th scope="col">{t.diagnostics.layer}</th><th scope="col">{t.diagnostics.trainedAt}</th><th scope="col">{t.diagnostics.featureHash}</th></tr></thead><tbody>{d.model_registry.map((m, i) => <tr key={i} className="border-t border-[#1E2A44]"><td className="py-2 font-mono">{String(m.model_version)}</td><td>{String(m.algorithm_layer)}</td><td className="font-mono">{String(m.trained_at)}</td><td className="font-mono">{String(m.feature_set_hash)}</td></tr>)}</tbody></table></div></section><WarningBanner tone="info">{t.diagnostics.marketSignal}</WarningBanner></div>;
}
export default function Page() { return <ModelDiagnosticsPage locale="zh" />; }
