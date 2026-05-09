// src/views/TeamComparisonView.tsx
// Phase A — /team-comparison/[matchId]，球员双列名单 + 6 状态徽章 + 关键球员卡片。
import Link from 'next/link';
import { tryLoadMatchPack, findFixtureRow } from '@/lib/data-fixture';
import { getDictionary, type Locale } from '@/lib/i18n';
import { MatchHeader } from '@/components/match/MatchHeader';
import { LineupPair } from '@/components/match/LineupPair';
import { KeyPlayerCard, FormSparkline, XgBars, FatigueBars } from '@/components/charts';

export function TeamComparisonView({ locale, matchId }: { locale: Locale; matchId: string }) {
  const t = getDictionary(locale);
  const pack = tryLoadMatchPack(matchId);

  if (!pack) {
    const fxRow = findFixtureRow(matchId);
    return (
      <div className="space-y-4">
        <Link href="/" className="muted">← {t.match.backToFixtures}</Link>
        <h1 className="page-title">{t.match.notFoundTitle}</h1>
        <p>{fxRow ? t.match.noPackForMatch : t.match.notFoundBody}</p>
        <Link href="/" className="hero-action">{t.match.notFoundCta}</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/" className="muted">← {t.match.backToFixtures}</Link>

      <MatchHeader pack={pack} t={t} />

      <div className="dim-nav" role="tablist">
        <Link href={`/match/${matchId}`}>{t.match.tabResearch}</Link>
        <span aria-current="page" style={{ background: 'var(--accent-cyan)', color: 'var(--bg-app)' }}>{t.match.tabTeamCompare}</span>
      </div>

      <section>
        <h2 className="section-title">{t.teamCompare.title}</h2>
        <p className="muted">{t.teamCompare.subtitle}</p>
      </section>

      {/* 整体维度 compare-grid（form / xG / fatigue 三块紧凑横排） */}
      <section className="card" aria-labelledby="cmp-overall-h">
        <h3 id="cmp-overall-h" className="font-semibold" style={{ marginBottom: 8 }}>{t.match.dim['03']}</h3>
        {pack.form && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormSparkline form={pack.form.home} t={t} side="home" />
            <FormSparkline form={pack.form.away} t={t} side="away" />
          </div>
        )}
      </section>

      <section className="card" aria-labelledby="cmp-xg-h">
        <h3 id="cmp-xg-h" className="font-semibold" style={{ marginBottom: 8 }}>{t.match.dim['02']}</h3>
        <XgBars data={pack.expected_goals} t={t} />
      </section>

      <section className="card" aria-labelledby="cmp-fatigue-h">
        <h3 id="cmp-fatigue-h" className="font-semibold" style={{ marginBottom: 8 }}>{t.match.dim['06']}</h3>
        <FatigueBars data={pack.fatigue ?? null} t={t} />
      </section>

      {/* 球员双列名单（重点） */}
      <section className="card" aria-labelledby="cmp-lineup-h">
        <h3 id="cmp-lineup-h" className="font-semibold" style={{ marginBottom: 8 }}>{t.match.dim['04']}</h3>
        <LineupPair pack={pack} t={t} />
      </section>

      {/* 关键球员卡片 */}
      {pack.player_availability?.home.key_players?.length ? (
        <section className="card" aria-labelledby="cmp-keyplayer-h">
          <h3 id="cmp-keyplayer-h" className="font-semibold" style={{ marginBottom: 8 }}>{t.teamCompare.keyPlayerHeading}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {pack.player_availability.home.key_players[0] && <KeyPlayerCard player={pack.player_availability.home.key_players[0]} t={t} />}
            {pack.player_availability.away.key_players?.[0] && <KeyPlayerCard player={pack.player_availability.away.key_players[0]} t={t} />}
          </div>
        </section>
      ) : null}
    </div>
  );
}
