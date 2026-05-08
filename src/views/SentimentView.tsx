import { SampleBanner } from '@/components/Shell';
import { loadSentimentRaw } from '@/lib/data';
import { getDictionary, type Locale } from '@/lib/i18n';
import { z } from 'zod';

const SentimentSchema = z.object({
  generatedAt: z.string(),
  topics: z.array(z.object({ id: z.string(), name: z.string(), heatScore: z.number().min(0).max(100) })),
  wordcloud: z.array(z.object({ text: z.string(), weight: z.number().min(1).max(100) })),
  sentimentBars: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      positive: z.number().min(0).max(100),
      neutral: z.number().min(0).max(100),
      negative: z.number().min(0).max(100),
    }),
  ),
});

export function SentimentView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const data = SentimentSchema.parse(loadSentimentRaw(locale));
  const top5Cloud = new Set(data.wordcloud.slice().sort((a, b) => b.weight - a.weight).slice(0, 5).map((w) => w.text));

  return (
    <div className="space-y-6">
      <header className="page-header">
        <h1 className="page-title">{t.sentiment.title}</h1>
        <p className="page-sub">{t.sentiment.subtitle}</p>
      </header>

      <SampleBanner t={t} message={t.sentiment.sampleBanner} />

      <section className="card" aria-labelledby="heat-h">
        <h2 id="heat-h" className="font-semibold mb-3">{t.sentiment.heatRanking}</h2>
        <ol className="heat-list">
          {data.topics.slice(0, 10).map((topic, i) => (
            <li key={topic.id} className="heat-row">
              <span className="heat-rank" aria-hidden="true">{i + 1}</span>
              <span className="heat-name">{topic.name}</span>
              <div className="heat-bar" aria-hidden="true">
                <span className="heat-fill" style={{ width: `${topic.heatScore}%` }} />
              </div>
              <span className="heat-value" aria-label={`${topic.name} ${topic.heatScore}`}>{topic.heatScore}</span>
              <span className="chip chip-sample" aria-label={t.common.sample}>{t.common.sample}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card" aria-labelledby="cloud-h">
        <h2 id="cloud-h" className="font-semibold mb-3">{t.sentiment.wordCloud}</h2>
        <ul className="word-cloud" aria-label={t.sentiment.wordCloud}>
          {data.wordcloud.slice(0, 50).map((w) => (
            <li key={w.text}>
              <span
                className={`cloud-word ${top5Cloud.has(w.text) ? 'cloud-top' : ''}`}
                style={{ fontSize: `${0.85 + (w.weight / 100) * 1.4}rem` }}
              >
                {w.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-labelledby="bars-h">
        <h2 id="bars-h" className="font-semibold mb-3">{t.sentiment.sentimentBars}</h2>
        <ul className="sent-bars">
          {data.sentimentBars.map((b) => (
            <li key={b.id} className="sent-row">
              <div className="sent-label">{b.label}</div>
              <div
                className="sent-bar"
                role="img"
                aria-label={`${b.label}: ${t.sentiment.positive} ${b.positive}%, ${t.sentiment.neutral} ${b.neutral}%, ${t.sentiment.negative} ${b.negative}%`}
              >
                <span className="sent-pos" style={{ width: `${b.positive}%` }}>{b.positive >= 8 ? `${b.positive}%` : ''}</span>
                <span className="sent-neu" style={{ width: `${b.neutral}%` }}>{b.neutral >= 8 ? `${b.neutral}%` : ''}</span>
                <span className="sent-neg" style={{ width: `${b.negative}%` }}>{b.negative >= 8 ? `${b.negative}%` : ''}</span>
              </div>
              <span className="chip chip-sample sent-sample" aria-label={t.common.sample}>{t.common.sample}</span>
            </li>
          ))}
        </ul>
        <p className="muted text-sm mt-3">
          <span aria-hidden="true">●</span> {t.sentiment.positive} ·
          <span aria-hidden="true"> ●</span> {t.sentiment.neutral} ·
          <span aria-hidden="true"> ●</span> {t.sentiment.negative}
        </p>
      </section>

      <p className="caveat">
        {t.sentiment.lastUpdated} {data.generatedAt} · {t.sentiment.footerNote}
      </p>
    </div>
  );
}
