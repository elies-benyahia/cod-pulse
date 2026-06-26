import { useParams, Link, Navigate } from 'react-router-dom';
import { ALL_TEAMS } from '../data/teamsData';
import MetaTags from '../components/MetaTags';
import styles from './PlayerDetail.module.css';

// nationality already cleaned to text codes in teamsData

function SocialLink({ href, label, icon }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title={label}>
      <span className={styles.socialIcon} dangerouslySetInnerHTML={{ __html: icon }} />
      <span className={styles.socialLabel}>{label}</span>
    </a>
  );
}

// SVG icons as strings
const ICONS = {
  twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  twitch: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
};

function isWin(placement) {
  return placement.includes('CHAMPION') || placement.includes('Champion') || placement.includes('1st');
}

export default function PlayerDetail() {
  const { playerId } = useParams();

  let player = null;
  let team = null;

  for (const t of ALL_TEAMS) {
    const found = t.roster.find((p) => p.id === playerId);
    if (found) { player = found; team = t; break; }
  }

  if (!player) return <Navigate to="/teams" replace />;

  const champWins = player.palmares?.filter(p => isWin(p.placement)) || [];

  const hasSocials = player.twitter || player.twitch || player.youtube || player.instagram;

  return (
    <>
      <MetaTags title={`${player.gamertag} — CoD Pulse`} description={player.bio} />

      <div className={styles.hero} style={{ '--team-color': team.primaryColor }}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link to="/teams" className={styles.breadLink}>Équipes</Link>
            <span className={styles.breadSep}>/</span>
            <Link to={`/teams/${team.slug}`} className={styles.breadLink}>{team.name}</Link>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>{player.gamertag}</span>
          </div>

          <div className={styles.heroInner}>
            <div className={styles.photoWrap}>
              {player.photo && (
                <img
                  src={player.photo}
                  alt={player.gamertag}
                  className={styles.photo}
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              )}
              <div className={styles.photoFallback} style={{ display: player.photo ? 'none' : 'flex' }}>
                {player.gamertag.charAt(0)}
              </div>
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroMeta}>
                <span className={styles.roleTag}>{player.role}</span>
                {player.nationality && <span className={styles.natTag}>{player.nationality}</span>}
                {player.age && <span className={styles.ageTag}>{player.age} ans</span>}
              </div>

              <h1 className={styles.gamertag}>{player.gamertag}</h1>
              <p className={styles.realName}>{player.realName}</p>

              <Link to={`/teams/${team.slug}`} className={styles.teamLink}>
                <img src={team.logo} alt={team.name} className={styles.teamLogo}
                  onError={(e) => { e.target.style.display = 'none'; }} />
                {team.name}
              </Link>

              {player.bio && <p className={styles.bio}>{player.bio}</p>}
            </div>

            {player.stats && (
              <div className={styles.statsPanel}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{player.stats.kd}</div>
                  <div className={styles.statLabel}>K/D RATIO</div>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <div className={styles.statValue}>{champWins.length}</div>
                  <div className={styles.statLabel}>TITRES</div>
                </div>
                <div className={styles.statDivider} />
                <div className={styles.stat}>
                  <div className={styles.statValue}>{player.palmares?.length || 0}</div>
                  <div className={styles.statLabel}>PODIUMS</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {player.palmares && player.palmares.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} style={{ background: team.primaryColor }} />
              PALMARES COMPLET
            </h2>
            <div className={styles.timeline}>
              {[...player.palmares].reverse().map((item, i) => (
                <div key={i} className={`${styles.timelineItem} ${isWin(item.placement) ? styles.timelineWin : ''}`}>
                  <div className={styles.timelineYear}>{item.year}</div>
                  <div className={styles.timelineDot} style={{ background: isWin(item.placement) ? team.primaryColor : undefined }} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineEvent}>{item.event}</div>
                    <div className={styles.timelineTeam}>{item.team}</div>
                    <div className={styles.timelinePlacement}>
                      {item.placement.replace('🏆 ', '').replace('🥈 ', '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasSocials && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} style={{ background: team.primaryColor }} />
              RESEAUX SOCIAUX
            </h2>
            <div className={styles.socials}>
              <SocialLink
                href={player.twitter ? `https://twitter.com/${player.twitter}` : null}
                label={`@${player.twitter}`}
                icon={ICONS.twitter}
              />
              <SocialLink
                href={player.twitch ? `https://twitch.tv/${player.twitch}` : null}
                label={player.twitch}
                icon={ICONS.twitch}
              />
              <SocialLink
                href={player.youtube ? `https://youtube.com/@${player.youtube}` : null}
                label={player.youtube}
                icon={ICONS.youtube}
              />
              <SocialLink
                href={player.instagram ? `https://instagram.com/${player.instagram}` : null}
                label={`@${player.instagram}`}
                icon={ICONS.instagram}
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
