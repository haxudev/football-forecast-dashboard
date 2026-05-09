import { TeamDetailView } from '@/views/TeamDetailView';
import { loadTeams } from '@/lib/data';
import { isCompetitionEnabled } from '@/lib/site-config';

function teamIdMatchesEnabled(teamId: string): boolean {
  // Heuristic mapping (consistent with current data):
  //   nat:*       → world_cup
  //   club:eng:*  → premier_league
  //   club:*      → champions_league
  if (teamId.startsWith('nat:')) return isCompetitionEnabled('world_cup');
  if (teamId.startsWith('club:eng:')) return isCompetitionEnabled('premier_league');
  if (teamId.startsWith('club:')) return isCompetitionEnabled('champions_league');
  return false;
}

export function generateStaticParams() {
  return loadTeams()
    .filter((t) => teamIdMatchesEnabled(t.team_id))
    .map((t) => ({ teamId: t.team_id }));
}

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <TeamDetailView locale="zh" teamId={teamId} />;
}
