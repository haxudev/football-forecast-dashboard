// src/views/OverviewSortable.tsx
// Phase B (B-5) — client 子组件：sort segmented control + FixtureGrid 排序传参。
'use client';

import { useState } from 'react';
import { FixtureGrid, type FixtureSortBy } from '@/components/fixture/FixtureGrid';
import type { FixtureRow } from '@/lib/fixtures';
import { getDictionary, type Locale } from '@/lib/i18n';

export interface OverviewSortableProps {
  fixtures: readonly FixtureRow[];
  locale: Locale;
}

export function OverviewSortable({ fixtures, locale }: OverviewSortableProps) {
  const t = getDictionary(locale);
  // Phase B (B-5)，Sprint 6.5: 默认按开赛时间升序 · 可切换到主胜概率
  const [sortBy, setSortBy] = useState<FixtureSortBy>('kickoff_asc');

  return (
    <section aria-labelledby="upcoming-h">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <h2 id="upcoming-h" className="section-title" style={{ margin: 0 }}>
          {t.overview.todayHighlights}
        </h2>
        <div
          className="sort-segmented"
          role="tablist"
          aria-label={t.overview.todayHighlights}
          style={{
            display: 'inline-flex',
            gap: 4,
            padding: 2,
            borderRadius: 8,
            background: 'var(--bg-surface-2)',
            fontSize: 12,
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={sortBy === 'home_win_desc'}
            onClick={() => setSortBy('home_win_desc')}
            data-active={sortBy === 'home_win_desc'}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: sortBy === 'home_win_desc' ? 'var(--accent-cyan)' : 'transparent',
              color: sortBy === 'home_win_desc' ? 'var(--bg-app)' : 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {t.overview.sortByHomeWin}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={sortBy === 'kickoff_asc'}
            onClick={() => setSortBy('kickoff_asc')}
            data-active={sortBy === 'kickoff_asc'}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: sortBy === 'kickoff_asc' ? 'var(--accent-cyan)' : 'transparent',
              color: sortBy === 'kickoff_asc' ? 'var(--bg-app)' : 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {t.overview.sortByKickoff}
          </button>
        </div>
      </div>
      <FixtureGrid fixtures={fixtures} mode="primary" sortBy={sortBy} groupByGameweek={sortBy === 'kickoff_asc'} t={t} />
    </section>
  );
}
