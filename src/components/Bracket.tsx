import type { Dictionary } from '@/lib/i18n';

export function BracketView({ simulations, t }: { simulations: { team_id: string; champion_probability: number; advance_probability: number }[]; t?: Dictionary }) {
  const teams = simulations.length ? simulations : [{ team_id: 'TBD A', champion_probability: 0.5, advance_probability: 0.5 }, { team_id: 'TBD B', champion_probability: 0.5, advance_probability: 0.5 }];
  const champion = teams.slice().sort((a, b) => b.champion_probability - a.champion_probability)[0];
  return (
    <section className="card" aria-labelledby="bracket-title">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="bracket-title" className="font-semibold">{t?.bracket.title ?? 'Bracket progression'}</h2>
        <label className="min-w-0 text-sm text-[#A8B4C8]">{t?.bracket.round ?? 'Round'} <select aria-label="Select tournament round" className="select-control mt-1 sm:ml-2 sm:mt-0"><option>{t?.bracket.finalPath ?? 'Final path'}</option><option>{t?.bracket.semiFinal ?? 'Semi-final'}</option><option>{t?.bracket.quarterFinal ?? 'Quarter-final'}</option></select></label>
      </div>
      <div className="bracket-scroll" role="img" aria-label={`Bracket-like progression view. Most likely champion ${champion.team_id}.`}>
        <svg width="760" height="220" viewBox="0 0 760 220" aria-hidden="true">
          <defs><linearGradient id="bracketFill" x1="0" x2="1"><stop stopColor="#22D3EE"/><stop offset="1" stopColor="#14B8A6"/></linearGradient></defs>
          {teams.slice(0, 4).map((team, index) => <g key={team.team_id} transform={`translate(20 ${20 + index * 48})`}><rect width="210" height="38" rx="10" fill="#13203A" stroke="#2C3E63"/><text x="12" y="24" fill="#E6EDF7" fontSize="13">{team.team_id.replaceAll('_', ' ')}</text><rect x="126" y="15" width="66" height="8" rx="4" fill="#0E1524"/><rect x="126" y="15" width={Math.max(4, team.advance_probability * 66)} height="8" rx="4" fill="url(#bracketFill)"/></g>)}
          <path d="M230 39 H310 V63 H350" stroke="#2C3E63" fill="none"/><path d="M230 87 H310 V63" stroke="#2C3E63" fill="none"/><path d="M230 135 H310 V159 H350" stroke="#2C3E63" fill="none"/><path d="M230 183 H310 V159" stroke="#2C3E63" fill="none"/>
          <rect x="350" y="44" width="210" height="38" rx="10" fill="#13203A" stroke="#22D3EE"/><text x="362" y="68" fill="#E6EDF7" fontSize="13">{t?.bracket.upper ?? 'Semi finalist · upper'}</text>
          <rect x="350" y="140" width="210" height="38" rx="10" fill="#13203A" stroke="#22D3EE"/><text x="362" y="164" fill="#E6EDF7" fontSize="13">{t?.bracket.lower ?? 'Semi finalist · lower'}</text>
          <path d="M560 63 H625 V111 H648" stroke="#2C3E63" fill="none"/><path d="M560 159 H625 V111" stroke="#2C3E63" fill="none"/>
          <rect x="648" y="92" width="90" height="38" rx="10" fill="#0E7490" stroke="#22D3EE"/><text x="660" y="116" fill="#E6EDF7" fontSize="13">{t?.bracket.champion ?? 'Champion'}</text>
        </svg>
      </div>
      <div className="bracket-mobile-list" aria-label={t?.bracket.fallback ?? 'Text bracket fallback'}>
        <ol className="space-y-2 text-sm text-[#A8B4C8]">{teams.slice(0, 8).map((team, i) => <li key={team.team_id} className="rounded-lg border border-[#1E2A44] bg-[#13203A] p-3"><span className="font-mono text-[#E6EDF7]">{t?.bracket.roundSlot ?? 'Round slot'} {i + 1}</span> · {team.team_id.replaceAll('_', ' ')} · {t?.common.advance ?? 'advance'} {(team.advance_probability * 100).toFixed(1)}% · {t?.common.champion ?? 'champion'} {(team.champion_probability * 100).toFixed(1)}%</li>)}</ol>
      </div>
      <table className="sr-only"><caption>{t?.bracket.fallback ?? 'Bracket text fallback'}</caption><thead><tr><th scope="col">{t?.common.team ?? 'Team'}</th><th scope="col">{t?.common.advance ?? 'Advance'}</th><th scope="col">{t?.common.champion ?? 'Champion'}</th></tr></thead><tbody>{teams.map(team => <tr key={team.team_id}><th scope="row">{team.team_id}</th><td>{team.advance_probability}</td><td>{team.champion_probability}</td></tr>)}</tbody></table>
      <p className="mt-3 text-sm text-[#A8B4C8]">{t?.bracket.mostLikely ?? 'Most likely champion: '}<b className="font-mono text-[#22D3EE]">{champion.team_id}</b>. {t?.bracket.note ?? 'This is a baseline progression view from static Monte Carlo outputs.'}</p>
    </section>
  );
}
