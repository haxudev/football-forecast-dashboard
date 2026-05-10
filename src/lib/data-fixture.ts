// src/lib/data-fixture.ts
// Phase A fixture-driven loaders（独立于 v1 data.ts，避免 v1 / v2 互相污染）。
// 读取顺序（依赖关系不变）：
//   1. fixtures.json — 三入口共享列表
//   2. match-pack/<match_id>.json — 单场 forecast pack
//   3. sentiment.json — 舆情列表
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { parseFixturesFile, type FixturesFile, type FixtureRow } from './fixtures';
import { parseForecastPackV2, type ForecastPackV2 } from './forecast-pack';
import { parseSentimentList, type SentimentListFile } from './sentiment';

const dataRoot = path.join(process.cwd(), 'public', 'data');

export function readJsonRaw(rel: string): unknown {
  return JSON.parse(readFileSync(path.join(dataRoot, rel), 'utf8'));
}

export function loadFixtures(): FixturesFile {
  return parseFixturesFile(readJsonRaw('fixtures.json'));
}

export function tryLoadFixtures(): FixturesFile | null {
  const p = path.join(dataRoot, 'fixtures.json');
  if (!existsSync(p)) return null;
  try {
    return parseFixturesFile(JSON.parse(readFileSync(p, 'utf8')));
  } catch (err) {
    console.warn('[data-fixture] fixtures.json parse failed', (err as Error).message);
    return null;
  }
}

export function loadMatchPack(matchId: string): ForecastPackV2 {
  return parseForecastPackV2(readJsonRaw(`match-pack/${matchId}.json`));
}

export function tryLoadMatchPack(matchId: string): ForecastPackV2 | null {
  const p = path.join(dataRoot, 'match-pack', `${matchId}.json`);
  if (!existsSync(p)) return null;
  try {
    return parseForecastPackV2(JSON.parse(readFileSync(p, 'utf8')));
  } catch (err) {
    console.warn(`[data-fixture] match-pack/${matchId} parse failed`, (err as Error).message);
    return null;
  }
}

export function listMatchPackIds(): string[] {
  const dir = path.join(dataRoot, 'match-pack');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

export function loadSentimentList(): SentimentListFile {
  return parseSentimentList(readJsonRaw('sentiment.json'));
}

export function tryLoadSentimentList(): SentimentListFile | null {
  const p = path.join(dataRoot, 'sentiment.json');
  if (!existsSync(p)) return null;
  try {
    return parseSentimentList(JSON.parse(readFileSync(p, 'utf8')));
  } catch (err) {
    console.warn('[data-fixture] sentiment.json parse failed', (err as Error).message);
    return null;
  }
}

/** 找到 fixture 列表中匹配的 row（用于路由 matchId 校验）。 */
export function findFixtureRow(matchId: string): FixtureRow | null {
  const f = tryLoadFixtures();
  if (!f) return null;
  return f.fixtures.find((r) => r.match_id === matchId) ?? null;
}
