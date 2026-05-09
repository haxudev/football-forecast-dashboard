import { TournamentSimulatorView } from '@/views/TournamentSimulatorView';
import { loadCompetitions } from '@/lib/data';
import { isCompetitionRouteEnabled } from '@/lib/site-config';

export function generateStaticParams() {
  return loadCompetitions()
    .filter((c) => c.format === 'tournament')
    .filter((c) => isCompetitionRouteEnabled(c.competition_id))
    .map((c) => ({ competitionId: c.competition_id }));
}

export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  return <TournamentSimulatorView locale="zh" competitionId={competitionId} />;
}
