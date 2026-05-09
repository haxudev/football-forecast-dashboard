import { SampleBanner } from '@/components/Shell';
import { tryLoadFixtures } from '@/lib/data-fixture';
import { friendlyFreshness } from '@/lib/status';
import { getDictionary, type Locale } from '@/lib/i18n';

const BUILD_VERSION = '1.0.0';

export function AboutView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const fixtures = tryLoadFixtures();
  const generatedAt = fixtures?.generated_at;
  const isSample = (fixtures?.data_truth_mode ?? 'SAMPLE_ONLY') === 'SAMPLE_ONLY';
  const freshness = friendlyFreshness(generatedAt, t);
  const buildAt = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <header className="page-header">
        <h1 className="page-title">{t.about.title}</h1>
      </header>

      {isSample && <SampleBanner t={t} />}

      <section className="card">
        <h2 className="font-semibold">{t.about.whatTitle}</h2>
        <p className="mt-2 text-base">{t.about.whatBody}</p>
      </section>

      <section className="card">
        <h2 className="font-semibold">{t.about.dataTitle}</h2>
        <p className="mt-2 text-base">{t.about.dataBody}</p>
      </section>

      <section className="card">
        <h2 className="font-semibold">{t.about.freshTitle}</h2>
        <p className="mt-2 text-base">{t.about.freshBody} <strong>{freshness ?? t.common.unknown}</strong></p>
      </section>

      <section className="card">
        <h2 className="font-semibold">{t.about.methodTitle}</h2>
        <p className="mt-2 text-base">{t.about.methodBody}</p>
      </section>

      <section className="card">
        <h2 className="font-semibold">{t.about.notDoTitle}</h2>
        <ul className="mt-2 list-disc pl-6 text-base">
          {t.about.notDoList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="font-semibold">{t.about.sampleTitle}</h2>
        <p className="mt-2">
          <span className={`chip ${isSample ? 'chip-sample' : 'chip-ok'}`}>
            {isSample ? t.about.sampleYes : t.about.sampleNo}
          </span>
        </p>
      </section>

      <section className="card">
        <h2 className="font-semibold">{t.about.disclaimerTitle}</h2>
        <p className="mt-2 text-base">{t.about.disclaimer}</p>
      </section>

      <p className="muted text-sm">
        {t.about.buildInfo}: {buildAt} · {t.about.version}: v{BUILD_VERSION}
      </p>
    </div>
  );
}
