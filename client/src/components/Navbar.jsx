import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Navbar.module.css';

// ── MatchTicker data (inlined) ──────────────────────────────────────────────
const TICKER_ITEMS = [
  { id: 1,  t1: 'OpTic Texas',    t1Score: 3,    t2: 'LA Thieves',      t2Score: 1,    event: 'CDL Major 1 — Finale',          status: 'done',     t1Win: true  },
  { id: 2,  t1: 'Boston Breach',  t1Score: 3,    t2: 'FaZe Vegas',      t2Score: 2,    event: 'CDL Major 1 — SF',              status: 'done',     t1Win: true  },
  { id: 3,  t1: 'LA Thieves',     t1Score: 3,    t2: 'Miami Heretics',  t2Score: 0,    event: 'CDL Major 1 — QF',              status: 'done',     t1Win: true  },
  { id: 4,  t1: 'Vancouver Surge',t1Score: 2,    t2: 'G2 Minnesota',    t2Score: 3,    event: 'CDL Major 1 — QF',              status: 'done',     t1Win: false },
  { id: 5,  t1: 'Team Vitality',  t1Score: null, t2: null,              t2Score: null, event: 'WRS 2026 — Leader (260 pts)',   status: 'wrs',      t1Win: true  },
  { id: 6,  t1: 'Team Falcons',   t1Score: null, t2: null,              t2Score: null, event: 'WRS Atlanta — Vainqueur Mai 2026', status: 'wrs',   t1Win: true  },
  { id: 7,  t1: 'Miami Heretics', t1Score: 3,    t2: 'Toronto KOI',     t2Score: 1,    event: 'CDL Major 2 — Finale',          status: 'done',     t1Win: true  },
  { id: 8,  t1: 'OpTic Texas',    t1Score: 3,    t2: 'Riyadh Falcons',  t2Score: 0,    event: 'CDL Major 2 — SF',              status: 'done',     t1Win: true  },
  { id: 9,  t1: 'OpTic Texas',    t1Score: null, t2: 'Miami Heretics',  t2Score: null, event: 'CDL Major 3 — 12 Jul',          status: 'upcoming', t1Win: null  },
  { id: 10, t1: 'FaZe Vegas',     t1Score: null, t2: 'G2 Minnesota',    t2Score: null, event: 'CDL Major 3 — 12 Jul',          status: 'upcoming', t1Win: null  },
  { id: 11, t1: 'Boston Breach',  t1Score: null, t2: 'LA Thieves',      t2Score: null, event: 'CDL Major 3 — 13 Jul',          status: 'upcoming', t1Win: null  },
];

function TickerItem({ item }) {
  if (item.status === 'wrs') {
    return (
      <span className={styles.tickerItem}>
        <span className={styles.tickerTeam}>{item.t1}</span>
        <span className={styles.tickerTag}>WRS</span>
        <span className={styles.tickerEvent}>{item.event}</span>
      </span>
    );
  }

  if (item.status === 'upcoming') {
    return (
      <span className={styles.tickerItem}>
        <span className={styles.tickerUpcoming}>À VENIR</span>
        <span className={styles.tickerTeam}>{item.t1}</span>
        <span className={styles.tickerVs}>VS</span>
        <span className={styles.tickerTeam}>{item.t2}</span>
        <span className={styles.tickerEvent}>{item.event}</span>
      </span>
    );
  }

  return (
    <span className={styles.tickerItem}>
      <span className={`${styles.tickerTeam} ${item.t1Win ? styles.tickerWinner : styles.tickerLoser}`}>{item.t1}</span>
      <span className={`${styles.tickerScore} ${item.t1Win ? styles.tickerScoreWin : ''}`}>{item.t1Score}</span>
      <span className={styles.tickerDash}>–</span>
      <span className={`${styles.tickerScore} ${!item.t1Win ? styles.tickerScoreWin : ''}`}>{item.t2Score}</span>
      <span className={`${styles.tickerTeam} ${!item.t1Win ? styles.tickerWinner : styles.tickerLoser}`}>{item.t2}</span>
      <span className={styles.tickerEvent}>{item.event}</span>
    </span>
  );
}

// ── Nav items ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/warzone', label: 'WARZONE' },
  { to: '/cdl',     label: 'CDL'     },
  { to: '/teams',   label: 'ÉQUIPES' },
  { to: '/map',     label: 'CARTE'   },
  { to: '/meta',    label: 'META'    },
  { to: '/ranked',  label: 'TOP 250' },
  { to: '/live',    label: 'LIVE',   isLive: true },
  { to: '/quiz',    label: 'QUIZ'    },
];

const THEME_ICONS = { dark: '◑', medium: '◐', light: '○' };

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, cycle } = useTheme();
  const { lang, toggle, t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <div className={styles.inner}>

        <Link to="/" className={styles.logo} aria-label="COD PULSE — Accueil">
          <img
            src="/cod-pulse-logo.png"
            alt="CoD Pulse"
            className={styles.logoImg}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span className={styles.logoText} style={{ display: 'none' }}>
            COD <span className={styles.logoAccent}>PULSE</span>
          </span>
        </Link>

        <nav className={styles.nav} role="navigation" aria-label="Navigation principale">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navActive : ''}`
              }
            >
              {item.isLive && <span className={styles.liveDot} aria-hidden="true" />}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.controls}>
          <button
            className={styles.themeBtn}
            onClick={cycle}
            aria-label={`Thème : ${theme}`}
            title={`Thème : ${theme}`}
          >
            <span className={styles.themeIcon}>{THEME_ICONS[theme]}</span>
            <span className={styles.themeName}>
              {THEMES.find(th => th.id === theme)?.label?.[lang] || theme}
            </span>
          </button>

          <button
            className={styles.langBtn}
            onClick={toggle}
            aria-label={`Langue : ${lang.toUpperCase()}`}
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${styles.adminLink} ${isActive ? styles.adminActive : ''}`
            }
          >
            {t('nav_admin')}
          </NavLink>
        </div>
      </div>

      {/* MatchTicker inlined */}
      <div className={styles.ticker} aria-label="Résultats CDL & WRS" role="marquee">
        <span className={styles.tickerLabel}>RÉSULTATS</span>
        <div className={styles.tickerTrack}>
          <div className={styles.tickerRail}>
            {doubled.map((item, i) => (
              <TickerItem key={`${item.id}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
