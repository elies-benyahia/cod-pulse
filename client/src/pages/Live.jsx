import { useMemo, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import MetaTags from '../components/MetaTags';
import { useLive } from '../hooks/api';
import { ALL_TEAMS } from '../data/teamsData';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Live.module.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Build a map: twitch/gamertag (lowercase) → enriched player object
const PLAYER_MAP = {};
for (const team of ALL_TEAMS) {
  for (const player of (team.roster || [])) {
    const handle = (player.twitch || player.twitter || player.gamertag || '').toLowerCase();
    if (handle) {
      PLAYER_MAP[handle] = {
        gamertag: player.gamertag,
        realName: player.realName,
        role: player.role,
        nationality: player.nationality,
        photo: player.photo,
        teamName: team.name,
        teamLogo: team.logo,
        teamColor: team.primaryColor,
        teamSlug: team.slug,
        twitch: player.twitch || player.twitter || player.gamertag,
        category: team.category,
      };
    }
  }
}

// Build full roster from ALL_TEAMS for static display
const ALL_CDL_PLAYERS = [];
const ALL_WZ_PLAYERS  = [];
for (const team of ALL_TEAMS) {
  for (const player of (team.roster || [])) {
    const entry = {
      id: player.id || `${team.slug}-${player.gamertag}`,
      gamertag: player.gamertag,
      realName: player.realName,
      role: player.role,
      nationality: player.nationality,
      photo: player.photo,
      teamName: team.name,
      teamLogo: team.logo,
      teamColor: team.primaryColor,
      teamSlug: team.slug,
      twitchLogin: (player.twitch || player.twitter || player.gamertag || '').toLowerCase(),
      category: team.category,
    };
    if (team.category === 'cdl') ALL_CDL_PLAYERS.push(entry);
    else ALL_WZ_PLAYERS.push(entry);
  }
}

function LiveBadge({ viewers }) {
  return (
    <span className={styles.liveBadge}>
      <span className={styles.liveDot} />
      LIVE {viewers != null && <span className={styles.liveViewers}>
        {viewers >= 1000 ? `${(viewers / 1000).toFixed(1)}K` : viewers}
      </span>}
    </span>
  );
}

function PlayerCard({ player, streamData }) {
  const isLive = !!streamData?.isLive;
  const stream = streamData?.stream;
  const thumbnail = stream?.thumbnail_url?.replace('{width}', '320').replace('{height}', '180');
  const profileImg = streamData?.profileImageUrl;

  return (
    <a
      href={`https://twitch.tv/${player.twitchLogin}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.card} ${isLive ? styles.cardLive : styles.cardOffline}`}
      style={{ '--team-color': player.teamColor }}
      aria-label={`${player.gamertag}${isLive ? ' — En live sur Twitch' : ' — Hors ligne'}`}
    >
      <div className={styles.cardAccent} style={{ background: player.teamColor }} />

      <div className={styles.cardThumb}>
        {isLive && thumbnail ? (
          <img src={thumbnail} alt={`Stream de ${player.gamertag}`} className={styles.thumbImg} loading="lazy" />
        ) : profileImg ? (
          <img src={profileImg} alt={player.gamertag} className={styles.avatarImg} loading="lazy" />
        ) : player.photo ? (
          <img src={player.photo} alt={player.gamertag} className={styles.avatarImg} loading="lazy" />
        ) : (
          <div className={styles.avatarFallback} style={{ color: player.teamColor }}>
            {player.gamertag.charAt(0).toUpperCase()}
          </div>
        )}
        {isLive && <LiveBadge viewers={stream?.viewer_count} />}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <span className={styles.gamertag}>{player.gamertag}</span>
          {player.nationality && (
            <span className={styles.nationality}>{player.nationality}</span>
          )}
        </div>
        <span className={styles.teamName} style={{ color: player.teamColor }}>
          {player.teamName}
        </span>
        {player.role && <span className={styles.role}>{player.role}</span>}
        {player.realName && player.realName !== player.gamertag && (
          <span className={styles.realName}>{player.realName}</span>
        )}
        {isLive ? (
          <>
            {stream?.game_name && <span className={styles.gameName}>{stream.game_name}</span>}
            {stream?.title && <p className={styles.streamTitle}>{stream.title}</p>}
            <div className={styles.watchBtn}><span className={styles.watchIcon}>▶</span> REGARDER</div>
          </>
        ) : (
          <span className={styles.offline}>Hors ligne</span>
        )}
      </div>
    </a>
  );
}

function SectionHeader({ label, title, liveCount }) {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.sectionBar} />
      <div className={styles.sectionMeta}>
        <span className={styles.sectionLabel}>{label}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {liveCount > 0 && (
        <span className={styles.sectionLiveCount}>
          <span className={styles.liveDotSmall} />{liveCount} en live
        </span>
      )}
    </div>
  );
}

