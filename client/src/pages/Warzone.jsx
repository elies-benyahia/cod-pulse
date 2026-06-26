import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/api';
import ArticleCard from '../components/ArticleCard';
import MetaTags from '../components/MetaTags';
import { WARZONE_TEAMS } from '../data/teamsData';
import styles from './Warzone.module.css';

const FILTERS = [
  { label: 'Tout', value: '' },
  { label: 'Tournois', value: 'tournoi' },
  { label: 'Méta', value: 'meta' },
  { label: 'Roster', value: 'roster' },
  { label: 'Patch', value: 'patch' }
];

// WRS 2026 standings — post Atlanta Finals (juin 2026)
const WRS_STANDINGS = [
  { rank: 1, slug: 'team-vitality-wz',   name: 'Team Vitality',    region: 'EU',   pts: 260,   color: '#FFDE00' },
  { rank: 2, slug: 'team-falcons-wz',    name: 'Team Falcons',     region: 'MENA', pts: 205.8, color: '#00A3FF' },
  { rank: 3, slug: 'geng-wz',            name: 'Gen.G',            region: 'NA',   pts: 188,   color: '#C89B3C' },
  { rank: 4, slug: 'for-fun-wz',         name: 'For Fun Esports',  region: 'NA',   pts: 172,   color: '#FF4500' },
  { rank: 5, slug: 'fnatic-wz',          name: 'Fnatic',           region: 'EU',   pts: 155,   color: '#FF6600' },
  { rank: 6, slug: 'twisted-minds-wz',   name: 'Twisted Minds',    region: 'MENA', pts: 138,   color: '#00C8FF' },
  { rank: 7, slug: 'gentle-mates-wz',    name: 'Gentle Mates',     region: 'EU',   pts: 120,   color: '#5DADE2' },
  { rank: 8, slug: 't1-wz',              name: 'T1',               region: 'ASIA', pts: 104,   color: '#CC0000' },
];

export default function Warzone() {
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);

  const { articles, meta, loading } = useArticles({
    category: 'warzone',
    page,
    limit: 8,
    tag: activeFilter || undefined
  });

  const [featured, ...rest] = articles;

  return (
    <>
      <MetaTags
        title="Warzone Compétitif — WRS 2026"
        description="Actualités Warzone : WRS 2026 standings, tournois, méta, patch notes et analyses compétitives."
      />

      <main>
        {/* En-tête de section */}
        <div className={`${styles.pageHeader} ${styles.header}`}>
          <div className="container">
            <div className={styles.pageHeaderInner}>
              <div>
                <span className="cat-tag cat-tag--warzone">WARZONE</span>
                <h1 className={styles.pageTitle}>Compétitif</h1>
                <p className={styles.pageDesc}>
                  WRS 2026, méta, roster moves, patch notes — tout ce qui compte dans Warzone compétitif.
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
            {/* Contenu principal */}
            <div className={styles.main}>
              <nav className={styles.filters} aria-label="Filtres articles">
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterBtnActive : ''}`}
                    onClick={() => { setActiveFilter(f.value); setPage(1); }}
                    aria-pressed={activeFilter === f.value}
                  >
                    {f.label}
                  </button>
                ))}
              </nav>

              {!loading && featured && (
                <ArticleCard article={featured} variant="featured" />
              )}

              {!loading && rest.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}

              {loading && (
                <div className={styles.loading} aria-label="Chargement">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className={styles.skeletonRow} />
                  ))}
                </div>
              )}

              {meta && meta.totalPages > 1 && (
                <nav className={styles.pagination} aria-label="Pagination">
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >← PREV</button>
                  <span className={styles.pageInfo}>{page} / {meta.totalPages}</span>
                  <button
                    className={styles.pageBtn}
                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                  >NEXT →</button>
                </nav>
              )}
            </div>

            {/* Sidebar — WRS 2026 standings */}
            <aside className={styles.sidebar} aria-label="Classement WRS 2026">
              <div className={styles.sidebarSection}>
                <h2 className={styles.sidebarTitle}>WRS 2026</h2>
                <p className={styles.standingsSubtitle}>Warzone Resurgence Series · Points</p>
                <table className={styles.standingsTable}>
                  <caption className="sr-only">Classement WRS 2026</caption>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Équipe</th>
                      <th>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WRS_STANDINGS.map(team => (
                      <tr key={team.rank}>
                        <td className={styles.rank}>{team.rank}</td>
                        <td>
                          <Link to={`/teams/${team.slug}`} style={{ color: team.color, fontWeight: 600 }}>
                            {team.name}
                          </Link>
                          <span className={styles.region}>{team.region}</span>
                        </td>
                        <td className={styles.win} style={{ color: team.color }}>{team.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
