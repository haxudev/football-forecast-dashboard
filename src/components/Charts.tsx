'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { Prediction } from '@/lib/schemas';
import type { Dictionary, Locale } from '@/lib/i18n';
import { localizedTeamFromId, localizedTeamName } from '@/lib/i18n';

type Option = echarts.EChartsOption;

function useChart(option: Option, theme: string = 'dark') {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, theme, { renderer: 'svg' });
    chart.setOption({ backgroundColor: 'transparent', textStyle: { color: '#A8B4C8' }, ...option });
    const onResize = () => chart.resize();
    requestAnimationFrame(onResize);
    const timer = window.setTimeout(onResize, 120);
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, [option, theme]);
  return ref;
}

function ChartBox({ option, label, height = 260, children }: { option: Option; label: string; height?: number; children?: React.ReactNode }) {
  const ref = useChart(option);
  return (
    <div className="min-w-0">
      <div ref={ref} role="img" aria-label={label} style={{ height }} className="chart-box" />
      {children}
    </div>
  );
}

export function ProbabilityEChart({ prediction, t }: { prediction: Prediction; t: Dictionary }) {
  return (
    <ChartBox
      label={t.charts.stackedProb}
      height={170}
      option={{
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 18, top: 20, bottom: 28 },
        xAxis: { type: 'value', max: 1, axisLabel: { formatter: (v: number) => `${Math.round(v * 100)}%` } },
        yAxis: { type: 'category', data: [t.common.probability] },
        series: [
          { name: t.common.home, type: 'bar', stack: 'prob', data: [prediction.p_home], itemStyle: { color: '#22D3EE' } },
          { name: t.common.draw, type: 'bar', stack: 'prob', data: [prediction.p_draw], itemStyle: { color: '#94A3B8' } },
          { name: t.common.away, type: 'bar', stack: 'prob', data: [prediction.p_away], itemStyle: { color: '#F472B6' } },
        ],
      }}
    >
      <table className="sr-only">
        <caption>{t.charts.probabilitiesTable}</caption>
        <tbody>
          <tr><th scope="row">{t.common.home}</th><td>{prediction.p_home}</td></tr>
          <tr><th scope="row">{t.common.draw}</th><td>{prediction.p_draw}</td></tr>
          <tr><th scope="row">{t.common.away}</th><td>{prediction.p_away}</td></tr>
        </tbody>
      </table>
    </ChartBox>
  );
}

export function ScorelineHeatmap({ prediction, t }: { prediction: Prediction; t: Dictionary }) {
  const top = new Map(prediction.scoreline_top3.map((s) => [`${s.home_goals}-${s.away_goals}`, s.probability]));
  const data: [number, number, number][] = [];
  for (let h = 0; h <= 5; h += 1)
    for (let a = 0; a <= 5; a += 1)
      data.push([
        a,
        h,
        top.get(`${h}-${a}`) ??
          Math.max(0.005, 0.08 / (1 + Math.abs(h - prediction.expected_goals_home) + Math.abs(a - prediction.expected_goals_away))),
      ]);
  const best = prediction.scoreline_top3[0];
  return (
    <ChartBox
      label={t.charts.heatmap}
      height={310}
      option={{
        tooltip: { formatter: (p) => { const params = Array.isArray(p) ? p[0] : p; const v = (params as unknown as { value: [number, number, number] }).value; return `${v[1]}-${v[0]}: ${(v[2] * 100).toFixed(1)}%`; } },
        grid: { left: 48, right: 24, top: 20, bottom: 42 },
        xAxis: { type: 'category', name: t.common.away, data: ['0', '1', '2', '3', '4', '5+'] },
        yAxis: { type: 'category', name: t.common.home, data: ['0', '1', '2', '3', '4', '5+'] },
        visualMap: { min: 0, max: 0.14, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#0E1524', '#0E7490', '#22D3EE'] } },
        series: [{ type: 'heatmap', data, label: { show: false }, itemStyle: { borderColor: '#1E2A44', borderWidth: 1 } }],
      }}
    >
      {best && (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {t.charts.mostLikelyScore}
          <b className="font-mono text-[var(--accent-cyan)]">{best.home_goals}–{best.away_goals} ({(best.probability * 100).toFixed(1)}%)</b>
        </p>
      )}
    </ChartBox>
  );
}

export function AdvancementBars({
  simulations,
  t,
  locale,
}: {
  simulations: { team_id: string; champion_probability: number; advance_probability: number }[];
  t: Dictionary;
  locale: Locale;
}) {
  const rows = simulations.slice().sort((a, b) => b.champion_probability - a.champion_probability);
  const labels = rows.map((r) => localizedTeamFromId(r.team_id, locale));
  return (
    <ChartBox
      label={t.charts.advancementBars}
      height={Math.max(220, rows.length * 52)}
      option={{
        tooltip: { trigger: 'axis' },
        legend: { textStyle: { color: '#A8B4C8' } },
        grid: { left: 120, right: 30, top: 28, bottom: 24 },
        xAxis: { type: 'value', max: 1, axisLabel: { formatter: (v: number) => `${Math.round(v * 100)}%` } },
        yAxis: { type: 'category', data: labels },
        series: [
          { name: t.tournament.advanceProbability, type: 'bar', data: rows.map((r) => r.advance_probability), itemStyle: { color: '#14B8A6' } },
          { name: t.tournament.championProbability, type: 'bar', data: rows.map((r) => r.champion_probability), itemStyle: { color: '#22D3EE' } },
        ],
      }}
    >
      <table className="sr-only">
        <caption>{t.charts.advancementBars}</caption>
        <thead><tr><th scope="col">{t.common.team}</th><th scope="col">{t.tournament.advanceProbability}</th><th scope="col">{t.tournament.championProbability}</th></tr></thead>
        <tbody>{rows.map((r, i) => <tr key={r.team_id}><th scope="row">{labels[i]}</th><td>{r.advance_probability}</td><td>{r.champion_probability}</td></tr>)}</tbody>
      </table>
    </ChartBox>
  );
}

export function RadarChart({ teams, t, locale }: { teams: string[]; t: Dictionary; locale: Locale }) {
  const indicators = [
    { name: t.team.recentForm, max: 100 },
    { name: t.team.avgScore, max: 5 },
    { name: t.team.avgConceded, max: 5 },
    { name: t.team.homeStrength, max: 100 },
    { name: t.team.awayStrength, max: 100 },
  ];
  const localized = teams.map((s) => localizedTeamName(s, locale) || s);
  return (
    <ChartBox
      label={t.charts.radar}
      height={320}
      option={{
        radar: {
          indicator: indicators,
          axisName: { color: '#A8B4C8' },
          splitLine: { lineStyle: { color: '#1E2A44' } },
          splitArea: { areaStyle: { color: ['rgba(19,32,58,.25)', 'rgba(14,21,36,.25)'] } },
        },
        legend: { data: localized, textStyle: { color: '#A8B4C8' } },
        series: [{
          type: 'radar',
          data: [
            { name: localized[0] ?? 'Team A', value: [72, 1.6, 1.1, 66, 54], itemStyle: { color: '#22D3EE' }, areaStyle: { color: 'rgba(34,211,238,.12)' } },
            { name: localized[1] ?? 'Team B', value: [64, 1.5, 1.3, 58, 62], itemStyle: { color: '#F472B6' }, areaStyle: { color: 'rgba(244,114,182,.12)' } },
          ],
        }],
      }}
    />
  );
}
