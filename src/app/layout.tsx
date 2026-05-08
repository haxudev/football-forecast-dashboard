import { loadLatest } from '@/lib/data';
import { Nav, StatusStrip } from '@/components/Cards';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let latest: ReturnType<typeof loadLatest> | undefined;
  try { latest = loadLatest(); } catch { latest = undefined; }
  return <html lang="en"><body><StatusStrip truth={latest?.data_truth_mode_summary} model={latest?.model_version_summary} generatedAt={latest?.generated_at} /><Nav /><main className="mx-auto max-w-7xl px-4 pb-12">{children}</main></body></html>;
}
