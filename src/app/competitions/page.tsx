import Link from 'next/link';
import { TruthChip } from '@/components/Cards';
import { loadCompetitions } from '@/lib/data';

export default function Page() {
  return <div className="space-y-6"><h1 className="text-3xl font-semibold">Competitions</h1><div className="grid gap-4 md:grid-cols-3">{loadCompetitions().map(c => <Link href={`/competitions/${c.competition_id}`} className="card block focus-visible:outline" key={c.competition_id}><div className="text-sm text-[#22D3EE]">{c.format}</div><h2 className="mt-2 text-xl font-semibold">{c.name}</h2><div className="mt-4"><TruthChip value="SAMPLE_ONLY" /></div><p className="mt-4 text-sm text-[#A8B4C8]">Open competition →</p></Link>)}</div></div>;
}
