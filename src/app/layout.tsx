import { AppShell } from '@/components/AppShell';
import { loadLatest } from '@/lib/data';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let latest: ReturnType<typeof loadLatest> | undefined;
  try { latest = loadLatest(); } catch { latest = undefined; }
  return <html lang="zh-CN" suppressHydrationWarning><AppShell latest={latest}>{children}</AppShell></html>;
}
