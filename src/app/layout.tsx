import { AppShell } from '@/components/AppShell';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-CN" suppressHydrationWarning><AppShell locale="zh">{children}</AppShell></html>;
}
