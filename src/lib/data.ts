import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { Competition, CompetitionsSchema, DataQualitySchema, DiagnosticsSchema, LatestSchema, ManifestSchema, OverviewSchema, Prediction, PredictionsFileSchema, Team, TeamCompareSchema, TeamsSchema, TournamentFileSchema } from './schemas';

const dataRoot = path.join(process.cwd(), 'public', 'data');
export function readJson<T>(rel: string): T { return JSON.parse(readFileSync(path.join(dataRoot, rel), 'utf8')) as T; }
export function loadLatest() { return LatestSchema.parse(readJson('latest.json')); }
export function loadManifest() { const latest = loadLatest(); const raw = readFileSync(path.join(dataRoot, 'manifest.json')); const hash = createHash('sha256').update(raw).digest('hex'); if (hash !== latest.manifest_sha256) throw new Error('latest.json manifest_sha256 mismatch'); const manifest = ManifestSchema.parse(JSON.parse(raw.toString('utf8'))); if (manifest.pack_version !== latest.pack_version) throw new Error('latest/manifest pack_version mismatch'); return manifest; }
export function loadOverview() { return OverviewSchema.parse(readJson('overview.json')); }
export function loadCompetitions(): Competition[] { return CompetitionsSchema.parse(readJson('competitions.json')).competitions; }
export function loadTeams(): Team[] { return TeamsSchema.parse(readJson('teams.json')).teams; }
export function loadTeamCompare() { return TeamCompareSchema.parse(readJson('team_compare.json')); }
export function loadPredictions(competitionId: string): Prediction[] { return PredictionsFileSchema.parse(readJson(`predictions/${competitionId}.json`)).predictions; }
export function loadPredictionFile(competitionId: string) { return PredictionsFileSchema.parse(readJson(`predictions/${competitionId}.json`)); }
export function loadAllPredictions(): Prediction[] { return loadManifest().competitions.flatMap(c => { try { return loadPredictions(c); } catch { return []; } }); }
export function loadTournament(competitionId: string) { return TournamentFileSchema.parse(readJson(`tournaments/${competitionId}.json`)); }
export function loadDiagnostics() { return DiagnosticsSchema.parse(readJson('diagnostics.json')); }
export function loadDataQuality() { return DataQualitySchema.parse(readJson('data_quality.json')); }
