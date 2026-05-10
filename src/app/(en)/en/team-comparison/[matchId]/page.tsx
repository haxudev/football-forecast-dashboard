import { TeamComparisonView } from '@/views/TeamComparisonView';

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
  return <TeamComparisonView locale="en" matchId={matchId} />;
}
