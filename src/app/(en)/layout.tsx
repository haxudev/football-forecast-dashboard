// (en) route group layout — Phase A G10 fix.
// Built only when site-config 包含 en（multi-comp / multi-locale 实例）。
// zh-only 场景下被 prebuild-prune 软删除为 _disabled_(en)，不会进 build。
import { FreshnessFooter, Nav } from '@/components/Shell';
import { tryLoadFixtures } from '@/lib/data-fixture';
import { getDictionary } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/site-config';
import '../globals.css';

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  const t = getDictionary('en');
  const cfg = getSiteConfig();
  const fixtures = tryLoadFixtures();
  const generatedAt = fixtures?.generated_at;
  return (
    <html lang="en" suppressHydrationWarning>
      <body data-locale="en">
        <Nav locale="en" t={t} brandName={cfg.brand_short_name} />
        <main className="ff-main">{children}</main>
        <FreshnessFooter locale="en" generatedAt={generatedAt} buildVersion="1.0.0" brandShortName={cfg.brand_short_name} />
      </body>
    </html>
  );
}

const siteCfg = getSiteConfig();
export const metadata = {
  title: siteCfg.brand_name,
  description: 'Consumer-friendly football forecast research (English)',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};
