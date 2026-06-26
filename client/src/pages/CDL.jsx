import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import MetaTags from '../components/MetaTags';
import { CDL_TEAMS } from '../data/teamsData';
import styles from './CDL.module.css';

const FILTERS = [
  { label: 'Tout',       value: '' },
  { label: 'Résultats',  value: 'resultats' },
  { label: 'Standings',  value: 'standings' },
  { label: 'Meta',       value: 'meta' },
  { label: 'Agenda',     value: 'agenda' },
];

// ── Standings CDL 2026 — post Major 3 (juin 2026) ──────────
// gw = map wins, gl = map losses
const CDL_STANDINGS_2026 = [
  { rank: 1,  slug: 'faze-vegas',            name: 'FaZe Vegas',            wins: 18, losses: 4,  gw: 58, gl: 22, pts: 250, qualified: true  },
  { rank: 2,  slug: 'optic-texas',           name: 'OpTic Texas',           wins: 16, losses: 6,  gw: 52, gl: 24, pts: 215, qualified: true  },
  { rank: 3,  slug: 'riyadh-falcons',        name: 'Riyadh Falcons',        wins: 15, losses: 7,  gw: 48, gl: 28, pts: 195, qualified: true  },
  { rank: 4,  slug: 'la-thieves',            name: 'LA Thieves',            wins: 14, losses: 8,  gw: 44, gl: 30, pts: 172, qualified: true  },
  { rank: 5,  slug: 'miami-heretics',        name: 'Miami Heretics',        wins: 12, losses: 10, gw: 40, gl: 34, pts: 148, qualified: true  },
  { rank: 6,  slug: 'paris-gentle-mates',    name: 'Paris Gentle Mates',    wins: 11, losses: 11, gw: 37, gl: 36, pts: 135, qualified: true  },
  { rank: 7,  slug: 'toronto-koi',           name: 'Toronto KOI',           wins: 10, losses: 12, gw: 35, gl: 38, pts: 118, qualified: true  },
  { rank: 8,  slug: 'boston-breach',         name: 'Boston Breach',         wins: 9,  losses: 13, gw: 31, gl: 40, pts: 102, qualified: true  },
  { rank: 9,  slug: 'g2-minnesota',          name: 'G2 Minnesota',          wins: 7,  losses: 15, gw: 25, gl: 46, pts: 88,  qualified: false },
  { rank: 10, slug: 'cloud9-new-york',       name: 'Cloud9 New York',       wins: 6,  losses: 16, gw: 22, gl: 49, pts: 75,  qualified: false },
  { rank: 11, slug: 'vancouver-surge',       name: 'Vancouver Surge',       wins: 5,  losses: 17, gw: 19, gl: 52, pts: 62,  qualified: false },
  { rank: 12, slug: 'carolina-royal-ravens', name: 'Carolina Royal Ravens', wins: 4,  losses: 18, gw: 16, gl: 55, pts: 50,  qualified: false },
];

// ── Résultats Major 3 (juin 2026) ──────────────────────────
const RECENT_MATCHES = [
  { teamA: 'FaZe Vegas',      teamB: 'Riyadh Falcons',   scoreA: 3, scoreB: 1, event: 'CDL Major 3 2026 — Finale',       date: '2026-06-14' },
  { teamA: 'Riyadh Falcons',  teamB: 'Miami Heretics',   scoreA: 3, scoreB: 2, event: 'CDL Major 3 2026 — Demi-finale',  date: '2026-06-13' },
  { teamA: 'LA Thieves',      teamB: 'OpTic Texas',      scoreA: 3, scoreB: 2, event: 'CDL Major 3 2026 — Demi-finale',  date: '2026-06-13' },
  { teamA: 'FaZe Vegas',      teamB: 'LA Thieves',       scoreA: 3, scoreB: 0, event: 'CDL Major 3 2026 — Demi Winners', date: '2026-06-13' },
  { teamA: 'OpTic Texas',     teamB: 'Paris Gentle Mates', scoreA: 3, scoreB: 1, event: 'CDL Major 3 2026 — QF',        date: '2026-06-12' },
];

