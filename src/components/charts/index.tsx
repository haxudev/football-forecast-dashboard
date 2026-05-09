// src/components/charts/index.tsx
// Phase A — design §5.3 / §13 SVG mockup 实现。
// 维度 ① ScoreHeatmap / ② XgBars / ③ FormSparkline / ⑤ H2HTimeline / ⑥ FatigueBars
// ⑦ TacticalRadar / ⑧ RefereeBars / ⑨ OddsDiffBars / ⑩ ScenarioBarList
// 全部 pure-SVG，零外部图表 lib 依赖（ScenarioBarList 用 div bar）。
import type {
  ScorelineDistributionT as ScorelineDistribution,
  ExpectedGoals,
  TeamFormT as TeamForm,
  H2HT as H2H,
  FatigueT as Fatigue,
  TacticalT as Tactical,
  RefereeT as Referee,
  OddsDiffT as OddsDiff,
  ScenarioSimulationT as ScenarioSimulation,
  ForecastPackV2,
  ScenarioId,
} from '@/lib/forecast-pack';
import type { Dictionary } from '@/lib/i18n';

// ────────────────────────── ① ScoreHeatmap ──────────────────────────
export function ScoreHeatmap({ data, t }: { data: ScorelineDistribution; t: Dictionary }) {
  const cells = data.matrix;
  const max = Math.max(...cells.flat(), 0.001);
  const cell = 30;
  const W = cell * 6 + 30;
  const H = cell * 6 + 30;
  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.charts.heatmap}>
      <text x={W / 2} y={12} textAnchor="middle" fontSize={10} fill="currentColor">{t.common.away}</text>
      <text x={10} y={H / 2} textAnchor="middle" fontSize={10} fill="currentColor" transform={`rotate(-90 10 ${H / 2})`}>{t.common.home}</text>
      {cells.map((row: number[], h: number) =>
        row.map((p: number, a: number) => {
          const intensity = Math.min(1, p / max);
          const fill = `rgba(34,211,238,${0.1 + intensity * 0.8})`;
          return (
            <g key={`${h}-${a}`}>
              <rect
                x={20 + a * cell}
                y={20 + h * cell}
                width={cell - 2}
                height={cell - 2}
                fill={fill}
                stroke="rgba(255,255,255,.05)"
              />
              <text
                x={20 + a * cell + cell / 2}
                y={20 + h * cell + cell / 2 + 3}
                textAnchor="middle"
                fontSize={9}
                fill="#fff"
              >
                {(p * 100).toFixed(0)}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}

// ────────────────────────── ② XgBars (M-3 fallback) ──────────────────────────
export function XgBars({ data, t }: { data: ExpectedGoals; t: Dictionary }) {
  const home = data.xg_breakdown_home;
  const away = data.xg_breakdown_away;
  const hasBreakdown = !!home && !!away;
  if (!hasBreakdown) {
    // M-3 fallback: 4 数字双柱
    const max = Math.max(data.xg_home, data.xg_away, data.xga_home ?? 0, data.xga_away ?? 0, 1);
    return (
      <div role="img" aria-label="xG fallback bars" data-xg-mode="fallback">
        <p className="muted" style={{ fontSize: 11, marginBottom: 6 }}>{t.match.xgFallbackNote}</p>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td>{t.common.home} xG</td><td><Bar value={data.xg_home} max={max} kind="home" /></td><td>{data.xg_home.toFixed(2)}</td></tr>
            <tr><td>{t.common.away} xG</td><td><Bar value={data.xg_away} max={max} kind="away" /></td><td>{data.xg_away.toFixed(2)}</td></tr>
            {data.xga_home != null && <tr><td>{t.common.home} xGA</td><td><Bar value={data.xga_home} max={max} kind="draw" /></td><td>{data.xga_home.toFixed(2)}</td></tr>}
            {data.xga_away != null && <tr><td>{t.common.away} xGA</td><td><Bar value={data.xga_away} max={max} kind="draw" /></td><td>{data.xga_away.toFixed(2)}</td></tr>}
          </tbody>
        </table>
      </div>
    );
  }
  // 5 段细分（design §5.3 ②）
  const segs = [
    { key: 'open_play', label: 'Open Play' },
    { key: 'set_piece', label: 'Set Piece' },
    { key: 'penalty', label: 'Penalty' },
    { key: 'counter_attack', label: 'Counter' },
    { key: 'other', label: 'Other' },
  ] as const;
  return (
    <div role="img" aria-label="xG 5-segment breakdown" data-xg-mode="breakdown">
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
        <thead><tr><th>{t.common.home}</th><th>{t.common.away}</th></tr></thead>
        <tbody>
          {segs.map((s) => {
            const h = (home as Record<string, number>)[`xg_${s.key}`] ?? 0;
            const a = (away as Record<string, number>)[`xg_${s.key}`] ?? 0;
            return (
              <tr key={s.key}>
                <td colSpan={2}>
                  <span style={{ fontSize: 10 }}>{s.label}: </span>
                  <span>{t.common.home} {h.toFixed(2)} / {t.common.away} {a.toFixed(2)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Bar({ value, max, kind }: { value: number; max: number; kind: 'home' | 'draw' | 'away' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 8, background: 'var(--bg-surface-2)', borderRadius: 4, overflow: 'hidden' }}>
      <span
        style={{ display: 'block', height: '100%', width: `${pct}%`, background: `var(--prob-${kind})` }}
      />
    </div>
  );
}

// ────────────────────────── ③ FormSparkline ──────────────────────────
export function FormSparkline({ form, t, side }: { form: TeamForm; t: Dictionary; side: 'home' | 'away' }) {
  const last5 = form.last_5;
  if (!last5) return <p className="chart-empty">{t.common.noFixtures}</p>;
  const wdl = `${last5.wins}W ${last5.draws}D ${last5.losses}L`;
  const goals = `${last5.goals_for}-${last5.goals_against}`;
  return (
    <div data-form-side={side}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.match.formLabelLast5}: </span>
      <strong>{wdl}</strong>
      <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>{goals}</span>
    </div>
  );
}

// ────────────────────────── ⑤ H2HTimeline ──────────────────────────
export function H2HTimeline({ data, t }: { data: H2H; t: Dictionary }) {
  if (!data) return <p className="chart-empty">{t.common.noFixtures}</p>;
  const s = data.summary;
  return (
    <div>
      <p style={{ fontSize: 12 }}>
        近 {data.matches.length} 次：主胜 <strong>{s.home_wins}</strong> 次 / 平 <strong>{s.draws}</strong> 次 / 客胜 <strong>{s.away_wins}</strong> 次
      </p>
      <ul style={{ fontSize: 11, listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
        {data.matches.slice(0, 5).map((m: NonNullable<H2H>['matches'][number]) => (
          <li key={m.match_id}>{new Date(m.kickoff_utc).toISOString().slice(0, 10)} · {m.home_goals}-{m.away_goals}</li>
        ))}
      </ul>
    </div>
  );
}

// ────────────────────────── ⑥ FatigueBars ──────────────────────────
export function FatigueBars({ data, t }: { data: Fatigue; t: Dictionary }) {
  if (!data) return <p className="chart-empty">{t.common.noFixtures}</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
      <div>
        <strong>{t.common.home}</strong>
        <p>近 7d: {data.home.matches_last_7d} · 近 14d: {data.home.matches_last_14d}</p>
      </div>
      <div>
        <strong>{t.common.away}</strong>
        <p>近 7d: {data.away.matches_last_7d} · 近 14d: {data.away.matches_last_14d}</p>
      </div>
    </div>
  );
}

// ────────────────────────── ⑦ TacticalRadar ──────────────────────────
export function TacticalRadar({ data, t }: { data: Tactical; t: Dictionary }) {
  if (!data) return <p className="chart-empty">{t.common.noFixtures}</p>;
  return (
    <div style={{ fontSize: 12 }}>
      <p>{t.common.home}: 控球 {data.home.possession_pct ?? '—'}% · 压迫 {data.home.press_intensity ?? '—'}</p>
      <p>{t.common.away}: 控球 {data.away.possession_pct ?? '—'}% · 压迫 {data.away.press_intensity ?? '—'}</p>
    </div>
  );
}

// ────────────────────────── ⑧ RefereeBars ──────────────────────────
export function RefereeBars({ data, t }: { data: Referee; t: Dictionary }) {
  if (!data) return <p className="chart-empty">{t.common.noFixtures}</p>;
  return (
    <div style={{ fontSize: 12 }}>
      <p>裁判: <strong>{data.name_zh ?? data.name ?? '—'}</strong></p>
      <p>场均黄牌 {data.avg_yellow_per_match ?? '—'} · 红牌 {data.avg_red_per_match ?? '—'} · 主队偏向 {data.home_bias_index ?? '—'}</p>
    </div>
  );
}

// ────────────────────────── ⑨ OddsDiffBars ──────────────────────────
export function OddsDiffBars({ data, t }: { data: OddsDiff; t: Dictionary }) {
  if (!data) return <p className="chart-empty">{t.common.noFixtures}</p>;
  const d = data.diff;
  return (
    <div style={{ fontSize: 12 }}>
      <p>{data.bookmaker} vs Model</p>
      <p>{t.common.home}: {(d.d_home * 100).toFixed(1)}% · {t.common.draw}: {(d.d_draw * 100).toFixed(1)}% · {t.common.away}: {(d.d_away * 100).toFixed(1)}%</p>
    </div>
  );
}

// ────────────────────────── ⑩ ScenarioBarList (D-10, 严格 6 项) ──────────────────────────
const SCENARIO_KEY_TO_I18N: Record<ScenarioId, keyof Dictionary['match']['scenario']> = {
  early_concede_home_15min: 'earlyConcedeHome15',
  early_concede_away_15min: 'earlyConcedeAway15',
  red_card_home: 'redCardHome',
  red_card_away: 'redCardAway',
  lead_at_ht_home: 'leadAtHtHome',
  lead_at_ht_away: 'leadAtHtAway',
};

export function ScenarioBarList({ data, t }: { data: ScenarioSimulation; t: Dictionary }) {
  if (!data || data.scenarios.length === 0) return <p className="chart-empty">{t.common.noFixtures}</p>;
  return (
    <div className="scenario-list" role="img" aria-label="Scenario simulation bar list">
      {data.scenarios.map((s: NonNullable<ScenarioSimulation>['scenarios'][number]) => {
        const labelKey = SCENARIO_KEY_TO_I18N[s.scenario_id];
        const i18nLabel = (t.match.scenario as unknown as Record<string, string>)[labelKey] ?? s.label_zh;
        return (
          <div key={s.scenario_id} className="scenario-row" data-scenario-id={s.scenario_id}>
            <span className="label">{i18nLabel}</span>
            <span className="bar" aria-label={`${(s.p_home * 100).toFixed(0)}/${(s.p_draw * 100).toFixed(0)}/${(s.p_away * 100).toFixed(0)}`}>
              <span className="seg-h" style={{ width: `${s.p_home * 100}%` }} />
              <span className="seg-d" style={{ width: `${s.p_draw * 100}%` }} />
              <span className="seg-a" style={{ width: `${s.p_away * 100}%` }} />
            </span>
          </div>
        );
      })}
      <p className="muted" style={{ fontSize: 10, marginTop: 8 }}>{t.match.scenario.caveat}</p>
    </div>
  );
}

// ────────────────────────── KeyPlayerCard ──────────────────────────
export function KeyPlayerCard({
  player,
  t,
}: {
  player: NonNullable<NonNullable<ForecastPackV2['player_availability']>['home']['key_players']>[number];
  t: Dictionary;
}) {
  return (
    <div className="key-player-card">
      <div>
        <strong>{player.name_zh ?? player.name}</strong>
        <p className="stats" style={{ margin: 0 }}>
          {t.match.formLabelLast5}: <b>{player.last5_goals ?? 0}</b> 球 / <b>{player.last5_assists ?? 0}</b> 助攻 · 评分 <b>{player.avg_rating_last5?.toFixed(2) ?? '—'}</b>
        </p>
      </div>
    </div>
  );
}
