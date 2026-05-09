// src/components/Shell.tsx
// Phase A — Nav 精简: 赛事 / 舆情 / 关于（删 match-predictor / team-comparison 无参数版本 / tournament-simulator / teams）。
// preview-env-pill 在 NEXT_PUBLIC_DEPLOY_ENV='preview' 时显示（D-9）。
import Link from 'next/link';
import { ThemeMenu } from '@/components/ThemeMenu';
import { LangMenu } from '@/components/LangMenu';
import {
  format,
  getDictionary,
  type Dictionary,
  type Locale,
} from '@/lib/i18n';
import { friendlyFreshness } from '@/lib/status';

export function PreviewEnvPill({ t }: { t: Dictionary }) {
  // build-time env: NEXT_PUBLIC_DEPLOY_ENV='preview' 才显示。
  const env = process.env.NEXT_PUBLIC_DEPLOY_ENV;
  if (env !== 'preview') return null;
  return (
    <span
      className="preview-env-pill"
      data-deploy-env={env}
      title={t.env.previewPillTip}
      aria-label={`${t.env.previewPill} — ${t.env.previewPillTip}`}
    >
      ⏳ {t.env.previewPill}
    </span>
  );
}

export function Nav({ locale, t, brandName }: { locale: Locale; t: Dictionary; brandName?: string }) {
  const prefix = locale === 'en' ? '/en' : '';
  const brand = brandName ?? t.common.footerCopy;
  // Phase A 三链精简：赛事 / 舆情 / 关于
  const items: [string, string][] = [
    ['/', t.nav.overview],
    ['/sentiment', t.nav.sentiment],
    ['/about', t.nav.about],
  ];
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href={`${prefix || ''}/`} className="brand" aria-label={brand}>
          <span className="brand-mark" aria-hidden="true">⚽</span>
          <span className="brand-text">{brand}</span>
          <PreviewEnvPill t={t} />
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
  brandShortName,
}: {
  locale: Locale;
  generatedAt?: string;
  buildVersion?: string;
  brandShortName?: string;
}) {
  const t = getDictionary(locale);
  const freshness = friendlyFreshness(generatedAt, t);
  const prefix = locale === 'en' ? '/en' : '';
  const brand = brandShortName ?? t.common.footerCopy;
  return (
    <footer className="ff-footer">
      <div className="ff-footer-inner">
        <span>© {brand}{buildVersion ? ` · v${buildVersion}` : ''}</span>
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

// Re-export utility used by legacy v1 pages (about/competitions). 待 Phase B 移除。
export { format };