// ── Agenda 2026 ─────────────────────────────────────────────
const UPCOMING = [
  { date: '2026-06-26', event: 'CDL Major 4 — Minor Bracket',  teams: 'G2 MN / C9 NY / Vancouver / Carolina',  status: 'upcoming' },
  { date: '2026-06-27', event: 'CDL Major 4 — Major Bracket',  teams: 'Top 8 + qualifiés',                     status: 'upcoming' },
  { date: '2026-06-28', event: 'CDL Major 4 — Finale',         teams: 'TBD vs TBD',                            status: 'upcoming' },
  { date: '2026-08-01', event: 'CDL Championships 2026',       teams: 'Top 8 qualifiés',                       status: 'tbd'      },
];

// Map slug → logo from teamsData
const TEAM_LOGO = Object.fromEntries(CDL_TEAMS.map(t => [t.slug, t.logo]));
const TEAM_COLOR = Object.fromEntries(CDL_TEAMS.map(t => [t.slug, t.primaryColor]));

const FALLBACK_ARTICLES = [
  { id: 'c1', slug: 'cdl-major-4-resultats', title: 'CDL Major 4 — Résultats complets et analyse', summary: "FaZe Vegas remporte le Major 4 face à OpTic Texas dans un match épique 3-2.", category: 'cdl', published_at: '2026-06-18', source_name: 'CodPulse' },
  { id: 'c2', slug: 'optic-texas-roster-2026', title: 'OpTic Texas présente son roster complet 2026', summary: "L'organisation texane aligne un roster remanié avec l'arrivée d'un talent européen.", category: 'cdl', published_at: '2026-06-12', source_name: 'CodPulse' },
  { id: 'c3', slug: 'cdl-standings-saison-4', title: 'CDL Standings mi-saison : FaZe Vegas en tête', summary: "Panorama des classements à mi-parcours de la saison 4 avec analyse des équipes.", category: 'cdl', published_at: '2026-06-08', source_name: 'CodPulse' },
  { id: 'c4', slug: 'cdl-championships-2026-format', title: 'CDL Championships 2026 : format et qualifications annoncés', summary: "Activision dévoile le format du tournoi final de la saison, prévu en août à Las Vegas.", category: 'cdl', published_at: '2026-06-01', source_name: 'CodPulse' },
];

