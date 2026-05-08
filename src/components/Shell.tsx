import Link from 'next/link';
import { ThemeMenu } from '@/components/ThemeMenu';
import { LangMenu } from '@/components/LangMenu';
import {
  format,
  getDictionary,
  localizedCompetitionShortName,
  localizedTeamFromId,
  localizedTeamName,
  type Dictionary,
  type Locale,
} from '@/lib/i18n';
import { friendlyFreshness, deriveMatchStage } from '@/lib/status';
import type { Prediction } from '@/lib/schemas';

export function Nav({ locale, t }: { locale: Locale; t: Dictionary }) {
  const prefix = locale === 'en' ? '/en' : '';
  const items: [string, string][] = [
    ['/', t.nav.overview],
    ['/competitions', t.nav.competitions],
    ['/match-predictor', t.nav.matchPredictor],
    ['/tournament-simulator/world_cup_2026', t.nav.tournamentSimulator],
    ['/team-comparison', t.nav.teamComparison],
    ['/sentiment', t.nav.sentiment],
    ['/about', t.nav.about],
  ];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href={`${prefix || ''}/`} className="brand" aria-label={t.common.footerCopy}>
          <span className="brand-mark" aria-hidden="true">⚽</span>
          <span className="brand-text">{t.common.footerCopy}</span>
        </Link>
        <nav aria-label="Primary" className="nav-scroll">
          {items.map(([href, label]) => (
            <Link key={href} href={`${prefix}${href === '/' ? '' : href}` || '/'} className="nav-link">
              {label}
            </Link>
          ))}
        </nav>
        <div className="topbar-controls">
          <LangMenu locale={locale} t={t} />
          <ThemeMenu t={t} />
        </div>
      </div>
    </header>
  );
}

export function FreshnessFooter({
  locale,
  generatedAt,
  buildVersion,
}: {
  locale: Locale;
  generatedAt?: string;
  buildVersion?: string;
}) {
  const t = getDictionary(locale);
  const freshness = friendlyFreshness(generatedAt, t);
  const prefix = locale === 'en' ? '/en' : '';
  return (
    <footer className="ff-footer">
      <div className="ff-footer-inner">
        <span>© {t.common.footerCopy}{buildVersion ? ` · v${buildVersion}` : ''}</span>
        {freshness && <span className="ff-footer-fresh">{freshness}</span>}
        <Link className="ff-footer-link" href={`${prefix}/about`}>
          {t.common.footerAbout}
        </Link>
      </div>
    </footer>
  );
}

export function SampleBanner({ t, message }: { t: Dictionary; message?: string }) {
  return (
    <div className="sample-banner" role="note">
      <span aria-hidden="true" className="sample-banner-ico">ⓘ</span>
      <span>{message ?? t.common.sampleBanner}</span>
    </div>
  );
}

export function SampleChip({ label }: { label: string }) {
  return <span className="chip chip-sample" aria-label={label}>{label}</span>;
}

export function StageChip({ stage, t }: { stage: 'PRE' | 'LIVE' | 'END'; t: Dictionary }) {
  const cfg: Record<typeof stage, { label: string; cls: string; icon: string }> = {
    PRE: { label: t.common.stagePre, cls: 'stage-pre', icon: '⏱' },
    LIVE: { label: t.common.stageLive, cls: 'stage-live', icon: '●' },
    END: { label: t.common.stageEnd, cls: 'stage-end', icon: '✓' },
  };
  const c = cfg[stage];
  return (
    <span className={`chip stage-chip ${c.cls}`} aria-label={c.label}>
      <span aria-hidden="true">{c.icon}</span>
      <span>{c.label}</span>
    </span>
  );
}

function ProbabilityRow({ label, value, kind }: { label: string; value: number; kind: 'home' | 'draw' | 'away' }) {
  return (
    <div className="prob-row">
      <span className="prob-row-label">{label}</span>
      <div className="prob-bar">
        <span className={`prob-bar-fill prob-${kind}`} style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="prob-row-value">{(value * 100).toFixed(0)}%</span>
    </div>
  );
}

export function ProbabilityBars({ p, t }: { p: Prediction; t: Dictionary }) {
  return (
    <div className="prob-stack" role="img" aria-label={`${t.common.home} ${(p.p_home * 100).toFixed(0)}%, ${t.common.draw} ${(p.p_draw * 100).toFixed(0)}%, ${t.common.away} ${(p.p_away * 100).toFixed(0)}%`}>
      <ProbabilityRow label={t.common.home} value={p.p_home} kind="home" />
      <ProbabilityRow label={t.common.draw} value={p.p_draw} kind="draw" />
      <ProbabilityRow label={t.common.away} value={p.p_away} kind="away" />
    </div>
  );
}

export function MatchCard({
  p,
  t,
  locale,
  isSample,
}: {
  p: Prediction;
  t: Dictionary;
  locale: Locale;
  isSample?: boolean;
}) {
  const home = localizedTeamName(p.home_team, locale) || localizedTeamFromId(p.home_team_id, locale);
  const away = localizedTeamName(p.away_team, locale) || localizedTeamFromId(p.away_team_id, locale);
  const stage = deriveMatchStage(p.kickoff_utc, { t, locale });

  return (
    <article className="match-card" aria-label={`${home} ${t.common.vs} ${away}`}>
      <div className="match-card-head">
        <span className="chip chip-comp">{localizedCompetitionShortName(p.competition_id, p.competition_id, locale)}</span>
        <StageChip stage={stage.stage} t={t} />
      </div>
      <h3 className="match-card-title">
        <span>{home}</span>
        <span className="match-vs" aria-hidden="true">{t.common.vs}</span>
        <span>{away}</span>
      </h3>
      <ProbabilityBars p={p} t={t} />
      <div className="match-card-foot">
        {stage.kickoffLabel && <span className="match-foot-time">{stage.kickoffLabel}</span>}
        {stage.subline && <span className="match-foot-sub">{stage.subline}</span>}
        {isSample && <SampleChip label={t.common.sample} />}
      </div>
    </article>
  );
}

export function CompetitionCard({
  competitionId,
  fallbackName,
  format: fmt,
  thisWeekCount,
  isSample,
  locale,
  t,
}: {
  competitionId: string;
  fallbackName: string;
  format: string;
  thisWeekCount?: number;
  isSample?: boolean;
  locale: Locale;
  t: Dictionary;
}) {
  const prefix = locale === 'en' ? '/en' : '';
  const name = localizedCompetitionShortName(competitionId, fallbackName, locale);
  return (
    <Link href={`${prefix}/competitions/${competitionId}`} className="comp-card" aria-label={name}>
      <div className="comp-card-head">
        <span className="comp-card-format">
          {fmt === 'tournament' ? t.competitions.formatTournament : t.competitions.formatLeague}
        </span>
        {isSample && <SampleChip label={t.common.sample} />}
      </div>
      <h3 className="comp-card-title">{name}</h3>
      {typeof thisWeekCount === 'number' && (
        <p className="comp-card-meta">{format(t.competitions.thisWeekCount, { n: thisWeekCount })}</p>
      )}
      <p className="comp-card-cta">{t.competitions.cta} →</p>
    </Link>
  );
}
