import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { ALL_TEAMS } from '../data/teamsData';
import MetaTags from '../components/MetaTags';
import { useInView } from '../hooks/api';
import styles from './TeamDetail.module.css';

function RevealSection({ children, className }) {
  const [ref, visible] = useInView({ threshold: 0.08 });
  return (
    <div ref={ref} className={`${className || ''} reveal ${visible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
}

function PlayerCard({ player, teamColor, onClick }) {
  return (
    <div
      className={styles.playerCard}
      style={{ '--team-color': teamColor }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`Voir le profil de ${player.gamertag}`}
    >
      <div className={styles.playerPhoto}>
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.gamertag}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className={styles.playerInitial}
          style={{ display: player.photo ? 'none' : 'flex' }}
        >
          {player.gamertag.charAt(0)}
        </div>
      </div>
      <div className={styles.playerInfo}>
        <span className={styles.playerRole}>{player.role}</span>
        <h3 className={styles.playerGamertag}>{player.gamertag}</h3>
        {player.realName && player.realName !== player.gamertag && (
          <span className={styles.playerName}>{player.realName}</span>
        )}
        <div className={styles.playerMeta}>
          {player.nationality && <span className={styles.playerNat}>{player.nationality}</span>}
          {player.age && <span className={styles.playerAge}>{player.age} ans</span>}
        </div>
      </div>
      <div className={styles.playerAccent} />
    </div>
  );
}

export default function TeamDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const team = ALL_TEAMS.find((t) => t.slug === slug);

  if (!team) return <Navigate to="/teams" replace />;

  return (
    <>
      <MetaTags
        title={`${team.name} — CoD Pulse`}
        description={team.bio}
      />

      <div
        className={styles.hero}
        style={{ '--team-color': team.primaryColor, '--team-color-dim': team.primaryColor + '22' }}
      >
        <div className="container">
          <Link to="/teams" className={styles.back}>
            ← Toutes les équipes
          </Link>

          <div className={styles.heroInner}>
            <div className={styles.heroLogo}>
              <img
                src={team.logo}
                alt={team.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className={styles.heroLogoFallback} style={{ display: 'none' }}>
                {team.logoFallback}
              </div>
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.heroMeta}>
                <span className={styles.category}>
                  {team.category === 'cdl' ? 'CDL' : 'WARZONE'}
                </span>
                {team.region && <span className={styles.region}>{team.region}</span>}
                {team.founded && (
                  <span className={styles.founded}>Est. {team.founded}</span>
                )}
              </div>
              <h1 className={styles.heroName}>{team.name}</h1>
              {team.city && <p className={styles.heroCity}>{team.city}</p>}
              <p className={styles.heroBio}>{team.bio}</p>
            </div>
          </div>
        </div>
        <div className={styles.heroBorder} />
      </div>

      <div className="container">
        {team.championships && team.championships.length > 0 && (
          <RevealSection>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionLine} />
                PALMARÈS
              </h2>
              <div className={styles.palmaresList}>
                {team.championships.map((champ, i) => (
                  <div key={i} className={styles.palmaresItem}>
                    <span className={styles.trophyIcon}>🏆</span>
                    <div>
                      <div className={styles.palmaresEvent}>{champ.event}</div>
                      <div className={styles.palmaresYear}>{champ.year} — {champ.placement}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </RevealSection>
        )}

        {team.history && (
          <RevealSection>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionLine} />
                HISTOIRE
              </h2>
              <div className={styles.historyBody}>
                {team.history.split('\n\n').map((para, i) => (
                  <p key={i} className={styles.historyPara}>{para}</p>
                ))}
              </div>
            </section>
          </RevealSection>
        )}

        <RevealSection>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionLine} />
              ROSTER — {team.roster.length} JOUEUR{team.roster.length > 1 ? 'S' : ''}
            </h2>

            <div className={styles.rosterGrid}>
              {team.roster.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  teamColor={team.primaryColor}
                  onClick={() => navigate(`/players/${player.id}`)}
                />
              ))}
            </div>
          </section>
        </RevealSection>
      </div>
    </>
  );
}