function CDLScoreboard({ match }) {
  if (!match) return null;
  return (
    <motion.div
      className={styles.scoreboard}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
    >
      <div className={styles.scoreboardBadge}>
        <span className={styles.scoreboardDot} />
        CDL MATCH EN COURS
      </div>
      <div className={styles.scoreboardRow}>
        <span className={styles.scoreboardTeam}>{match.team_a}</span>
        <div className={styles.scoreboardCenter}>
          <span className={styles.scoreboardScore}>{match.score_a}</span>
          <span className={styles.scoreboardSep}>–</span>
          <span className={styles.scoreboardScore}>{match.score_b}</span>
        </div>
        <span className={`${styles.scoreboardTeam} ${styles.scoreboardTeamRight}`}>{match.team_b}</span>
      </div>
      {match.current_map && (
        <div className={styles.scoreboardMeta}>
          {match.current_map} · {match.current_mode}
        </div>
      )}
    </motion.div>
  );
}

export default function Live() {
  const { t } = useLanguage();
  const { streams, loading, error, lastUpdated, liveCount, refresh } = useLive();

  const [liveMatch, setLiveMatch] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('match:update', (data) => setLiveMatch(data));
    return () => socket.disconnect();
  }, []);

  // Build a lookup: login → stream data
  const streamMap = useMemo(() => {
    const map = {};
    for (const s of streams) map[s.login.toLowerCase()] = s;
    return map;
  }, [streams]);

  const totalViewers = useMemo(() =>
    streams.filter(s => s.isLive).reduce((sum, s) => sum + (s.stream?.viewer_count || 0), 0),
    [streams]
  );

  const cdlLive = ALL_CDL_PLAYERS.filter(p => streamMap[p.twitchLogin]?.isLive).length;
  const wzLive  = ALL_WZ_PLAYERS.filter(p => streamMap[p.twitchLogin]?.isLive).length;

  // Sort: live first, then by team
  const sortedCDL = [...ALL_CDL_PLAYERS].sort((a, b) => {
    const aLive = streamMap[a.twitchLogin]?.isLive ? 1 : 0;
    const bLive = streamMap[b.twitchLogin]?.isLive ? 1 : 0;
    return bLive - aLive || a.teamName.localeCompare(b.teamName);
  });

  const sortedWZ = [...ALL_WZ_PLAYERS].sort((a, b) => {
    const aLive = streamMap[a.twitchLogin]?.isLive ? 1 : 0;
    const bLive = streamMap[b.twitchLogin]?.isLive ? 1 : 0;
    return bLive - aLive || a.teamName.localeCompare(b.teamName);
  });

  return (
    <>
      <MetaTags
        title="Joueurs en Live — CoD Pulse"
        description="Suivez les joueurs pros de CDL et Warzone en temps réel. Streams Twitch en direct."
      />

      <div className={styles.pageHeader}>
        <div className="container">
          <div className={styles.headerInner}>
            <div>
              <span className={styles.overline}>TWITCH · TEMPS RÉEL</span>
              <h1 className={styles.title}>
                {t('live_title')}
                {liveCount > 0 && <span className={styles.liveCount}>{liveCount}</span>}
              </h1>
              <p className={styles.subtitle}>{t('live_sub')}</p>
            </div>
            <div className={styles.headerRight}>
              {lastUpdated && (
                <span className={styles.lastUpdated}>
                  Mis à jour {lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button className={styles.refreshBtn} onClick={refresh} aria-label="Actualiser">
                {t('live_refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">

        {/* CDL Match scoreboard (socket.io) */}
        <AnimatePresence>
          {liveMatch && <CDLScoreboard match={liveMatch} />}
        </AnimatePresence>

        {/* Stats bar */}
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{liveCount}</span>
            <span className={styles.statLabel}>{t('live_online')}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{ALL_CDL_PLAYERS.length + ALL_WZ_PLAYERS.length - liveCount}</span>
            <span className={styles.statLabel}>{t('live_offline')}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{totalViewers.toLocaleString('fr-FR')}</span>
            <span className={styles.statLabel}>{t('live_viewers')}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>{ALL_CDL_PLAYERS.length + ALL_WZ_PLAYERS.length}</span>
            <span className={styles.statLabel}>JOUEURS SUIVIS</span>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorIcon}>⚠</span>
            <div>
              <strong>API Twitch non connectée</strong>
              <p>Statuts live non disponibles. Configure <code>TWITCH_CLIENT_ID</code> et <code>TWITCH_CLIENT_SECRET</code> dans <code>server/.env</code>.</p>
            </div>
          </div>
        )}

        {/* ── CDL Section ── */}
        <section className={styles.section}>
          <SectionHeader
            label="CDL 2026"
            title={t('live_section_cdl')}
            liveCount={cdlLive}
          />
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <div className={styles.grid}>
              {sortedCDL.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  streamData={streamMap[player.twitchLogin]}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── WZ Section ── */}
        <section className={styles.section}>
          <SectionHeader
            label="WRS 2026"
            title={t('live_section_wz')}
            liveCount={wzLive}
          />
          {loading ? (
            <div className={styles.grid}>
              {Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : (
            <div className={styles.grid}>
              {sortedWZ.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  streamData={streamMap[player.twitchLogin]}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </>
  );
}