export default function CDL() {
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);

  const { articles, meta, loading } = useArticles({
    category: 'cdl',
    page,
    limit: 8,
    tag: activeFilter || undefined,
  });

  const displayedArticles = (!loading && articles.length === 0) ? FALLBACK_ARTICLES : articles;
  const [featured, ...rest] = displayedArticles;

  return (
    <>
      <MetaTags
        title="Call of Duty League 2026 — CDL"
        description="Standings CDL 2026, résultats Major 3, agenda Major 4 et actualités de la Call of Duty League — Black Ops 7."
      />

      <main>
        <div className={`${styles.pageHeader} ${styles.header}`}>
          <div className="container">
            <div className={styles.pageHeaderInner}>
              <div>
                <span className="cat-tag cat-tag--cdl">CDL 2026</span>
                <h1 className={`${styles.pageTitle} ${styles.title}`}>League</h1>
                <p className={styles.pageDesc}>
                  Standings, résultats, agenda — Call of Duty League 2026 sur Black Ops 7.
                </p>
              </div>
              <div className={styles.pageNumber}>
                {meta?.total ? `${meta.total} articles` : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.layout}>
            {/* ── Colonne principale ── */}
            <div className={styles.main}>
              <nav className={styles.filters} aria-label="Filtres CDL">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterBtnActiveCDL : ''} ${activeFilter === f.value ? styles.filterBtnActive : ''}`}
                    onClick={() => { setActiveFilter(f.value); setPage(1); }}
                    aria-pressed={activeFilter === f.value}
                  >
                    {f.label}
                  </button>
                ))}
              </nav>

              {!loading && featured && <ArticleCard article={featured} variant="featured" />}
              {!loading && rest.map(a => <ArticleCard key={a.id} article={a} />)}

              {loading && (
                <div className={styles.loading}>
                  {Array.from({ length: 4 }, (_, i) => <div key={i} className={styles.skeletonRow} />)}
                </div>
              )}

              {meta && meta.totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Pagination">
                  <button className={styles.pageBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>PREV</button>
                  <span className={styles.pageInfo}>{page} / {meta.totalPages}</span>
                  <button className={styles.pageBtn} onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}>NEXT</button>
                </nav>
              )}
            </div>

            {/* ── Sidebar ── */}
            <aside className={styles.sidebar} aria-label="Standings et agenda CDL 2026">

              {/* ── STANDINGS ── */}
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitleRow}>
                  <h2 className={styles.sidebarTitle}>STANDINGS 2026</h2>
                  <span className={styles.sidebarSub}>Post Major 3 · Juin 2026</span>
                </div>

                <div className={styles.standingsQualLabel}>
                  <span className={styles.qualDot} /> TOP 8 QUALIFIÉS CDL CHAMPS
                </div>

                <table className={`${styles.standingsTable} ${styles.standingsTableFull}`}>
                  <caption className="sr-only">Classement CDL 2026</caption>
                  <thead>
                    <tr>
                      <th className={styles.thRank}>#</th>
                      <th className={styles.thTeam}>Équipe</th>
                      <th className={styles.thStat} title="Match Wins">MW</th>
                      <th className={styles.thStat} title="Match Losses">ML</th>
                      <th className={styles.thStat} title="Win Rate">W%</th>
                      <th className={styles.thStat} title="Map Wins">GW</th>
                      <th className={styles.thStat} title="Map Losses">GL</th>
                      <th className={styles.thPts}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CDL_STANDINGS_2026.map(t => {
                      const winPct = Math.round((t.wins / (t.wins + t.losses)) * 100);
                      return (
                        <tr
                          key={t.rank}
                          className={`${styles.standingRow} ${t.qualified ? styles.standingQualified : styles.standingElim}`}
                        >
                          <td className={styles.rankCell}>{t.rank}</td>
                          <td>
                            <Link to={`/teams/${t.slug}`} className={styles.teamCell}>
                              <img
                                src={TEAM_LOGO[t.slug]}
                                alt={t.name}
                                className={styles.teamLogo}
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                              <span
                                className={styles.teamName}
                                style={{ '--team-color': TEAM_COLOR[t.slug] }}
                              >
                                {t.name}
                              </span>
                            </Link>
                          </td>
                          <td className={styles.statCell}>{t.wins}</td>
                          <td className={styles.statCellDim}>{t.losses}</td>
                          <td className={styles.statCellPct}>{winPct}%</td>
                          <td className={styles.statCell}>{t.gw}</td>
                          <td className={styles.statCellDim}>{t.gl}</td>
                          <td className={styles.pts}>{t.pts}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── DERNIERS MATCHS ── */}
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitleRow}>
                  <h2 className={styles.sidebarTitle}>DERNIERS MATCHS</h2>
                  <span className={styles.sidebarSub}>Major 3 · Juin 2026</span>
                </div>

                {RECENT_MATCHES.map((m, i) => (
                  <div key={i} className={styles.matchItem}>
                    <span className={styles.matchEvent}>{m.event}</span>
                    <div className={styles.matchRow}>
                      <span className={`${styles.matchTeam} ${m.scoreA > m.scoreB ? styles.matchWinner : ''}`}>{m.teamA}</span>
                      <span className={styles.matchScore}>{m.scoreA} — {m.scoreB}</span>
                      <span className={`${styles.matchTeam} ${styles.matchTeamRight} ${m.scoreB > m.scoreA ? styles.matchWinner : ''}`}>{m.teamB}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── AGENDA ── */}
              <div className={styles.sidebarSection}>
                <div className={styles.sidebarTitleRow}>
                  <h2 className={styles.sidebarTitle}>AGENDA</h2>
                  <span className={styles.sidebarSub}>Saison 2026</span>
                </div>

                {UPCOMING.map((e, i) => (
                  <div key={i} className={styles.agendaItem}>
                    <div className={styles.agendaDate}>
                      <span className={styles.agendaDay}>
                        {new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </span>
                      <span className={`${styles.agendaStatus} ${e.status === 'tbd' ? styles.agendaTBD : styles.agendaUpcoming}`}>
                        {e.status === 'tbd' ? 'TBD' : 'A VENIR'}
                      </span>
                    </div>
                    <div className={styles.agendaInfo}>
                      <strong className={styles.agendaEvent}>{e.event}</strong>
                      <span className={styles.agendaTeams}>{e.teams}</span>
                    </div>
                  </div>
                ))}
              </div>

            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
