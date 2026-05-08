import { loadLatest } from '@/lib/data';
import { Nav, StatusStrip } from '@/components/Cards';
import { getDictionary } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n';

export function AppShell({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  let latest: ReturnType<typeof loadLatest> | undefined;
  try { latest = loadLatest(); } catch { latest = undefined; }
  const t = getDictionary(locale);
  return <body><StatusStrip truth={latest?.data_truth_mode_summary} model={latest?.model_version_summary} generatedAt={latest?.generated_at} t={t} /><Nav locale={locale} t={t} /><main className="mx-auto max-w-7xl px-4 pb-12">{children}</main></body>;
}
