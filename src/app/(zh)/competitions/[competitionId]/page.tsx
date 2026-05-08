import { CompetitionDetailView } from '@/views/CompetitionDetailView';
import { loadCompetitions } from '@/lib/data';

export function generateStaticParams() {
  return loadCompetitions().map((c) => ({ competitionId: c.competition_id }));
}

export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  return <CompetitionDetailView locale="zh" competitionId={competitionId} />;
}
