import { TeamDetailView } from '@/views/TeamDetailView';
import { loadTeams } from '@/lib/data';

export function generateStaticParams() {
  return loadTeams().map((t) => ({ teamId: t.team_id }));
}

export default async function Page({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <TeamDetailView locale="zh" teamId={teamId} />;
}
