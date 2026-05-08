import { FreshnessFooter, Nav } from '@/components/Shell';
import { loadOverview } from '@/lib/data';
import { getDictionary } from '@/lib/i18n';
import '../globals.css';

export default function EnRootLayout({ children }: { children: React.ReactNode }) {
  const t = getDictionary('en');
  let generatedAt: string | undefined;
  try { generatedAt = loadOverview().generated_at; } catch { generatedAt = undefined; }
  return (
    <html lang="en" suppressHydrationWarning>
      <body data-locale="en">
        <Nav locale="en" t={t} />
        <main className="ff-main">{children}</main>
        <FreshnessFooter locale="en" generatedAt={generatedAt} buildVersion="1.0.0" />
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Football Forecast Research',
  description: 'Consumer-friendly probability research for football fans',
};
