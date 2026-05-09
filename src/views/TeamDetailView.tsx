import { notFound } from 'next/navigation';
import { loadTeams } from '@/lib/data';

type Locale = 'zh' | 'en';

const dict = {
  zh: {
    coach: '主教练',
    squad: '阵容',
    players: '球员',
    venue: '主场',
    founded: '成立年份',
    country: '国家/地区',
    no_squad: '阵容信息升级中',
    back: '返回球队列表',
    truth: '数据真值标识',
    position: '位置',
  },
  en: {
    coach: 'Manager',
    squad: 'Squad',
    players: 'Players',
    venue: 'Venue',
    founded: 'Founded',
    country: 'Country',
    no_squad: 'Squad data upgrading…',
    back: 'Back to teams',
    truth: 'Data Truth Mode',
    position: 'Position',
  },
} as const;

interface TeamDetailViewProps {
  locale: Locale;
  teamId: string;
}

export function TeamDetailView({ locale, teamId }: TeamDetailViewProps) {
  const teams = loadTeams();
  const decodedId = decodeURIComponent(teamId);
  const team = teams.find((t) => t.team_id === decodedId);
  if (!team) {
    notFound();
  }
  const t = dict[locale];
  const players = team.players ?? [];
  const coach = team.coach_name ?? null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-8" data-testid="team-detail-view">
      <header className="space-y-2">
        <a
          href={locale === 'zh' ? '/team-comparison' : '/en/team-comparison'}
          className="text-sm text-emerald-600 hover:underline"
        >
          ← {t.back}
        </a>
        <h1 className="text-3xl font-bold">{team.canonical_name}</h1>
        {team.canonical_name_zh && locale === 'zh' && team.canonical_name_zh !== team.canonical_name && (
          <p className="text-lg text-gray-600">{team.canonical_name_zh}</p>
        )}
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {coach && (
            <div>
              <dt className="text-xs uppercase text-gray-500">{t.coach}</dt>
              <dd
                className="text-base font-medium"
                data-testid="coach-name"
              >
                {coach}
              </dd>
            </div>
          )}
          {team.country && (
            <div>
              <dt className="text-xs uppercase text-gray-500">{t.country}</dt>
              <dd className="text-base">{team.country}</dd>
            </div>
          )}
          {team.venue && (
            <div>
              <dt className="text-xs uppercase text-gray-500">{t.venue}</dt>
              <dd className="text-base">{team.venue}</dd>
            </div>
          )}
          {team.founded && (
            <div>
              <dt className="text-xs uppercase text-gray-500">{t.founded}</dt>
              <dd className="text-base">{team.founded}</dd>
            </div>
          )}
          {team.tla && (
            <div>
              <dt className="text-xs uppercase text-gray-500">TLA</dt>
              <dd className="font-mono text-base">{team.tla}</dd>
            </div>
          )}
        </dl>
      </header>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">
          {t.squad} ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            {t.no_squad}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {players.map((p, idx) => (
              <div
                key={p.player_id ?? `${team.team_id}-${idx}`}
                className="rounded border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                data-testid="player-card"
              >
                <div className="font-medium">{p.name ?? '—'}</div>
                {p.position && (
                  <div className="text-xs text-gray-500">
                    {t.position}: {p.position}
                  </div>
                )}
                {p.nationality && (
                  <div className="text-xs text-gray-500">{p.nationality}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
