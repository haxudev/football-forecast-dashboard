import Link from 'next/link';
import { getDictionary } from '@/lib/i18n';

export default function NotFound() {
  const t = getDictionary('zh');
  return (
    <div className="space-y-4">
      <h1 className="page-title">{t.match.notFoundTitle}</h1>
      <p>{t.match.notFoundBody}</p>
      <Link href="/" className="hero-action">{t.match.notFoundCta}</Link>
    </div>
  );
}
