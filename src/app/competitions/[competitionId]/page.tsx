import { MatchCard, TruthChip, formatCompetitionId } from '@/components/Cards';
import { loadCompetitions, loadPredictions } from '@/lib/data';

export function generateStaticParams() { return loadCompetitions().map(c => ({ competitionId: c.competition_id })); }
export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const comp = loadCompetitions().find(c => c.competition_id === competitionId);
  const preds = loadPredictions(competitionId);
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold">{comp?.name ?? formatCompetitionId(competitionId)}</h1><p className="mt-2 text-sm text-[#A8B4C8]">Fixtures & predictions · ensemble baseline with Elo/Poisson/fallback calibration.</p></div><TruthChip value="SAMPLE_ONLY" /></header><section className="card"><h2 className="font-semibold">Competition snapshot</h2><p className="mt-3 text-[#A8B4C8]">Format: {comp?.format ?? 'unknown'} · Scope: {comp?.scope ?? 'unknown'} · Source: {comp?.source_origin ?? 'forecast pack'}. The current pack is SAMPLE_ONLY baseline and is not a real-source prediction product.</p></section><div className="grid gap-4 md:grid-cols-2">{preds.map(p => <MatchCard key={p.prediction_id} p={p} />)}</div></div>;
}
