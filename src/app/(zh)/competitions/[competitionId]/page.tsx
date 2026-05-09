import { CompetitionDetailView } from '@/views/CompetitionDetailView';
import { loadCompetitions } from '@/lib/data';

export function generateStaticParams() {
  // Champions League has a dedicated route at /competitions/champions_league (Sprint 4 Stage 5)
  return loadCompetitions()
    .filter((c) => c.competition_id !== 'champions_league')
    .map((c) => ({ competitionId: c.competition_id }));
}

export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  return <CompetitionDetailView locale="zh" competitionId={competitionId} />;
}
