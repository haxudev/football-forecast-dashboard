// src/components/match/MatchHeader.tsx
// design §4.2 — match header (双队 + big-prob)，跨 /match 与 /team-comparison 共用。
import type { ForecastPackV2 } from '@/lib/forecast-pack';
import type { Dictionary } from '@/lib/i18n';

function teamLabel(side: ForecastPackV2['home']): string {
  return side.short_name_zh ?? side.name_zh ?? side.short_name ?? side.name;
}

export function MatchHeader({ pack, t }: { pack: ForecastPackV2; t: Dictionary }) {
  const home = teamLabel(pack.home);
  const away = teamLabel(pack.away);
  const venue = pack.venue.name_zh ?? pack.venue.name;
  const wdl = pack.win_draw_loss;
  const big = wdl.p_home >= wdl.p_away ? wdl.p_home : wdl.p_away;
  const bigSide = wdl.p_home >= wdl.p_away ? home : away;

  return (
    <header className="match-header" aria-label={`${home} ${t.common.vs} ${away}`}>
      <div className="match-header-row">
        <div className="match-header-team home">
          <span className="name">{home}</span>
          {pack.home.coach_name_zh && <span className="coach">{t.teamCompare.headCoach}: {pack.home.coach_name_zh}</span>}
        </div>
        <div className="big-prob" aria-label={`${bigSide} ${(big * 100).toFixed(0)}%`}>
          <span>{(big * 100).toFixed(0)}%</span>
          <span className="lbl">{bigSide}</span>
        </div>
        <div className="match-header-team away">
          <span className="name">{away}</span>
          {pack.away.coach_name_zh && <span className="coach">{t.teamCompare.headCoach}: {pack.away.coach_name_zh}</span>}
        </div>
      </div>
      <div className="match-header-meta">
        <span>{t.match.kickoff}: {new Date(pack.kickoff_utc).toLocaleString()}</span>
        <span>{t.match.venue}: {venue}</span>
      </div>
    </header>
  );
}
