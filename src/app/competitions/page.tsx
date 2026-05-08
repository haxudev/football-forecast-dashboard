import Link from 'next/link';
import { TruthChip } from '@/components/Cards';
import { loadCompetitions } from '@/lib/data';
import { formatCompetitionFormat, formatCompetitionName, getDictionary, type Locale } from '@/lib/i18n';

export function CompetitionsPage({ locale = 'zh' }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const prefix = locale === 'en' ? '/en' : '';
  return <div className="space-y-6">
    <header className="page-header"><h1 className="text-3xl font-semibold">{t.competitions.title}</h1><p className="mt-2 max-w-3xl text-sm text-[#A8B4C8]">{t.competitions.subtitle}</p></header>
    <div className="competition-grid">{loadCompetitions().map(c => <Link href={`${prefix}/competitions/${c.competition_id}`} className="card competition-card block focus-visible:outline" key={c.competition_id}><div className="flex items-start justify-between gap-3"><div><div className="text-sm text-[#22D3EE]">{formatCompetitionFormat(c.format, locale)}</div><h2 className="mt-2 text-xl font-semibold">{formatCompetitionName(c.name, locale)}</h2></div><TruthChip value="SAMPLE_ONLY" /></div><div className="mt-4 grid gap-2 text-sm text-[#A8B4C8]"><span>{t.competitions.dataState}: SAMPLE_ONLY</span><span>{c.format === 'tournament' ? t.competitions.simulatorAvailable : t.competitions.predictionsAvailable}</span><span>{t.competitions.researchNote}: {t.common.dataResearchOnly}</span></div><p className="mt-4 text-sm text-[#22D3EE]">{t.common.openCompetition}</p></Link>)}</div>
  </div>;
}
export default function Page() { return <CompetitionsPage locale="zh" />; }
