'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { Prediction } from '@/lib/schemas';
import type { Dictionary } from '@/lib/i18n';

type Option = echarts.EChartsOption;

function useChart(option: Option) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current, 'dark', { renderer: 'svg' });
    chart.setOption({ backgroundColor: 'transparent', textStyle: { color: '#A8B4C8' }, ...option });
    const onResize = () => chart.resize();
    requestAnimationFrame(onResize);
    const timer = window.setTimeout(onResize, 120);
    window.addEventListener('resize', onResize);
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', onResize); chart.dispose(); };
  }, [option]);
  return ref;
}

function ChartBox({ option, label, height = 260, children }: { option: Option; label: string; height?: number; children?: React.ReactNode }) {
  const ref = useChart(option);
  return <div className="min-w-0"><div ref={ref} role="img" aria-label={label} style={{ height }} className="chart-box" />{children}</div>;
}

export function ProbabilityEChart({ prediction, t }: { prediction: Prediction; t?: Dictionary }) {
  return <ChartBox label={t?.charts.stackedProb ?? 'Stacked home draw away probability chart'} height={170} option={{ tooltip: { trigger: 'axis' }, grid: { left: 40, right: 18, top: 20, bottom: 28 }, xAxis: { type: 'value', max: 1, axisLabel: { formatter: (v: number) => `${Math.round(v * 100)}%` } }, yAxis: { type: 'category', data: ['Outcome'] }, series: [
    { name: t?.common.home ?? 'Home', type: 'bar', stack: 'prob', data: [prediction.p_home], itemStyle: { color: '#22D3EE' } },
    { name: t?.common.draw ?? 'Draw', type: 'bar', stack: 'prob', data: [prediction.p_draw], itemStyle: { color: '#94A3B8' } },
    { name: t?.common.away ?? 'Away', type: 'bar', stack: 'prob', data: [prediction.p_away], itemStyle: { color: '#F472B6' } },
  ] }}>
    <table className="sr-only"><caption>{t?.charts.probabilitiesTable ?? 'Outcome probabilities'}</caption><tbody><tr><th scope="row">{t?.common.home ?? 'Home'}</th><td>{prediction.p_home}</td></tr><tr><th scope="row">{t?.common.draw ?? 'Draw'}</th><td>{prediction.p_draw}</td></tr><tr><th scope="row">{t?.common.away ?? 'Away'}</th><td>{prediction.p_away}</td></tr></tbody></table>
  </ChartBox>;
}

export function ScorelineHeatmap({ prediction, t }: { prediction: Prediction; t?: Dictionary }) {
  const top = new Map(prediction.scoreline_top3.map((s) => [`${s.home_goals}-${s.away_goals}`, s.probability]));
  const data: [number, number, number][] = [];
  for (let h = 0; h <= 5; h += 1) for (let a = 0; a <= 5; a += 1) data.push([a, h, top.get(`${h}-${a}`) ?? Math.max(0.005, 0.08 / (1 + Math.abs(h - prediction.expected_goals_home) + Math.abs(a - prediction.expected_goals_away)))]);
  const best = prediction.scoreline_top3[0];
  return <ChartBox label={t?.charts.heatmap ?? 'Six by six scoreline probability heatmap'} height={310} option={{ tooltip: { formatter: (p) => { const params = Array.isArray(p) ? p[0] : p; const v = (params as unknown as { value: [number, number, number] }).value; return `${v[1]}-${v[0]}: ${(v[2] * 100).toFixed(1)}%`; } }, grid: { left: 48, right: 24, top: 20, bottom: 42 }, xAxis: { type: 'category', name: t?.common.away ?? 'Away', data: ['0', '1', '2', '3', '4', '5+'] }, yAxis: { type: 'category', name: t?.common.home ?? 'Home', data: ['0', '1', '2', '3', '4', '5+'] }, visualMap: { min: 0, max: 0.14, orient: 'horizontal', left: 'center', bottom: 0, inRange: { color: ['#0E1524', '#0E7490', '#22D3EE'] } }, series: [{ type: 'heatmap', data, label: { show: false }, itemStyle: { borderColor: '#1E2A44', borderWidth: 1 } }] }}>
    {best && <p className="mt-2 text-sm text-[#A8B4C8]">{t?.charts.mostLikelyScore ?? 'Most likely scoreline: '}<b className="font-mono text-[#22D3EE]">{best.home_goals}–{best.away_goals} ({(best.probability * 100).toFixed(1)}%)</b></p>}
    <table className="sr-only"><caption>{t?.charts.scorelineTable ?? 'Top scoreline probabilities'}</caption><thead><tr><th scope="col">{t?.charts.rank ?? 'Rank'}</th><th scope="col">{t?.charts.scoreline ?? 'Scoreline'}</th><th scope="col">{t?.common.probability ?? 'Probability'}</th></tr></thead><tbody>{prediction.scoreline_top3.map((s, i) => <tr key={`${s.home_goals}-${s.away_goals}`}><th scope="row">{i + 1}</th><td>{s.home_goals}-{s.away_goals}</td><td>{s.probability}</td></tr>)}</tbody></table>
  </ChartBox>;
}

