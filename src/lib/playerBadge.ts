// src/lib/playerBadge.ts
// Phase A — 球员 6 状态徽章短路推导（C-2 / G-A5 / T-4）。
// 推导优先级（高→低，严格按 forecast-pack-v2.schema.json PlayerSlim description）：
//   1. red_card_suspension_active === true → SUSPENDED-RED
//   2. injury_status === 'INJURED' → INJURED
//   3. international_duty_conflict === true → INTL-DUTY
//   4. yellow_card_count >= 4 → YELLOW-WATCH
//   5. doubtful === true OR injury_status === 'DOUBTFUL' OR start_probability < 0.5 → DOUBTFUL
//   6. else → FIT
import type { PlayerSlim } from './forecast-pack';

export type PlayerBadgeKind =
  | 'FIT'
  | 'DOUBTFUL'
  | 'YELLOW_WATCH'
  | 'RED_SUSPENDED'
  | 'INJURED'
  | 'INTL_DUTY';

/** 短路推导球员徽章状态。schema 真相为唯一权威（不允许 silent fallback）。 */
export function derivePlayerBadge(p: PlayerSlim): PlayerBadgeKind {
  if (p.red_card_suspension_active === true) return 'RED_SUSPENDED';
  if (p.injury_status === 'INJURED') return 'INJURED';
  if (p.international_duty_conflict === true) return 'INTL_DUTY';
  if ((p.yellow_card_count ?? 0) >= 4) return 'YELLOW_WATCH';
  if (
    p.doubtful === true ||
    p.injury_status === 'DOUBTFUL' ||
    (typeof p.start_probability === 'number' && p.start_probability < 0.5)
  ) {
    return 'DOUBTFUL';
  }
  return 'FIT';
}

/** 6 状态徽章对应中文文案 i18n key（design §3.3 / §10.2 teamCompare.badge）。 */
export const PLAYER_BADGE_LABEL_KEY: Record<PlayerBadgeKind, string> = {
  FIT: 'teamCompare.badge.fit',
  DOUBTFUL: 'teamCompare.badge.doubtful',
  YELLOW_WATCH: 'teamCompare.badge.yellowWatch',
  RED_SUSPENDED: 'teamCompare.badge.redSuspended',
  INJURED: 'teamCompare.badge.injured',
  INTL_DUTY: 'teamCompare.badge.intlDuty',
};

/** 徽章对应 className 后缀（globals.css 增量 token） */
export const PLAYER_BADGE_CLASS: Record<PlayerBadgeKind, string> = {
  FIT: 'badge-fit',
  DOUBTFUL: 'badge-doubtful',
  YELLOW_WATCH: 'badge-yellow-watch',
  RED_SUSPENDED: 'badge-red-suspended',
  INJURED: 'badge-injured',
  INTL_DUTY: 'badge-intl-duty',
};
