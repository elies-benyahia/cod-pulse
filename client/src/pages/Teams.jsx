import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CDL_TEAMS, WARZONE_TEAMS } from '../data/teamsData';
import MetaTags from '../components/MetaTags';
import LogoLoop from '../components/LogoLoop';
import { useInView } from '../hooks/api';
import styles from './Teams.module.css';

const DESKTOP_COLS = 4;

// ── Card portrait 3/4 ─────────────────────────────────────────
function TeamCard({ team, isOpen, onClick, staggerDelay }) {
  return (
    <button
      className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}
      style={{ '--team-color': team.primaryColor, '--stagger-delay': `${staggerDelay}ms` }}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={`${team.name} — ${isOpen ? 'Fermer' : 'Voir le roster'}`}
    >
      {/* Top accent */}
      <div className={styles.cardTopBar} />

      {/* Blurred logo as background art */}
      <img
        src={team.logo}
        alt=""
        className={styles.logoBg}
        aria-hidden="true"
        onError={(e) => { e.target.style.display = 'none'; }}
      />

      {/* Color glow */}
      <div className={styles.cardGlow} />

      {/* Bottom gradient */}
      <div className={styles.cardOverlay} />

      {/* Main content */}
      <div className={styles.cardContent}>
        {/* Trophies badge */}
        {team.championships && team.championships.length > 0 && (
          <div className={styles.trophies}>
            <span className={styles.trophyIcon}>★</span>
            <span className={styles.trophyCount}>{team.championships.length}</span>
          </div>
        )}

        {/* Logo central */}
        <div className={styles.cardLogoWrap}>
          <img
            src={team.logo}
            alt={team.name}
            className={styles.cardLogo}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className={styles.cardLogoFallback} style={{ display: 'none' }}>
            {team.logoFallback}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.cardFooter}>
          {team.city && <span className={styles.cardCity}>{team.city}</span>}
          <h2 className={styles.cardName}>{team.name}</h2>
          <span className={styles.cardRosterCount}>
            {team.roster.length} joueur{team.roster.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Hover / open action */}
      <div className={styles.cardAction} aria-hidden="true">
        <span className={styles.cardActionLabel}>
          {isOpen ? '✕ FERMER' : 'VOIR ROSTER'}
        </span>
        {!isOpen && team.championships?.length > 0 && (
          <span className={styles.cardActionClose}>★ {team.championships.length} titre{team.championships.length > 1 ? 's' : ''}</span>
        )}
      </div>
    </button>
  );
}

