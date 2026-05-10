// src/components/match/MatchHeader.tsx
// design §4.2 — match header (双队 + big-prob)，跨 /match 与 /team-comparison 共用。
// Phase B (B-4):
//   - 修复重复主队名 bug（之前 big-prob.lbl 渲染 home 名 + 下方又重复 home name 行）
//     现在改为：左 home(name+coach+logo) | 中 big-prob(数字 + 「主胜/平/客胜」语义短标签) | 右 away(name+coach+logo)
//   - 加 home/away team logo（与 FixtureCard 同款 TeamLogo）
import type { ForecastPackV2 } from '@/lib/forecast-pack';
import type { Dictionary } from '@/lib/i18n';
import { TeamLogo } from '@/components/team/TeamLogo';
import { ProbStack } from './ProbStack';

function teamLabel(side: ForecastPackV2['home']): string {
  return side.short_name_zh ?? side.name_zh ?? side.short_name ?? side.name;
}

export function MatchHeader({ pack, t }: { pack: ForecastPackV2; t: Dictionary }) {
  const home = teamLabel(pack.home);
  const away = teamLabel(pack.away);
  const venue = pack.venue.name_zh ?? pack.venue.name;
  const wdl = pack.win_draw_loss;

  // 「最大概率 + 语义短标签（主胜/平/客胜）」 — 不再渲染队名 → 修复 M-5 重复主队名 bug
  type Edge = { p: number; label: string };
  const edges: Edge[] = [
    { p: wdl.p_home, label: t.match.home },
    { p: wdl.p_draw, label: t.match.draw },
    { p: wdl.p_away, label: t.match.away },
  ];
  const top = edges.reduce((m, c) => (c.p > m.p ? c : m), edges[0]);

  return (
    <header className="match-header" aria-label={`${home} ${t.common.vs} ${away}`}>
      <div className="match-header-row">
        <div className="match-header-team home">
          <div className="match-header-team-id">
            <TeamLogo
              teamId={pack.home.team_id}
              displayName={home}
              src={pack.home.crest_url ?? null}
              size="md"
            />
            <span className="name">{home}</span>
            <span className="side-lbl" aria-label={t.common.home}>{t.fixtureCard.sideHomeShort}</span>
          </div>
          {pack.home.coach_name_zh && <span className="coach">{t.teamCompare.headCoach}: {pack.home.coach_name_zh}</span>}
        </div>
        <div className="big-prob" aria-label={`${top.label} ${(top.p * 100).toFixed(0)}%`}>
          <span className="big-prob-num">{(top.p * 100).toFixed(0)}%</span>
          <span className="big-prob-edge-lbl">{top.label}</span>
        </div>
        <div className="match-header-team away">
          <div className="match-header-team-id">
            <span className="side-lbl" aria-label={t.common.away}>{t.fixtureCard.sideAwayShort}</span>
            <span className="name">{away}</span>
            <TeamLogo
              teamId={pack.away.team_id}
              displayName={away}
              src={pack.away.crest_url ?? null}
              size="md"
            />
          </div>
          {pack.away.coach_name_zh && <span className="coach">{t.teamCompare.headCoach}: {pack.away.coach_name_zh}</span>}
        </div>
      </div>
      {/* 三段式 stacked bar 概率（不再三独立 box；可视化对比一目了然） */}
      <div className="match-header-prob">
        <ProbStack
          pHome={wdl.p_home}
          pDraw={wdl.p_draw}
          pAway={wdl.p_away}
          t={t}
          size="md"
          layout="inline"
          homeName={home}
          awayName={away}
        />
      </div>
      <div className="match-header-meta">
        <span>{t.match.kickoff}: {new Date(pack.kickoff_utc).toLocaleString()}</span>
        <span>{t.match.venue}: {venue}</span>
      </div>
    </header>
  );
}
