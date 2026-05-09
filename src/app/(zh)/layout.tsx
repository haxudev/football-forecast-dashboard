import { FreshnessFooter, Nav } from '@/components/Shell';
import { tryLoadFixtures } from '@/lib/data-fixture';
import { getDictionary } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/site-config';
import '../globals.css';

export default function ZhRootLayout({ children }: { children: React.ReactNode }) {
  const t = getDictionary('zh');
  const cfg = getSiteConfig();
  // Phase A: 时新性来自 fixtures.json（v2 数据契约），v1 overview.json 保留兼容（Minor-5 legacy_v1_paths）
  const fixtures = tryLoadFixtures();
  const generatedAt = fixtures?.generated_at;
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body data-locale="zh">
        <Nav locale="zh" t={t} brandName={cfg.brand_short_name} />
        <main className="ff-main">{children}</main>
        <FreshnessFooter locale="zh" generatedAt={generatedAt} buildVersion="1.0.0" brandShortName={cfg.brand_short_name} />
      </body>
    </html>
  );
}

const siteCfg = getSiteConfig();
export const metadata = {
  title: siteCfg.brand_name,
  description: '英格兰超级联赛比赛预测与单场研究（中文）',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};
