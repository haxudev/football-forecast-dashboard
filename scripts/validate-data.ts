import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { CompetitionsSchema, LatestSchema, ManifestSchema, OverviewSchema, PredictionsFileSchema, TeamCompareSchema, TeamsSchema, TournamentFileSchema } from '../src/lib/schemas';

const root = path.join(process.cwd(), 'public', 'data');
const parseJson = (rel: string) => JSON.parse(readFileSync(path.join(root, rel), 'utf8')) as unknown;
const sha256 = (rel: string) => createHash('sha256').update(readFileSync(path.join(root, rel))).digest('hex');

const latest = LatestSchema.parse(parseJson('latest.json'));
const manifestHash = sha256(latest.manifest_path);
if (manifestHash !== latest.manifest_sha256) throw new Error(`manifest hash mismatch: ${manifestHash} != ${latest.manifest_sha256}`);
const manifest = ManifestSchema.parse(parseJson(latest.manifest_path));
if (manifest.pack_version !== latest.pack_version) throw new Error('pack version mismatch');

const validators: Record<string, (data: unknown) => unknown> = {
  'overview.json': (d) => OverviewSchema.parse(d),
  'competitions.json': (d) => CompetitionsSchema.parse(d),
  'teams.json': (d) => TeamsSchema.parse(d),
  'team_compare.json': (d) => TeamCompareSchema.parse(d),
};

for (const file of manifest.files) {
  const actualHash = sha256(file.path);
  if (actualHash !== file.sha256) throw new Error(`manifest file hash mismatch for ${file.path}`);
  const data = parseJson(file.path);
  if (file.path.startsWith('predictions/')) PredictionsFileSchema.parse(data);
  else if (file.path.startsWith('tournaments/')) TournamentFileSchema.parse(data);
  else if (validators[file.path]) validators[file.path](data);
  else throw new Error(`no schema validator registered for ${file.path}`);
}

for (const comp of manifest.competitions) {
  if (!manifest.files.some((f) => f.path === `predictions/${comp}.json`)) throw new Error(`missing predictions file for ${comp}`);
}

console.log(`validated ${manifest.files.length} files for ${manifest.competitions.length} competitions`);
