// src/components/match/LineupPair.tsx
// design §4.3 — 双队首发名单（双列 / 单列响应式 + bench / unavailable / yellow_watch）。
import type { SidePlayers, ForecastPackV2 } from '@/lib/forecast-pack';
import type { Dictionary } from '@/lib/i18n';
import { PlayerBadge } from './PlayerBadge';

function PlayerRow({ p, t }: { p: SidePlayers['lineup']['starting_xi'][number]; t: Dictionary }) {
  const name = p.name_zh ?? p.name;
  return (
    <li className="lineup-row">
      {typeof p.shirt_number === 'number' && <span className="num">{p.shirt_number}</span>}
      <span className="name">{name}</span>
      <PlayerBadge player={p} t={t} />
    </li>
  );
}

function SideBlock({
  side,
  heading,
  t,
}: {
  side: SidePlayers;
  heading: string;
  t: Dictionary;
}) {
  const methodKey = side.lineup.method;
  const methodLabel = t.teamCompare.lineupMethod[methodKey] ?? methodKey;
  return (
    <div className="lineup-col">
      <h3>{heading}</h3>
      <p className="muted" style={{ fontSize: 11, marginBottom: 8 }}>
        {t.teamCompare.formationLabel}: {side.lineup.formation ?? '—'} · {methodLabel}
      </p>
      {side.lineup.starting_xi.length === 0 ? (
        <p className="muted">{t.teamCompare.noLineup}</p>
      ) : (
        <ul className="lineup-list" aria-label={heading}>
          {side.lineup.starting_xi.map((p) => <PlayerRow key={p.player_id} p={p} t={t} />)}
        </ul>
      )}
      {side.absentees.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 13, cursor: 'pointer' }}>{t.teamCompare.unavailableHeading} ({side.absentees.length})</summary>
          <ul className="lineup-list" style={{ marginTop: 6 }}>
            {side.absentees.map((a) => (
              <li key={a.player_id} className="lineup-row">
                <span className="name">{a.name_zh ?? a.name}</span>
                <span className="muted" style={{ fontSize: 11 }}>{a.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function LineupPair({
  pack,
  t,
}: {
  pack: ForecastPackV2;
  t: Dictionary;
}) {
  const pa = pack.player_availability;
  if (!pa) return <p className="muted">{t.teamCompare.noLineup}</p>;
  return (
    <div className="lineup-pair" aria-label={t.match.dim['04']}>
      <SideBlock side={pa.home} heading={t.teamCompare.lineupHomeHeading} t={t} />
      <SideBlock side={pa.away} heading={t.teamCompare.lineupAwayHeading} t={t} />
    </div>
  );
}
