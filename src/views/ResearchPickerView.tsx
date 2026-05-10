// src/views/ResearchPickerView.tsx
// Phase A hotfix — /research：研究落地选场，FixtureGrid mode='picker' pickerHref='match'。
import { FixtureGrid } from '@/components/fixture/FixtureGrid';
import { tryLoadFixtures } from '@/lib/data-fixture';
import { isUpcomingFixture } from '@/lib/fixtures';
import { getDictionary, type Locale } from '@/lib/i18n';

export function ResearchPickerView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const fixturesFile = tryLoadFixtures();
  const upcoming = (fixturesFile?.fixtures ?? []).filter(isUpcomingFixture);

  return (
    <div className="space-y-4">
      <header className="page-header">
        <h1 className="page-title">{t.nav.research}</h1>
        <p className="muted">{t.overview.pickerHint}</p>
      </header>
      <FixtureGrid fixtures={upcoming} mode="picker" pickerHref="match" t={t} />
    </div>
  );
}
