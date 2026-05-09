// src/views/SentimentView.tsx
// Phase A — /sentiment 改造：顶部 [当前赛事=英超] chip + competition_id filter（PL-only by site-config）。
import { tryLoadSentimentList } from '@/lib/data-fixture';
import { filterByEnabledCompetitions } from '@/lib/sentiment';
import { getSiteConfig } from '@/lib/site-config';
import { getDictionary, type Locale } from '@/lib/i18n';

export function SentimentView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const cfg = getSiteConfig();
  const file = tryLoadSentimentList();
  const enabled = cfg.enabled_competitions;
  const items = file ? filterByEnabledCompetitions(file.items, enabled) : [];

  return (
    <div className="space-y-4">
      <header className="page-header">
        <h1 className="page-title">{t.sentiment.title}</h1>
        <p className="muted">{t.sentiment.subtitle}</p>
      </header>

      <div>
        <span
          className="sentiment-comp-chip"
          data-competition-chip
          title={t.sentiment.competitionLockTooltip}
          aria-label={`${t.sentiment.competitionChip} — ${t.sentiment.competitionLockTooltip}`}
        >
          ⚽ {t.sentiment.competitionChip}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="sentiment-empty" role="note">{t.sentiment.emptyAfterFilter}</div>
      ) : (
        <ul className="sentiment-list" aria-label={t.sentiment.title}>
          {items.map((it) => (
            <li key={it.item_id} className="sentiment-item">
              <p className="meta">
                <span>{new Date(it.captured_at).toLocaleDateString()}</span>
                <span>·</span>
                <span>{t.sentiment.itemSourceLabel}: {it.source}</span>
                {it.sentiment_label && <span className={`chip chip-sentiment-${it.sentiment_label.toLowerCase()}`}>{it.sentiment_label}</span>}
              </p>
              <p className="title">{it.title_zh ?? it.title}</p>
              {it.summary_zh || it.summary ? <p className="summary">{it.summary_zh ?? it.summary}</p> : null}
              <p style={{ marginTop: 6 }}><a href={it.url} target="_blank" rel="noopener noreferrer">{t.sentiment.itemReadOriginal}</a></p>
            </li>
          ))}
        </ul>
      )}

      <p className="muted" style={{ fontSize: 11 }}>{t.sentiment.footerNote}</p>
    </div>
  );
}