// ── Roster Panel ──────────────────────────────────────────────
function RosterPanel({ team, onClose }) {
  return (
    <motion.div
      className={styles.rosterPanel}
      style={{ '--team-color': team.primaryColor }}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      aria-label={`Roster ${team.name}`}
    >
      {/* Splash background — logo flouté */}
      <div className={styles.rosterSplash} aria-hidden="true">
        <img src={team.logo} alt="" />
      </div>

      <div className={styles.rosterInner}>
        <div className={styles.rosterHeader}>
          <div className={styles.rosterHeaderLeft}>
            <img
              src={team.logo}
              alt={team.name}
              className={styles.rosterLogo}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <span className={styles.rosterTeamName} style={{ color: team.primaryColor }}>
                {team.name}
              </span>
              {team.city && (
                <span className={styles.rosterTeamCity}>{team.city}</span>
              )}
            </div>
          </div>
          <div className={styles.rosterHeaderRight}>
            <Link
              to={`/teams/${team.slug}`}
              className={styles.rosterProfileLink}
              style={{ '--team-color': team.primaryColor }}
            >
              Profil complet →
            </Link>
            <button className={styles.rosterClose} onClick={onClose} aria-label="Fermer">✕</button>
          </div>
        </div>

        <div className={styles.rosterPlayers}>
          {team.roster.map((player, i) => (
            <motion.div
              key={player.id}
              className={styles.playerSlot}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.playerPhotoWrap}>
                <div className={styles.playerPhoto}>
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.gamertag}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div
                    className={styles.playerInitial}
                    style={{ display: player.photo ? 'none' : 'flex', color: team.primaryColor }}
                  >
                    {player.gamertag.charAt(0)}
                  </div>
                </div>
                {/* Numéro watermark */}
                <span className={styles.playerNumber} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div className={styles.playerInfo}>
                <span className={styles.playerRole}>{player.role}</span>
                <span className={styles.playerGamertag}>{player.gamertag}</span>
                {player.realName && player.realName !== player.gamertag && (
                  <span className={styles.playerReal}>{player.realName}</span>
                )}
                {player.nationality && (
                  <span className={styles.playerNat}>{player.nationality}</span>
                )}
                {/* Réseaux sociaux */}
                <div className={styles.playerSocials}>
                  {player.twitter && (
                    <a
                      href={`https://x.com/${player.twitter}`}
                      target="_blank" rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`Twitter de ${player.gamertag}`}
                    >𝕏</a>
                  )}
                  {player.twitch && (
                    <a
                      href={`https://twitch.tv/${player.twitch}`}
                      target="_blank" rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.socialTwitch}`}
                      aria-label={`Twitch de ${player.gamertag}`}
                    >▶</a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Teams() {
  const [activeTab, setActiveTab] = useState('cdl');
  const [openTeam, setOpenTeam] = useState(null);
  const [gridRef, gridVisible] = useInView({ threshold: 0.04, once: false });

  const teams = useMemo(
    () => activeTab === 'cdl' ? CDL_TEAMS : WARZONE_TEAMS,
    [activeTab]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOpenTeam(null);
  };

  const handleCardClick = (team) => {
    setOpenTeam(prev => (prev?.id === team.id ? null : team));
  };

  const logoItems = useMemo(() => teams.map(t => ({
    node: (
      <img
        src={t.logo}
        alt={t.shortName || t.name}
        style={{ height: '28px', width: 'auto', objectFit: 'contain', opacity: 0.6, filter: 'grayscale(30%)' }}
      />
    ),
    title: t.name,
  })), [teams]);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < teams.length; i += DESKTOP_COLS) {
      result.push(teams.slice(i, i + DESKTOP_COLS));
    }
    return result;
  }, [teams]);

  const openIndex = openTeam ? teams.findIndex(t => t.id === openTeam.id) : -1;
  const openRow = openIndex >= 0 ? Math.floor(openIndex / DESKTOP_COLS) : -1;

  return (
    <>
      <MetaTags
        title="Équipes Esport — CoD Pulse"
        description="Toutes les équipes CDL et Warzone compétitif. Rosters, logos officiels, palmarès."
      />

      <div className={styles.pageHeader}>
        <div className="container">
          <span className={styles.overline}>ESPORT</span>
          <h1 className={styles.title}>ÉQUIPES</h1>
          <p className={styles.subtitle}>
            {CDL_TEAMS.length} franchises CDL · {WARZONE_TEAMS.length} équipes Warzone
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'cdl' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('cdl')}
            data-cat="cdl"
          >
            CDL — Call of Duty League
            <span className={styles.tabCount}>{CDL_TEAMS.length}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'warzone' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('warzone')}
            data-cat="warzone"
          >
            Warzone Compétitif
            <span className={styles.tabCount}>{WARZONE_TEAMS.length}</span>
          </button>
        </div>

        <div className={styles.logoStrip} aria-hidden="true">
          <LogoLoop
            logos={logoItems}
            speed={50}
            direction="left"
            logoHeight={32}
            gap={40}
            hoverSpeed={0}
            fadeOut
            fadeOutColor="#000000"
            ariaLabel={`Logos équipes ${activeTab.toUpperCase()}`}
          />
        </div>

        <div ref={gridRef} className={`${styles.rowsContainer} ${gridVisible ? styles.gridRevealed : ''}`}>
          {rows.map((row, rowIdx) => (
            <div key={`${activeTab}-row-${rowIdx}`} className={styles.rowWrapper}>
              <div className={styles.row}>
                {row.map((team, colIdx) => {
                  const globalIdx = rowIdx * DESKTOP_COLS + colIdx;
                  return (
                    <TeamCard
                      key={team.id}
                      team={team}
                      isOpen={openTeam?.id === team.id}
                      onClick={() => handleCardClick(team)}
                      staggerDelay={Math.min(globalIdx * 60, 480)}
                    />
                  );
                })}
                {Array.from({ length: DESKTOP_COLS - row.length }, (_, i) => (
                  <div key={`empty-${i}`} className={styles.emptySlot} />
                ))}
              </div>

              <AnimatePresence>
                {openRow === rowIdx && openTeam && (
                  <RosterPanel
                    key={`panel-${openTeam.id}`}
                    team={openTeam}
                    onClose={() => setOpenTeam(null)}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
