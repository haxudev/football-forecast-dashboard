# Football Forecast Dashboard

Static Next.js cockpit for Local Datalake P2 football forecasting.

## Stack

- Next.js App Router with `output: 'export'`
- TypeScript strict
- Tailwind CSS tokens in `src/styles/tokens.css`
- ECharts SVG renderer for probability, heatmap, radar, calibration, and feature-importance charts
- zod data-pack validation
- Azure Static Web Apps for static hosting only

## Data pack

All runtime data is read from `public/data`:

```text
public/data/
├── latest.json
├── manifest.json
├── overview.json
├── competitions.json
├── teams.json
├── predictions/*.json
├── tournaments/*.json
├── team_compare.json
├── diagnostics.json
└── data_quality.json
```

`latest.json` must match the sha256 of `manifest.json`; every `manifest.files[]` entry is checked by `pnpm validate:data`.

## Local commands

```bash
pnpm install
pnpm validate:data
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

`pnpm build` emits the static site into `out/`.

## Updating data

From the local datalake repo:

```bash
cd /home/haxu/.openclaw/workspace-eng-pm/projects/local-datalake
DRY_RUN=1 ./scripts/sync_dashboard_data.sh
DRY_RUN=0 ./scripts/sync_dashboard_data.sh
```

The non-dry run exports the pack to `public/data`, then `git pull --ff-only`, `git add public/data`, `git commit`, and `git push` when the dashboard directory is a git worktree. Secrets/PATs are never hard-coded; configure git credentials outside the repo.

## Azure SWA

`.github/workflows/deploy.yml` builds locally and uploads `out/` using:

- `app_location: "/"`
- `output_location: "out"`
- `skip_app_build: true`
- `skip_api_build: true`

`staticwebapp.config.json` sets `platform.apiRuntime = null`. This project must not add API routes, Python, DB, MinIO, or MLflow runtime clients.

## Truth, a11y, and non-betting rules

- `SAMPLE_ONLY`, `FALLBACK`, and `UNKNOWN` states are never green.
- Match Predictor always states: `Market odds not used in this prediction.`
- Charts expose `role="img"` labels and/or table/text fallback.
- Focus rings are visible through global `:focus-visible` styles.
- No betting, cashout, value-bet, or wagering UI belongs in P2.
