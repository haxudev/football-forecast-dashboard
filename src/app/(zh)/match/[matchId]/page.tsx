import { MatchResearchView } from '@/views/MatchResearchView';
import { findFixtureRow } from '@/lib/data-fixture';

interface PageProps {
  params: Promise<{ matchId: string }>;
}

// 静态导出（output: export）+ generateStaticParams 列出所有已有的 fixture match_id。
export async function generateStaticParams() {
  // 先遍历 fixtures.json；缺失时返回空数组（构建仍可继续，单条 page 走 not-found）。
  // 注意：这里同步读 fs 避免引入异步复杂度，仅在 build 阶段调用。
  const { tryLoadFixtures } = await import('@/lib/data-fixture');
  const f = tryLoadFixtures();
  return (f?.fixtures ?? []).map((row) => ({ matchId: row.match_id }));
}

export default async function Page({ params }: PageProps) {
  const { matchId } = await params;
  // 校验 fixture 存在，不存在则交给 view 渲染 not-found 状态。
  // findFixtureRow 用于辅助 view（不抛错）。
  void findFixtureRow(matchId);
  return <MatchResearchView locale="zh" matchId={matchId} />;
}