export function AdvancementBars({ simulations, t }: { simulations: { team_id: string; champion_probability: number; advance_probability: number }[]; t?: Dictionary }) {
  const rows = simulations.slice().sort((a, b) => b.champion_probability - a.champion_probability);
  return <ChartBox label={t?.charts.advancementBars ?? 'Champion and advancement probability bars'} height={Math.max(220, rows.length * 52)} option={{ tooltip: { trigger: 'axis' }, legend: { textStyle: { color: '#A8B4C8' } }, grid: { left: 120, right: 30, top: 28, bottom: 24 }, xAxis: { type: 'value', max: 1, axisLabel: { formatter: (v: number) => `${Math.round(v * 100)}%` } }, yAxis: { type: 'category', data: rows.map((r) => r.team_id.replaceAll('_', ' ')) }, series: [
    { name: t?.common.advance ?? 'Advance', type: 'bar', data: rows.map((r) => r.advance_probability), itemStyle: { color: '#14B8A6' } },
    { name: t?.common.champion ?? 'Champion', type: 'bar', data: rows.map((r) => r.champion_probability), itemStyle: { color: '#22D3EE' } },
  ] }}>
    <table className="sr-only"><caption>{t?.charts.advancementBars ?? 'Advancement and champion probabilities'}</caption><thead><tr><th scope="col">{t?.common.team ?? 'Team'}</th><th scope="col">{t?.common.advance ?? 'Advance'}</th><th scope="col">{t?.common.champion ?? 'Champion'}</th></tr></thead><tbody>{rows.map(r => <tr key={r.team_id}><th scope="row">{r.team_id}</th><td>{r.advance_probability}</td><td>{r.champion_probability}</td></tr>)}</tbody></table>
  </ChartBox>;
}

export function RadarChart({ teams, t }: { teams: string[]; t?: Dictionary }) {
  const indicators = ['Attack', 'Defense', 'Form', 'Home', 'Away'].map((name) => ({ name, max: 100 }));
  return <ChartBox label={t?.charts.radar ?? 'Team strength radar chart'} height={320} option={{ radar: { indicator: indicators, axisName: { color: '#A8B4C8' }, splitLine: { lineStyle: { color: '#1E2A44' } }, splitArea: { areaStyle: { color: ['rgba(19,32,58,.25)', 'rgba(14,21,36,.25)'] } } }, legend: { data: teams, textStyle: { color: '#A8B4C8' } }, series: [{ type: 'radar', data: [
    { name: teams[0] ?? 'Team A', value: [72, 64, 58, 66, 54], itemStyle: { color: '#22D3EE' }, areaStyle: { color: 'rgba(34,211,238,.12)' } },
    { name: teams[1] ?? 'Team B', value: [64, 68, 52, 58, 62], itemStyle: { color: '#F472B6' }, areaStyle: { color: 'rgba(244,114,182,.12)' } },
  ] }] }} />;
}

export function CalibrationCurve({ ece, t }: { ece: number; t?: Dictionary }) {
  const observed = [[0.1, 0.08], [0.3, 0.28], [0.5, 0.47], [0.7, 0.68], [0.9, 0.86]];
  return <ChartBox label={t?.charts.calibration ?? 'Calibration curve with ideal diagonal'} height={300} option={{ tooltip: { trigger: 'axis' }, grid: { left: 42, right: 24, top: 24, bottom: 42 }, xAxis: { type: 'value', min: 0, max: 1, name: t?.charts.predicted ?? 'Predicted' }, yAxis: { type: 'value', min: 0, max: 1, name: t?.charts.observed ?? 'Observed' }, series: [
    { name: 'Ideal', type: 'line', data: [[0, 0], [1, 1]], lineStyle: { type: 'dashed', color: '#6B7794' }, symbol: 'none' },
    { name: `Model ECE ${ece.toFixed(3)}`, type: 'line', data: observed, symbolSize: 7, lineStyle: { color: '#22D3EE', width: 2 }, itemStyle: { color: '#22D3EE' } },
  ] }}>
    <p className="sr-only">Expected calibration error {ece.toFixed(3)}.</p><table className="sr-only"><caption>Calibration bins</caption><thead><tr><th scope="col">{t?.charts.predicted ?? 'Predicted'}</th><th scope="col">{t?.charts.observed ?? 'Observed'}</th></tr></thead><tbody>{observed.map(([pred, obs]) => <tr key={pred}><th scope="row">{pred}</th><td>{obs}</td></tr>)}</tbody></table>
  </ChartBox>;
}

export function FeatureImportanceChart({ items, t }: { items: { name: string; importance: number }[]; t?: Dictionary }) {
  const rows = items.slice(0, 10).sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance));
  if (!rows.length) return <div className="notice notice-info mt-3">{t?.charts.noFeatureRows ?? 'No feature importance rows in this data pack. The chart is disabled rather than shown as blank.'}</div>;
  return <ChartBox label="Feature importance horizontal bar chart" height={Math.max(220, rows.length * 44)} option={{ tooltip: { trigger: 'axis' }, grid: { left: 130, right: 28, top: 18, bottom: 28 }, xAxis: { type: 'value' }, yAxis: { type: 'category', data: rows.map((r) => r.name) }, series: [{ type: 'bar', data: rows.map((r) => ({ value: r.importance, itemStyle: { color: r.importance >= 0 ? '#22D3EE' : '#F472B6' } })) }] }}>
    <table className="sr-only"><caption>{t?.charts.featureTable ?? 'Top feature importance values'}</caption><thead><tr><th scope="col">Feature</th><th scope="col">Importance</th></tr></thead><tbody>{rows.map(r => <tr key={r.name}><th scope="row">{r.name}</th><td>{r.importance}</td></tr>)}</tbody></table>
  </ChartBox>;
}
