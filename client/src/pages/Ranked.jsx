import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { useRanked } from '../hooks/api';
import styles from './Ranked.module.css';

// Couleurs fixes par org
const TEAM_COLORS = {
  'Team Vitality':     '#FFDE00',
  'Team Falcons':      '#00A3FF',
  'Gen.G':             '#C89B3C',
  'Fun Esports':       '#FF6B00',
  'FaZe Clan':         '#CC0000',
  'FaZe Vegas':        '#CC0000',
  'Twisted Minds':     '#00C8FF',
  'M8':                '#0055A4',
  'Sentinels':         '#FF0040',
  'OpTic Texas':       '#92CF00',
  'Riyadh Falcons':    '#2AC6E3',
  'LA Thieves':        '#FF0A0A',
  'G2 Minnesota':      '#FF2020',
  'Toronto KOI':       '#8B5CF6',
  'Miami Heretics':    '#06B6D4',
  'Boston Breach':     '#F59E0B',
  'Carolina Ravens':   '#7C3AED',
  'Vancouver Surge':   '#3B82F6',
  'Cloud9 NY':         '#1E90FF',
  'Paris GM':          '#EF4444',
};

function rankClass(rank) {
  if (rank <= 3)   return styles.gold;
  if (rank <= 10)  return styles.top10;
  if (rank <= 50)  return styles.silver;
  return styles.rest;
}

function rankMedal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function ChangeIndicator({ val }) {
  if (!val || val === 0) return <span className={`${styles.change} ${styles.changeFlat}`}>—</span>;
  if (val > 0) return <span className={`${styles.change} ${styles.changeUp}`}>▲{val}</span>;
  return <span className={`${styles.change} ${styles.changeDown}`}>▼{Math.abs(val)}</span>;
}

function TableRow({ entry, maxSR }) {
  const pct = Math.min(100, (entry.sr / maxSR) * 100);
  const teamColor = TEAM_COLORS[entry.team] || 'var(--accent)';
  const hasTeam = entry.team && entry.team !== '-';

  return (
    <tr>
      {/* Rang */}
      <td>
        <div className={styles.rankCell}>
          <span className={`${styles.rankNum} ${rankClass(entry.rank)}`}>
            {entry.rank}
          </span>
          {rankMedal(entry.rank)
            ? <span className={styles.rankMedal}>{rankMedal(entry.rank)}</span>
            : <ChangeIndicator val={entry.change} />
          }
        </div>
      </td>

      {/* Joueur */}
      <td>
        <div className={styles.playerCell}>
          <div className={styles.playerAvatar}>
            {entry.player.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={styles.playerName}>{entry.player}</div>
            <div className={styles.playerCountry}>{entry.country || ''}</div>
          </div>
        </div>
      </td>

      {/* Équipe */}
      <td>
        {hasTeam
          ? (
            <span
              className={styles.teamBadge}
              style={{ color: teamColor }}
            >
              <span className={styles.teamDot} style={{ background: teamColor }} />
              {entry.team}
            </span>
          )
          : <span className={styles.noTeam}>—</span>
        }
      </td>

      {/* Région */}
      <td>
        <span className={styles.regionTag}>{entry.region}</span>
      </td>

      {/* Platform */}
      <td className={styles.platform}>{entry.platform}</td>

      {/* SR */}
      <td className={styles.srCell}>
        <span className={styles.srValue}>{entry.sr.toLocaleString()}</span>
        <div className={styles.srBar}>
          <div className={styles.srFill} style={{ width: `${pct}%` }} />
        </div>
      </td>

      {/* Tier */}
      <td>
        <span className={`${styles.tier} ${styles.tierTop250}`}>TOP 250</span>
      </td>
    </tr>
  );
}

export default function Ranked() {
  const [mode, setMode] = useState('warzone');
  const [search, setSearch] = useState('');

  const { entries, meta, loading, error, refresh, lastRefresh } = useRanked(mode);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(e =>
      e.player.toLowerCase().includes(q) ||
      (e.team && e.team.toLowerCase().includes(q)) ||
      (e.country && e.country.toLowerCase().includes(q))
    );
  }, [entries, search]);

  const maxSR = useMemo(() => entries.reduce((m, e) => Math.max(m, e.sr), 0), [entries]);

  return (
    <>
      <MetaTags
        title="Top 250 Ranked — Warzone & CoD MP — CoD Pulse"
        description="Classement Top 250 Warzone Ranked et CoD MP Ranked, mis à jour en juin 2026. Pros, semi-pros et streamers compétitifs."
      />

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className="container">
          <span className={styles.headerTag}>CLASSEMENT COMPÉTITIF</span>
          <h1 className={styles.headerTitle}>
            TOP <span>250</span>
          </h1>
          <p className={styles.headerDesc}>
            {mode === 'warzone' ? 'Warzone Ranked — Juin 2026' : 'CoD MP Ranked — Juin 2026'}
            {' · '}Black Ops 7
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="container">
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'warzone' ? styles.tabActive : ''}`}
            onClick={() => { setMode('warzone'); setSearch(''); }}
          >
            WARZONE RANKED
          </button>
          <button
            className={`${styles.tab} ${mode === 'mp' ? styles.tabActive : ''}`}
            onClick={() => { setMode('mp'); setSearch(''); }}
          >
            MP RANKED
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            type="search"
            placeholder="Rechercher joueur, team, pays…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Rechercher dans le classement"
          />

          <div className={styles.meta}>
            {meta?.live
              ? (
                <span className={styles.liveTag}>
                  <span className={styles.liveDot} />
                  LIVE
                </span>
              )
              : <span className={styles.staticTag}>STATIQUE · 19/06/2026</span>
            }

            {lastRefresh && (
              <span className={styles.metaLabel}>
                Actualisé {lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}

            <button className={styles.refreshBtn} onClick={refresh} disabled={loading}>
              ↻ Actualiser
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.empty}>
            Erreur de chargement — {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>Aucun résultat pour « {search} »</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ minWidth: 96 }}>#</th>
                  <th>JOUEUR</th>
                  <th>ÉQUIPE</th>
                  <th>RÉGION</th>
                  <th className={styles.center}>PLATEFORME</th>
                  <th className={styles.right}>SR</th>
                  <th>TIER</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <TableRow key={`${entry.rank}-${entry.player}`} entry={entry} maxSR={maxSR} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Source note ── */}
        {!loading && !error && (
          <div className={styles.sourceNote}>
            <span className={styles.sourceText}>
              Source : {meta?.source || 'Données compétitives 2026'}
              {meta?.note && ` — ${meta.note}`}
            </span>
            <span className={styles.sourceText}>
              {filtered.length} joueurs affichés sur {entries.length}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
