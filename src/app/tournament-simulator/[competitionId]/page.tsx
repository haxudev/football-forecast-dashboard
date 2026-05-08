import { AdvancementBars } from '@/components/Charts';
import { BracketView } from '@/components/Bracket';
import { DataStatePanel, TruthChip, WarningBanner, formatCompetitionId } from '@/components/Cards';
import { loadCompetitions, loadOverview, loadTournament } from '@/lib/data';
import { getDictionary } from '@/lib/i18n';

export function generateStaticParams() { return loadCompetitions().filter(c => c.format === 'tournament').map(c => ({ competitionId: c.competition_id })); }

export default async function Page({ params, locale = 'zh' }: { params: Promise<{ competitionId: string }>; locale?: 'zh' | 'en' }) {
  const { competitionId } = await params;
  const t = getDictionary(locale);
  const overview = loadOverview();
  let tournament: ReturnType<typeof loadTournament> | undefined;
  try { tournament = loadTournament(competitionId); } catch { tournament = undefined; }
  const sims = tournament?.simulations ?? [];
  const limited = sims.length > 0 && sims.length < 8;
  return <div className="space-y-6"><header className="page-header flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h1 className="text-3xl font-semibold">{t.tournament.title} · {formatCompetitionId(competitionId)}</h1><p className="mt-2 text-sm text-[#A8B4C8]">{t.tournament.subtitle}</p></div>{tournament && <TruthChip value={tournament.data_truth_mode} />}</header><DataStatePanel generatedAt={overview.generated_at} t={t} />{limited && <div className="limited-data-banner" role="status">{t.tournament.limited.replace('{count}', String(sims.length))}</div>}{sims.length ? <><section className="card chart-card"><h2 className="font-semibold">{t.tournament.advancement}</h2><div className="hidden sm:block"><AdvancementBars simulations={sims} t={t} /></div><div className="table-scroll"><table className="mt-3 w-full min-w-0 text-left text-sm"><thead><tr className="text-[#A8B4C8]"><th scope="col">{t.common.team}</th><th scope="col">{t.common.advance}</th></tr></thead><tbody>{sims.map(s => <tr key={s.team_id} className="border-t border-[#1E2A44]"><th scope="row" className="py-2 font-normal">{s.team_id.replace('nat:', '')}</th><td className="font-mono">{(s.advance_probability * 100).toFixed(1)}% / {t.common.champion} {(s.champion_probability * 100).toFixed(1)}%</td></tr>)}</tbody></table></div></section><BracketView simulations={sims} t={t} /></> : <WarningBanner tone="info">{t.tournament.noSimulation}</WarningBanner>}</div>;
}
