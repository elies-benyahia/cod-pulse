import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useArticles } from '../hooks/api';
import MetaTags from '../components/MetaTags';
import styles from './Home.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CDL_STANDINGS = [
  { rank: 1, name: 'FaZe Vegas',        pts: 250, color: '#AA0000' },
  { rank: 2, name: 'OpTic Texas',        pts: 215, color: '#92C74B' },
  { rank: 3, name: 'Riyadh Falcons',     pts: 195, color: '#00A3FF' },
  { rank: 4, name: 'LA Thieves',         pts: 172, color: '#FF3A1A' },
  { rank: 5, name: 'Miami Heretics',     pts: 148, color: '#00C4B4' },
  { rank: 6, name: 'Paris Gentle Mates', pts: 135, color: '#5DADE2' },
];

const WRS_STANDINGS = [
  { rank: 1, name: 'Team Vitality',   pts: 260,   color: '#FFDE00' },
  { rank: 2, name: 'Team Falcons',    pts: 205.8, color: '#00A3FF' },
  { rank: 3, name: 'Gen.G',           pts: 188,   color: '#C89B3C' },
  { rank: 4, name: 'For Fun Esports', pts: 172,   color: '#FF4500' },
  { rank: 5, name: 'Fnatic',          pts: 155,   color: '#FF6600' },
];

const UPCOMING = [
  { date: '26.06', event: 'CDL Major 4 — Minor Bracket',  where: 'Birmingham' },
  { date: '28.06', event: 'CDL Major 4 — Finals',         where: 'Birmingham' },
  { date: '01.08', event: 'CDL Championships 2026',       where: 'TBD' },
];

