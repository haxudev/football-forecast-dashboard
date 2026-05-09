import { FreshnessFooter, Nav } from '@/components/Shell';
import { loadOverview } from '@/lib/data';
import { getDictionary } from '@/lib/i18n';
import { getSiteConfig } from '@/lib/site-config';
import '../globals.css';

export default function ZhRootLayout({ children }: { children: React.ReactNode }) {
  const t = getDictionary('zh');
  const cfg = getSiteConfig();
  let generatedAt: string | undefined;
  try { generatedAt = loadOverview().generated_at; } catch { generatedAt = undefined; }
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
  description: '英格兰超级联赛比赛预测与赛季模拟（中文）',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

