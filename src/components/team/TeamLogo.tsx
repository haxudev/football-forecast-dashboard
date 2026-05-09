// src/components/team/TeamLogo.tsx
// Phase B (B-1, B-4) — 共享 team logo 组件。
// - 优先使用 /logos/<safe(team_id)>.svg（缺图浏览器自动 fallback 到首字母 badge）
// - 缺图 fallback：圆形首字母 badge（短名/全名首字母），保证视觉一致
// - 纯 client/safe（不会抛错）；用 <span> 而非 <img>，避免 layout shift
'use client';

import { useState } from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

const SIZE_PX: Record<LogoSize, number> = {
  sm: 20,
  md: 28,
  lg: 40,
};

function safeId(teamId: string): string {
  // team_id 形如 "club:eng:liverpool" → "club_eng_liverpool"，避免 URL 冒号兼容问题
  return teamId.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
}

function initial(s: string | null | undefined): string {
  if (!s) return '?';
  // 取首个非空白字符（中文取首字，英文取首字母）
  const ch = [...s.trim()][0] ?? '?';
  return ch.toUpperCase();
}

export interface TeamLogoProps {
  teamId: string;
  /** 用于 alt 与 fallback 文字的展示名（短名优先） */
  displayName: string;
  /** 直接覆盖 src（如 schema 已带 crest_url，传入即可） */
  src?: string | null;
  size?: LogoSize;
  className?: string;
}

export function TeamLogo({ teamId, displayName, src, size = 'md', className }: TeamLogoProps) {
  const [errored, setErrored] = useState(false);
  const px = SIZE_PX[size];
  const url = src ?? `/logos/${safeId(teamId)}.svg`;
  const cls = `team-logo team-logo-${size}${className ? ' ' + className : ''}`;

  if (errored || !url) {
    return (
      <span
        className={`${cls} is-fallback`}
        aria-label={displayName}
        role="img"
        style={{ width: px, height: px, fontSize: Math.round(px * 0.45) }}
      >
        {initial(displayName)}
      </span>
    );
  }

  return (
    <span className={cls} style={{ width: px, height: px }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={displayName}
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </span>
  );
}