export default function Home() {
  const { articles: wz,  loading: wzLoading  } = useArticles({ category: 'warzone', limit: 4 });
  const { articles: cdl, loading: cdlLoading } = useArticles({ category: 'cdl',     limit: 4 });
  const [ticker, setTicker] = useState([]);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroO = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    fetch(`${API}/api/ranked?mode=warzone&limit=25`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setTicker(d.data); })
      .catch(() => {});
  }, []);

  return (
    <>
      <MetaTags title="CoD Pulse — Warzone & CDL 2026" description="Actualités, standings et analyses — Warzone compétitif & Call of Duty League 2026." />

      {/* ══ HERO TYPOGRAPHIQUE ═══════════════════════════════════ */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div className={styles.heroInner} style={{ y: heroY, opacity: heroO }}>
          <div className={styles.heroMeta}>
            <span>BO7 · SAISON 4</span>
            <span className={styles.heroDivider} />
            <span>2026</span>
          </div>

          <div style={{width:'100%',height:'1px',background:'var(--border)',margin:'0 0 2rem'}} />

          <h1 className={styles.heroTitle}>
            <span className={styles.heroLine}>WARZONE</span>
            <span className={styles.heroLineAlt}>
              <span className={styles.heroCross}>×</span>CDL
            </span>
          </h1>

          <div className={styles.heroBottom}>
            <p className={styles.heroDesc}>
              Actualités · Standings · Meta · Top 250
            </p>
            <div className={styles.heroCtas}>
              <Link to="/warzone" className={styles.heroLink}>Warzone →</Link>
              <Link to="/cdl"     className={styles.heroLink}>CDL →</Link>
            </div>
          </div>
        </motion.div>

        {/* Numéro décoratif */}
        <span className={styles.heroNumber} aria-hidden="true">04</span>
      </section>

      {/* ══ TICKER TOP 250 ═══════════════════════════════════════ */}
      {ticker.length > 0 && (
        <div className={styles.ticker} aria-label="Top 250 Warzone">
          <span className={styles.tickerLabel}>TOP 250</span>
          <div className={styles.tickerTrack}>
            <motion.div
              className={styles.tickerInner}
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
            >
              {[...ticker, ...ticker].map((p, i) => (
                <span key={i} className={styles.tickerItem}>
                  <span className={styles.tickerRank}>#{p.rank}</span>
                  <span className={styles.tickerName}>{p.gamertag}</span>
                  <span className={styles.tickerSr}>{(p.sr ?? 0).toLocaleString('fr-FR')}</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* ══ STANDINGS ════════════════════════════════════════════ */}
      <section className={styles.standings}>
        <div className={styles.standingsGrid}>

          <div className={styles.standingsCol}>
            <header className={styles.colHead}>
              <span className={styles.colTag}>CDL 2026</span>
              <h2 className={styles.colTitle}>STANDINGS</h2>
              <Link to="/cdl" className={styles.colMore}>Tout voir →</Link>
            </header>
            {CDL_STANDINGS.map((t, i) => (
              <div key={t.name} className={styles.standRow}>
                <span className={styles.standNum}>{String(t.rank).padStart(2, '0')}</span>
                <span className={styles.standName} style={{ '--tc': t.color }}>{t.name}</span>
                <span className={styles.standPts}>{t.pts} <small>PTS</small></span>
              </div>
            ))}
          </div>

          <div className={styles.standingsDivider} />

          <div className={styles.standingsCol}>
            <header className={styles.colHead}>
              <span className={styles.colTag} style={{ color: 'var(--accent)' }}>WRS 2026</span>
              <h2 className={styles.colTitle}>CLASSEMENT</h2>
              <Link to="/warzone" className={styles.colMore}>Tout voir →</Link>
            </header>
            {WRS_STANDINGS.map((t, i) => (
              <div key={t.name} className={styles.standRow}>
                <span className={styles.standNum}>{String(t.rank).padStart(2, '0')}</span>
                <span className={styles.standName} style={{ '--tc': t.color }}>{t.name}</span>
                <span className={styles.standPts}>{t.pts} <small>PTS</small></span>
              </div>
            ))}
          </div>

          <div className={styles.standingsDivider} />

          <div className={styles.standingsCol}>
            <header className={styles.colHead}>
              <span className={styles.colTag}>AGENDA</span>
              <h2 className={styles.colTitle}>PROCHAINS</h2>
            </header>
            {UPCOMING.map((u, i) => (
              <div key={i} className={styles.upcomingRow}>
                <span className={styles.upcomingDate}>{u.date}</span>
                <div className={styles.upcomingInfo}>
                  <span className={styles.upcomingEvent}>{u.event}</span>
                  <span className={styles.upcomingWhere}>{u.where}</span>
                </div>
              </div>
            ))}

            <div className={styles.resultBlock}>
              <span className={styles.resultTag}>DERNIER RÉSULTAT</span>
              <div className={styles.resultScore}>
                <span style={{ color: '#AA0000' }}>FaZe Vegas</span>
                <span className={styles.resultScoreNum}>3 — 1</span>
                <span style={{ color: '#00A3FF' }}>Riyadh Falcons</span>
              </div>
              <span className={styles.resultEvent}>CDL Major 3 · Finale · 14 juin</span>
            </div>
          </div>

        </div>
      </section>

      {/* ══ ACTUALITÉS ═══════════════════════════════════════════ */}
      <section className={styles.news}>
        <div className={styles.newsGrid}>

          <div className={styles.newsCol}>
            <header className={styles.newsColHead}>
              <div className={styles.newsBar} />
              <span className={styles.newsTag}>WARZONE</span>
              <Link to="/warzone" className={styles.newsMore}>Tout →</Link>
            </header>
            <div className={styles.newsList}>
              {wzLoading
                ? Array.from({ length: 3 }, (_, i) => <div key={i} className={styles.skeleton} style={{ height: i === 0 ? 80 : 52 }} />)
                : wz.map((a, i) => <ArticleRow key={a.id} article={a} big={i === 0} />)
              }
            </div>
          </div>

          <div className={styles.newsDivider} />

          <div className={styles.newsCol}>
            <header className={styles.newsColHead}>
              <div className={styles.newsBar} style={{ background: 'var(--accent-cdl)' }} />
              <span className={styles.newsTag} style={{ color: 'var(--accent-cdl)' }}>CDL</span>
              <Link to="/cdl" className={styles.newsMore}>Tout →</Link>
            </header>
            <div className={styles.newsList}>
              {cdlLoading
                ? Array.from({ length: 3 }, (_, i) => <div key={i} className={styles.skeleton} style={{ height: i === 0 ? 80 : 52 }} />)
                : cdl.map((a, i) => <ArticleRow key={a.id} article={a} big={i === 0} />)
              }
            </div>
          </div>

        </div>
      </section>

      {/* ══ CTA NAVIGATION ═══════════════════════════════════════ */}
      <nav className={styles.ctaRow} aria-label="Navigation rapide">
        {[
          { to: '/teams',  label: 'ÉQUIPES',    sub: 'Rosters CDL & WZ' },
          { to: '/meta',   label: 'META',        sub: 'Top armes Saison 4' },
          { to: '/ranked', label: 'TOP 250',     sub: 'Classement BR' },
          { to: '/quiz',   label: 'QUIZ',        sub: 'Teste tes connaissances' },
          { to: '/live',   label: 'LIVE',        sub: 'Joueurs en stream', live: true },
        ].map(({ to, label, sub, live }) => (
          <Link key={to} to={to} className={styles.ctaCard}>
            {live && <span className={styles.liveDot} />}
            <span className={styles.ctaLabel}>{label}</span>
            <span className={styles.ctaSub}>{sub}</span>
            <span className={styles.ctaArrow}>→</span>
          </Link>
        ))}
      </nav>

    </>
  );
}

function ArticleRow({ article, big }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    : '';
  return (
    <Link to={`/article/${article.slug}`} className={`${styles.articleRow} ${big ? styles.articleRowBig : ''}`}>
      <div className={styles.articleRowMeta}>
        <span className={styles.articleDate}>{date}</span>
        {article.source_name && <span className={styles.articleSource}>{article.source_name}</span>}
      </div>
      <span className={styles.articleTitle}>{article.title}</span>
    </Link>
  );
}
