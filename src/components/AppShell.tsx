'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Nav, StatusStrip } from '@/components/Cards';
import { getDictionary, type Locale } from '@/lib/i18n';

type LatestShellData = {
  data_truth_mode_summary?: string;
  model_version_summary?: string;
  generated_at?: string;
};

export function AppShell({ children, latest }: { children: React.ReactNode; latest?: LatestShellData }) {
  const pathname = usePathname();
  const locale: Locale = pathname?.startsWith('/en') ? 'en' : 'zh';
  const t = getDictionary(locale);
  useEffect(() => { document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'; }, [locale]);
  return <body data-locale={locale}><StatusStrip truth={latest?.data_truth_mode_summary} model={latest?.model_version_summary} generatedAt={latest?.generated_at} t={t} /><Nav locale={locale} t={t} /><main className="mx-auto max-w-7xl px-4 pb-12">{children}</main></body>;
}
