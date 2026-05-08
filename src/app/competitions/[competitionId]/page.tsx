import Link from 'next/link';
import { MatchCard, TruthChip, formatCompetitionId } from '@/components/Cards';
import { loadCompetitions, loadPredictions } from '@/lib/data';
import { formatCompetitionFormat, formatCompetitionName, getDictionary } from '@/lib/i18n';

export function generateStaticParams() { return loadCompetitions().map(c => ({ competitionId: c.competition_id })); }
export default async function Page({ params, locale = 'zh' }: { params: Promise<{ competitionId: string }>; locale?: 'zh' | 'en' }) {
  const { competitionId } = await params;
  const t = getDictionary(locale);
  const prefix = locale === 'en' ? '/en' : '';
  const comp = loadCompetitions().find(c => c.competition_id === competitionId);
  const preds = loadPredictions(competitionId);
  const displayName = comp ? formatCompetitionName(comp.name, locale) : formatCompetitionId(competitionId);
  return <div className="space-y-6">
    <header className="page-header flex flex-wrap items-end justify-between gap-3"><div><div className="text-sm font-semibold text-[#14B8A6]">{t.competitions.title}</div><h1 className="text-3xl font-semibold">{displayName}</h1><p className="mt-2 text-sm text-[#A8B4C8]">{t.competitions.detailSubtitle} {t.common.dataResearchOnly}</p></div><TruthChip value="SAMPLE_ONLY" /></header>
    <section className="competition-detail-grid"><div className="card"><h2 className="font-semibold">{t.competitions.snapshot}</h2><p className="mt-3 text-[#A8B4C8]">{t.competitions.snapshotPrefix}: {formatCompetitionFormat(comp?.format ?? 'unknown', locale)} · {t.competitions.scope}: {comp?.scope ?? 'unknown'} · {t.competitions.source}: {comp?.source_origin ?? 'forecast pack'}.</p><p className="mt-3 text-sm text-[#FCD34D]">{t.competitions.sampleBaseline}</p></div><div className="card"><h2 className="font-semibold">{t.competitions.researchNote}</h2><p className="mt-3 text-sm text-[#A8B4C8]">{t.common.sampleOnly} · {t.common.notBettingAdvice} · {t.common.marketOddsNotUsed}</p><div className="mt-4 flex flex-wrap gap-2"><Link className="nav-link" href={`${prefix}/match-predictor`}>{t.nav.matchPredictor}</Link>{comp?.format === 'tournament' && <Link className="nav-link" href={`${prefix}/tournament-simulator/${competitionId}`}>{t.nav.tournamentSimulator}</Link>}</div></div></section>
    <section><h2 className="mb-3 text-xl font-semibold">{t.competitions.fixtures}</h2><div className="grid gap-4 md:grid-cols-2">{preds.map(p => <MatchCard key={p.prediction_id} p={p} t={t} />)}</div></section>
  </div>;
}
