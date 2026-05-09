// src/components/match/PlayerBadge.tsx
// design §3.3 — 球员 6 状态徽章；按 schema 短路推导。
import { derivePlayerBadge, PLAYER_BADGE_CLASS, type PlayerBadgeKind } from '@/lib/playerBadge';
import type { PlayerSlim } from '@/lib/forecast-pack';
import type { Dictionary } from '@/lib/i18n';

function badgeLabel(kind: PlayerBadgeKind, p: PlayerSlim, t: Dictionary): string {
  switch (kind) {
    case 'FIT':
      return t.teamCompare.badge.fit;
    case 'DOUBTFUL':
      return t.teamCompare.badge.doubtful;
    case 'YELLOW_WATCH':
      return t.teamCompare.badge.yellowWatch.replace('{n}', String(p.yellow_card_count ?? '4+'));
    case 'RED_SUSPENDED':
      return t.teamCompare.badge.redSuspended;
    case 'INJURED':
      return t.teamCompare.badge.injured;
    case 'INTL_DUTY':
      return t.teamCompare.badge.intlDuty;
  }
}

export function PlayerBadge({ player, t }: { player: PlayerSlim; t: Dictionary }) {
  const kind = derivePlayerBadge(player);
  const cls = PLAYER_BADGE_CLASS[kind];
  const label = badgeLabel(kind, player, t);
  return (
    <span className={`player-badge ${cls}`} data-badge={kind} aria-label={label}>
      {label}
    </span>
  );
}
