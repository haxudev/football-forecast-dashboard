import { CompetitionDetailView } from '@/views/CompetitionDetailView';
import { loadCompetitions } from '@/lib/data';
import { isCompetitionRouteEnabled } from '@/lib/site-config';

export function generateStaticParams() {
  // Champions League has a dedicated route at /competitions/champions_league (Sprint 4 Stage 5)
  // EPL-only refactor (Sprint X): also filter by site-config.enabled_competitions.
  return loadCompetitions()
    .filter((c) => c.competition_id !== 'champions_league')
    .filter((c) => isCompetitionRouteEnabled(c.competition_id))
    .map((c) => ({ competitionId: c.competition_id }));
}

export default async function Page({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  return <CompetitionDetailView locale="zh" competitionId={competitionId} />;
}
