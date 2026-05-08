import { FreshnessFooter, Nav } from '@/components/Shell';
import { loadOverview } from '@/lib/data';
import { getDictionary } from '@/lib/i18n';
import '../globals.css';

export default function ZhRootLayout({ children }: { children: React.ReactNode }) {
  const t = getDictionary('zh');
  let generatedAt: string | undefined;
  try { generatedAt = loadOverview().generated_at; } catch { generatedAt = undefined; }
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body data-locale="zh">
        <Nav locale="zh" t={t} />
        <main className="ff-main">{children}</main>
        <FreshnessFooter locale="zh" generatedAt={generatedAt} buildVersion="1.0.0" />
      </body>
    </html>
  );
}

export const metadata = {
  title: '足球预测研究',
  description: '面向球迷的概率研究展示',
};
