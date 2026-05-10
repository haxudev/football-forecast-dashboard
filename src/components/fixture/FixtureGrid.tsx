// src/components/fixture/FixtureGrid.tsx
// Phase A — design §3.2，三入口共享组件（mode: primary | picker）。
// 默认排序：sortFixtures(kickoff_utc ASC + match_id ASC) 由 lib/fixtures.ts 保证。
// Phase B (B-5) ：sortBy='home_win_desc' 走 sortFixturesByHomeWinDesc（p_home DESC）。
// 分组：按 matchday 分组（GW N），无 matchday 落入 fallback。
// Phase B (B-3) 响应式：1440=3 列 / 768-1439=2 列 / <768=1 列
//   通过 .fixture-grid 的 grid-template-columns + media query 实现（globals.css）。
import { sortFixtures, sortFixturesByHomeWinDesc, type FixtureRow } from '@/lib/fixtures';
import { type Dictionary } from '@/lib/i18n';
import { FixtureCard, type FixtureCardMode } from './FixtureCard';

export type FixtureSortBy = 'kickoff_asc' | 'home_win_desc';

export interface FixtureGridProps {
  fixtures: readonly FixtureRow[];
  mode: FixtureCardMode;
  pickerHref?: 'match' | 'team-comparison';
  groupByGameweek?: boolean;
  /** Phase B (B-5)：排序策略。默认 kickoff_asc；home_win_desc = 主胜概率 DESC。 */
  sortBy?: FixtureSortBy;
  t: Dictionary;
}

function groupByGW(rows: FixtureRow[]): Array<{ key: string; label: string; rows: FixtureRow[] }> {
  const map = new Map<string, FixtureRow[]>();
  for (const r of rows) {
    const k = r.matchday != null ? `gw_${r.matchday}` : 'gw_none';
    const arr = map.get(k);
    if (arr) arr.push(r);
    else map.set(k, [r]);
  }
  return [...map.entries()].map(([key, rows]) => ({
    key,
    label: key === 'gw_none' ? '' : `GW ${rows[0].matchday}`,
    rows,
  }));
}

export function FixtureGrid({
  fixtures,
  mode,
  pickerHref,
  groupByGameweek = false,
  sortBy = 'kickoff_asc',
  t,
}: FixtureGridProps) {
  const sorted = sortBy === 'home_win_desc'
    ? sortFixturesByHomeWinDesc(fixtures)
    : sortFixtures(fixtures);

  if (sorted.length === 0) {
    return <p className="muted">{t.overview.noUpcoming}</p>;
  }

  if (!groupByGameweek) {
    return (
      <div className="fixture-grid" data-fixture-grid-mode={mode}>
        {sorted.map((row) => (
          <FixtureCard key={row.match_id} fixture={row} mode={mode} pickerHref={pickerHref} t={t} />
        ))}
      </div>
    );
  }

  const groups = groupByGW(sorted);
  return (
    <div data-fixture-grid-mode={mode}>
      {groups.map((g) => (
        <section key={g.key} className="fixture-grid-section">
          {g.label && (
            <h3 className="fixture-grid-section-h">
              {g.key === 'gw_none' ? t.fixtureCard.gameweekFallback : t.fixtureCard.gameweek.replace('{n}', String(g.rows[0].matchday))}
            </h3>
          )}
          <div className="fixture-grid">
            {g.rows.map((row) => (
              <FixtureCard
                key={row.match_id}
                fixture={row}
                mode={mode}
                pickerHref={pickerHref}
                t={t}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
