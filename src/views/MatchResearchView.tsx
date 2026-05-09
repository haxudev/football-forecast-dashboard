// src/views/MatchResearchView.tsx
// Phase A — /match/[matchId]，10 维度 section 全 UI 就位（数据可 STUB）。
import Link from 'next/link';
import { tryLoadMatchPack, findFixtureRow } from '@/lib/data-fixture';
import { getDictionary, type Locale } from '@/lib/i18n';
import { MatchHeader } from '@/components/match/MatchHeader';
import { DimensionSection } from '@/components/match/DimensionSection';
import {
  ScoreHeatmap,
  XgBars,
  FormSparkline,
  H2HTimeline,
  FatigueBars,
  TacticalRadar,
  RefereeBars,
  OddsDiffBars,
  ScenarioBarList,
  KeyPlayerCard,
} from '@/components/charts';
import { LineupPair } from '@/components/match/LineupPair';

export function MatchResearchView({ locale, matchId }: { locale: Locale; matchId: string }) {
  const t = getDictionary(locale);
  const pack = tryLoadMatchPack(matchId);

  if (!pack) {
    const fxRow = findFixtureRow(matchId);
    return (
      <div className="space-y-4">
        <Link href="/" className="muted">← {t.match.backToFixtures}</Link>
        <h1 className="page-title">{t.match.notFoundTitle}</h1>
        <p>
          {fxRow ? t.match.noPackForMatch : t.match.notFoundBody}
        </p>
        <Link href="/" className="hero-action">{t.match.notFoundCta}</Link>
      </div>
    );
  }

  const ds = pack.dimension_status;

  return (
    <div className="space-y-4">
      <Link href="/" className="muted">← {t.match.backToFixtures}</Link>

      <MatchHeader pack={pack} t={t} />

      {/* Tab: 研究 / 球队对比 */}
      <div className="dim-nav" role="tablist">
        <span aria-current="page" style={{ background: 'var(--accent-cyan)', color: 'var(--bg-app)' }}>{t.match.tabResearch}</span>
        <Link href={`/team-comparison/${matchId}`}>{t.match.tabTeamCompare}</Link>
      </div>

      {/* 维度锚点导航 */}
      <nav className="dim-nav" aria-label={t.match.anchorNav}>
        {(['01','02','03','04','05','06','07','08','09','10'] as const).map((k) => (
          <a key={k} href={`#dim-${k}`}>{t.match.dim[k]}</a>
        ))}
      </nav>

      <DimensionSection id="dim-01" title={t.match.dim['01']} status={ds.dim_1_outcome} t={t}>
        <ScoreHeatmap data={pack.scoreline_distribution} t={t} />
      </DimensionSection>

      <DimensionSection id="dim-02" title={t.match.dim['02']} status={ds.dim_2_xg} t={t}>
        <XgBars data={pack.expected_goals} t={t} />
      </DimensionSection>

      <DimensionSection id="dim-03" title={t.match.dim['03']} status={ds.dim_3_form} t={t}>
        {pack.form ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormSparkline form={pack.form.home} t={t} side="home" />
            <FormSparkline form={pack.form.away} t={t} side="away" />
          </div>
        ) : <p className="chart-empty">—</p>}
      </DimensionSection>

      <DimensionSection id="dim-04" title={t.match.dim['04']} status={ds.dim_4_player_availability} t={t}>
        <LineupPair pack={pack} t={t} />
        {pack.player_availability?.home.key_players?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <KeyPlayerCard player={pack.player_availability.home.key_players[0]} t={t} />
            {pack.player_availability.away.key_players?.[0] && (
              <KeyPlayerCard player={pack.player_availability.away.key_players[0]} t={t} />
            )}
          </div>
        ) : null}
      </DimensionSection>

      <DimensionSection id="dim-05" title={t.match.dim['05']} status={ds.dim_5_h2h} t={t}>
        <H2HTimeline data={pack.h2h ?? null} t={t} />
      </DimensionSection>

      <DimensionSection id="dim-06" title={t.match.dim['06']} status={ds.dim_6_fatigue} t={t}>
        <FatigueBars data={pack.fatigue ?? null} t={t} />
      </DimensionSection>

      <DimensionSection id="dim-07" title={t.match.dim['07']} status={ds.dim_7_tactical} t={t}>
        <TacticalRadar data={pack.tactical ?? null} t={t} />
      </DimensionSection>

      <DimensionSection id="dim-08" title={t.match.dim['08']} status={ds.dim_8_referee} t={t}>
        <RefereeBars data={pack.referee ?? null} t={t} />
      </DimensionSection>

      <DimensionSection id="dim-09" title={t.match.dim['09']} status={ds.dim_9_odds_diff} t={t}>
        <OddsDiffBars data={pack.odds_diff ?? null} t={t} />
      </DimensionSection>

      <DimensionSection id="dim-10" title={t.match.dim['10']} status={ds.dim_10_scenario} t={t}>
        <ScenarioBarList data={pack.scenario_simulation ?? null} t={t} />
      </DimensionSection>
    </div>
  );
}
