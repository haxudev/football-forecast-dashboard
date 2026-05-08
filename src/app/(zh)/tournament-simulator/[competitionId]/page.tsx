import { TournamentSimulatorView } from '@/views/TournamentSimulatorView';
import { loadCompetitions } from '@/lib/data';

export function generateStaticParams() {
  return loadCompetitions().filter((c) => c.format === 'tournament').map((c) => ({ competitionId: c.competition_id }));
}

export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  return <TournamentSimulatorView locale="zh" competitionId={competitionId} />;
}
