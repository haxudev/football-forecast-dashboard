import Page, { generateStaticParams } from '../../../competitions/[competitionId]/page';
export { generateStaticParams };
export default function EnglishCompetitionDetailPage({ params }: { params: Promise<{ competitionId: string }> }) { return <Page params={params} locale="en" />; }
