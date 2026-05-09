// src/components/match/ProbStack.tsx
// Phase B (B-2 / D-B3) — 概率三段式 stacked bar 组件。
// 用于 FixtureCard / MatchHeader 等，替换原先三个独立 box。
// 设计：home 段（左，prob-home 色）/ draw 段（中，prob-draw 色）/ away 段（右，prob-away 色）
// 比例严格按 p_home/p_draw/p_away 渲染；下方/上方可选展示数字与短标签。
import type { Dictionary } from '@/lib/i18n';

export type ProbStackSize = 'sm' | 'md' | 'lg';

export interface ProbStackProps {
  pHome: number;
  pDraw: number;
  pAway: number;
  t: Dictionary;
  /** 是否在条形上方/下方展示文字；默认 'inline'（左/中/右标签数字） */
  layout?: 'inline' | 'compact' | 'bare';
  size?: ProbStackSize;
  /** 用于 aria-label 的两队名称 */
  homeName?: string;
  awayName?: string;
}

const HEIGHT_PX: Record<ProbStackSize, number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

export function ProbStack({
  pHome,
  pDraw,
  pAway,
  t,
  layout = 'inline',
  size = 'md',
  homeName,
  awayName,
}: ProbStackProps) {
  // 防御性归一化（容差以内 sum=1 即正常；否则按比例缩放）
  const sum = pHome + pDraw + pAway;
  const safe = sum > 0.01 ? sum : 1;
  const h = pHome / safe;
  const d = pDraw / safe;
  const a = pAway / safe;
  const height = HEIGHT_PX[size];
  const ariaLabel =
    `${homeName ?? t.common.home} ${pct(h)}, ${t.common.draw} ${pct(d)}, ${awayName ?? t.common.away} ${pct(a)}`;

  const bar = (
    <div
      className="prob-stack-bar"
      role="img"
      aria-label={ariaLabel}
      data-prob-stack-size={size}
      style={{ height }}
    >
      <span className="seg-h" style={{ width: `${h * 100}%` }} />
      <span className="seg-d" style={{ width: `${d * 100}%` }} />
      <span className="seg-a" style={{ width: `${a * 100}%` }} />
    </div>
  );

  if (layout === 'bare') {
    return <div className="prob-stack-wrap" data-layout="bare">{bar}</div>;
  }

  if (layout === 'compact') {
    return (
      <div className="prob-stack-wrap" data-layout="compact">
        <div className="prob-stack-nums">
          <span className="num-h">{pct(h)}</span>
          <span className="num-d">{pct(d)}</span>
          <span className="num-a">{pct(a)}</span>
        </div>
        {bar}
      </div>
    );
  }

  // inline (default)：上方双侧 label + 数字，条形居中，下方居中 draw 数字
  return (
    <div className="prob-stack-wrap" data-layout="inline">
      <div className="prob-stack-row-top">
        <span className="lbl-h">
          <span className="lbl">{t.common.home}</span>
          <span className="num">{pct(h)}</span>
        </span>
        <span className="lbl-d">
          <span className="lbl">{t.common.draw}</span>
          <span className="num">{pct(d)}</span>
        </span>
        <span className="lbl-a">
          <span className="lbl">{t.common.away}</span>
          <span className="num">{pct(a)}</span>
        </span>
      </div>
      {bar}
    </div>
  );
}
