import { AdvancementBars } from '@/components/Charts';
import { BracketView } from '@/components/Bracket';
import { DataStatePanel, TruthChip, WarningBanner, formatCompetitionId } from '@/components/Cards';
import { loadCompetitions, loadOverview, loadTournament } from '@/lib/data';

export function generateStaticParams() { return loadCompetitions().filter(c => c.format === 'tournament').map(c => ({ competitionId: c.competition_id })); }

export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const overview = loadOverview();
  let tournament: ReturnType<typeof loadTournament> | undefined;
  try { tournament = loadTournament(competitionId); } catch { tournament = undefined; }
  const sims = tournament?.simulations ?? [];
  const limited = sims.length > 0 && sims.length < 8;
  return <div className="space-y-6"><header className="page-header flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h1 className="text-3xl font-semibold">Tournament Simulator · {formatCompetitionId(competitionId)}</h1><p className="mt-2 text-sm text-[#A8B4C8]">Static Monte Carlo baseline. Mobile uses round selector.</p></div>{tournament && <TruthChip value={tournament.data_truth_mode} />}</header><DataStatePanel generatedAt={overview.generated_at} />{limited && <div className="limited-data-banner" role="status">Limited data: SAMPLE_ONLY, {sims.length} teams. Baseline bracket evidence, not production coverage.</div>}{sims.length ? <><section className="card chart-card"><h2 className="font-semibold">Advancement odds</h2><div className="hidden sm:block"><AdvancementBars simulations={sims} /></div><div className="table-scroll"><table className="mt-3 w-full min-w-0 text-left text-sm"><thead><tr className="text-[#A8B4C8]"><th scope="col">Team</th><th scope="col">Adv</th></tr></thead><tbody>{sims.map(s => <tr key={s.team_id} className="border-t border-[#1E2A44]"><th scope="row" className="py-2 font-normal">{s.team_id.replace('nat:', '')}</th><td className="font-mono">{(s.advance_probability * 100).toFixed(1)}% / champ {(s.champion_probability * 100).toFixed(1)}%</td></tr>)}</tbody></table></div></section><BracketView simulations={sims} /></> : <WarningBanner tone="info">No tournament simulation available for this competition. This is an explicit disabled state for the static pack.</WarningBanner>}</div>;
}
