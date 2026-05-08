import { RadarChart } from '@/components/Charts';
import { TruthChip } from '@/components/Cards';
import { loadTeamCompare } from '@/lib/data';
import { getDictionary, type Locale } from '@/lib/i18n';

export function TeamComparisonPage({ locale = 'zh' }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const data = loadTeamCompare();
  const teams = data.teams.slice(0, 2);
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold">{t.team.title}</h1><p className="mt-2 text-sm text-[#A8B4C8]">{t.team.subtitle}</p></div><TruthChip value={data.data_truth_mode_summary} /></header><section className="card"><div className="grid gap-3 md:grid-cols-3"><select aria-label="Team A" className="select-control"><option>{teams[0]?.canonical_name}</option></select><select aria-label="Team B" className="select-control"><option>{teams[1]?.canonical_name}</option></select><select aria-label="Competition context" className="select-control"><option>{t.team.context}</option></select></div></section><section className="grid gap-4 lg:grid-cols-2"><div className="card"><h2 className="font-semibold">{t.team.radar}</h2><RadarChart teams={teams.map(team => team.canonical_name)} t={t} /></div><div className="card"><h2 className="font-semibold">{t.team.recentForm}</h2><div className="mt-4 grid gap-3">{teams.map((team, index) => <div key={team.team_id} className="rounded bg-[#13203A] p-3"><div className="mb-2 font-semibold">{team.canonical_name}</div><div className="flex flex-wrap gap-2" aria-label={`${team.canonical_name} recent form`}>{['W', 'D', 'L', 'W', 'W'].slice(index, index + 4).map((r, i) => <span key={`${r}-${i}`} className={`chip ${r === 'W' ? 'truth-ok' : r === 'D' ? 'truth-warn' : 'truth-err'}`}>{r}</span>)}</div></div>)}</div></div></section><section className="card"><h2 className="font-semibold">{t.team.caveatTitle}</h2><p className="mt-2 text-sm text-[#A8B4C8]">{t.team.caveat}</p></section></div>;
}
export default function Page() { return <TeamComparisonPage locale="zh" />; }
