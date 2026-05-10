import { MatchResearchView } from '@/views/MatchResearchView';
import { findFixtureRow } from '@/lib/data-fixture';

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export async function generateStaticParams() {
  const { tryLoadFixtures } = await import('@/lib/data-fixture');
  const f = tryLoadFixtures();
  return (f?.fixtures ?? []).map((row) => ({ matchId: row.match_id }));
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;
  void findFixtureRow(matchId);
  return <MatchResearchView locale="en" matchId={matchId} />;
}
