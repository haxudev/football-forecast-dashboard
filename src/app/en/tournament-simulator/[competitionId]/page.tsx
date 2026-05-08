import Page, { generateStaticParams } from '../../../tournament-simulator/[competitionId]/page';
export { generateStaticParams };
export default function EnglishTournamentPage({ params }: { params: Promise<{ competitionId: string }> }) { return <Page params={params} locale="en" />; }
