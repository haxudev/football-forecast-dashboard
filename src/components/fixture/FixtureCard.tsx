// src/components/fixture/FixtureCard.tsx
// Phase A — 共享组件，design-spec §3.1 / §5.1.2 双 mode（primary | picker），含 degraded 状态。
'use client';

import Link from 'next/link';
import { type FixtureRow } from '@/lib/fixtures';
import { type Dictionary } from '@/lib/i18n';

export type FixtureCardMode = 'primary' | 'picker';

export interface FixtureCardProps {
  fixture: FixtureRow;
  mode: FixtureCardMode;
  /** picker 模式下点击进入哪条路径（'/match/[id]' 或 '/team-comparison/[id]'）。 */
  pickerHref?: 'match' | 'team-comparison';
  t: Dictionary;
}

function fmtKickoff(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // 显示用户本地时区（runtime: client; SSR fallback 仍用本地）
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function teamLabel(side: FixtureRow['home']): string {
  return side.short_name_zh ?? side.name_zh ?? side.short_name ?? side.name ?? side.team_id;
}

function venueLabel(venue: FixtureRow['venue']): string {
  return venue.name_zh ?? venue.name;
}

export function FixtureCard({ fixture, mode, pickerHref = 'match', t }: FixtureCardProps) {
  const stageLabel = t.fixtureCard.stage[fixture.fixture_status] ?? fixture.fixture_status;
  const home = teamLabel(fixture.home);
  const away = teamLabel(fixture.away);
  const summary = fixture.prediction_summary ?? null;
  const isDegraded = !fixture.match_pack_path;
  const stageClass = `fixture-card-stage stage-${fixture.fixture_status}`;
  const matchHref = `/match/${fixture.match_id}`;
  const teamCompareHref = `/team-comparison/${fixture.match_id}`;

  // primary mode：整张卡片不是单个链接，CTA 行有两个目标
  // picker mode：整张卡片是单个链接，pickerHref 决定目标
  const cardCls = `fixture-card${isDegraded ? ' is-degraded' : ''}`;

  const head = (
    <div className="fixture-card-head">
      <span className={stageClass} aria-label={stageLabel}>
        {stageLabel}
      </span>
      {typeof fixture.matchday === 'number' && (
        <span className="ml-auto">
          {t.fixtureCard.gameweek.replace('{n}', String(fixture.matchday))}
        </span>
      )}
    </div>
  );

  const title = (
    <div className="fixture-card-title">
      <span className="home">{home}</span>
      <span className="vs" aria-hidden="true">{t.common.vs}</span>
      <span className="away">{away}</span>
    </div>
  );

  const meta = (
    <div className="fixture-card-meta">
      <span>{fmtKickoff(fixture.kickoff_utc)}</span>
      <span>{venueLabel(fixture.venue)}</span>
    </div>
  );

  const probRow = summary ? (
    <div
      className="fixture-card-prob"
      role="img"
      aria-label={`${t.common.home} ${(summary.p_home * 100).toFixed(0)}%, ${t.common.draw} ${(summary.p_draw * 100).toFixed(0)}%, ${t.common.away} ${(summary.p_away * 100).toFixed(0)}%`}
    >
      <span className="seg home"><span className="lbl">{t.common.home}</span>{(summary.p_home * 100).toFixed(0)}%</span>
      <span className="seg draw"><span className="lbl">{t.common.draw}</span>{(summary.p_draw * 100).toFixed(0)}%</span>
      <span className="seg away"><span className="lbl">{t.common.away}</span>{(summary.p_away * 100).toFixed(0)}%</span>
    </div>
  ) : (
    <div className="fixture-card-degraded-note">{t.fixtureCard.degradedMissingPack}</div>
  );

  if (mode === 'picker') {
    const href = pickerHref === 'team-comparison' ? teamCompareHref : matchHref;
    return (
      <Link href={href} className={cardCls} aria-label={`${home} ${t.common.vs} ${away}`}>
        {head}
        {title}
        {meta}
        {probRow}
      </Link>
    );
  }

  // primary mode: CTA 行
  return (
    <article className={cardCls} aria-label={`${home} ${t.common.vs} ${away}`}>
      {head}
      {title}
      {meta}
      {probRow}
      <div className="fixture-card-cta-row">
        <Link href={matchHref}>{t.fixtureCard.detailCta}</Link>
        <Link href={teamCompareHref}>{t.fixtureCard.teamCompareCta}</Link>
      </div>
    </article>
  );
}
