import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { ALL_TEAMS } from '../data/teamsData';
import MetaTags from '../components/MetaTags';
import styles from './WorldMap.module.css';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const TEAM_LOCATIONS = [
  // CDL
  { slug: 'optic-texas',           lon: -96.8,  lat: 32.8,  label: 'Dallas, TX' },
  { slug: 'faze-vegas',            lon: -115.1, lat: 36.2,  label: 'Las Vegas, NV' },
  { slug: 'riyadh-falcons',        lon: 46.7,   lat: 24.7,  label: 'Riyadh, KSA' },
  { slug: 'la-thieves',            lon: -118.2, lat: 34.1,  label: 'Los Angeles, CA' },
  { slug: 'miami-heretics',        lon: -80.2,  lat: 25.8,  label: 'Miami, FL' },
  { slug: 'g2-minnesota',          lon: -93.3,  lat: 44.9,  label: 'Minneapolis, MN' },
  { slug: 'cloud9-new-york',       lon: -74.0,  lat: 40.7,  label: 'New York, NY' },
  { slug: 'paris-gentle-mates',    lon: 2.3,    lat: 48.9,  label: 'Paris, FR' },
  { slug: 'toronto-koi',           lon: -79.4,  lat: 43.7,  label: 'Toronto, ON' },
  { slug: 'vancouver-surge',       lon: -123.1, lat: 49.3,  label: 'Vancouver, BC' },
  { slug: 'boston-breach',         lon: -71.1,  lat: 42.4,  label: 'Boston, MA' },
  { slug: 'carolina-royal-ravens', lon: -78.6,  lat: 35.8,  label: 'Raleigh, NC' },
  // Warzone
  { slug: 'team-vitality-wz',      lon: 2.1,    lat: 48.8,  label: 'Paris, FR' },
  { slug: 'team-falcons-wz',       lon: 46.7,   lat: 24.7,  label: 'Riyadh, KSA' },
  { slug: 'm8-wz',                 lon: 2.5,    lat: 48.6,  label: 'Paris, FR' },
  { slug: 'geng-wz',               lon: 126.9,  lat: 37.5,  label: 'Seoul, KR' },
  { slug: 'faze-clan-wz',          lon: -118.5, lat: 34.0,  label: 'Los Angeles, CA' },
];

export default function WorldMap() {
  const [filter, setFilter]   = useState('all');
  const [hovered, setHovered] = useState(null);
  const [scanPos, setScanPos] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // Drone scan: vertical line sweeps left→right every 3.5s
  useEffect(() => {
    const DURATION = 3500;
    const PAUSE    = 1200;
    let pausing = false;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) % (DURATION + PAUSE);

      if (elapsed < DURATION) {
        pausing = false;
        setScanPos((elapsed / DURATION) * 100);
      } else if (!pausing) {
        pausing = true;
        setScanPos(101); // hide
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const teamMap = Object.fromEntries(ALL_TEAMS.map(t => [t.slug, t]));

  const visibleLocations = TEAM_LOCATIONS.filter(loc => {
    const team = teamMap[loc.slug];
    if (!team) return false;
    if (filter === 'all') return true;
    return team.category === filter;
  });

  const hoveredTeam = hovered ? teamMap[hovered] : null;
  const hoveredLoc  = hovered ? TEAM_LOCATIONS.find(l => l.slug === hovered) : null;

  const regions = new Set(visibleLocations.map(l => teamMap[l.slug]?.region).filter(Boolean)).size;

  return (
    <>
      <MetaTags
        title="Carte — CoD Pulse"
        description="Localisation mondiale des franchises CDL et équipes Warzone compétitif."
      />

      <div className={styles.page}>
        <div className={styles.header}>
          <div className="container">
            <span className={styles.overline}>TACTICAL OVERVIEW</span>
            <h1 className={styles.title}>WORLD MAP</h1>
            <p className={styles.subtitle}>
              {visibleLocations.length} équipes — {regions} régions actives
            </p>
          </div>
        </div>

        <div className="container">
          <div className={styles.filters}>
            {['all', 'cdl', 'warzone'].map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'TOUTES' : f.toUpperCase()}
              </button>
            ))}
          </div>

          <div className={styles.mapWrap}>
            {/* HUD corners */}
            <div className={styles.hudTL} /><div className={styles.hudTR} />
            <div className={styles.hudBL} /><div className={styles.hudBR} />

            {/* Drone scan line */}
            <div
              className={styles.scanLine}
              style={{ left: `${scanPos}%`, display: scanPos > 100 ? 'none' : 'block' }}
            />
            {/* Scan trail (already-scanned zone) */}
            <div
              className={styles.scanTrail}
              style={{ width: `${Math.min(scanPos, 100)}%`, display: scanPos > 100 ? 'none' : 'block' }}
            />

            {/* Map label */}
            <div className={styles.mapLabel}>SCANNING...</div>

            {/* Real world map */}
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 140, center: [10, 20] }}
              style={{ width: '100%', height: '100%' }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: 'rgba(212, 160, 23, 0.06)',
                          stroke: 'rgba(212, 160, 23, 0.22)',
                          strokeWidth: 0.4,
                          outline: 'none',
                        },
                        hover: {
                          fill: 'rgba(212, 160, 23, 0.12)',
                          stroke: 'rgba(212, 160, 23, 0.35)',
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        pressed: { outline: 'none' },
                      }}
                    />
                  ))
                }
              </Geographies>

              {visibleLocations.map(loc => {
                const team = teamMap[loc.slug];
                if (!team) return null;
                const isH = hovered === loc.slug;

                return (
                  <Marker
                    key={loc.slug}
                    coordinates={[loc.lon, loc.lat]}
                    onMouseEnter={() => setHovered(loc.slug)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Pulse rings */}
                    <circle
                      r={isH ? 10 : 8}
                      fill="none"
                      stroke={team.primaryColor}
                      strokeWidth={0.8}
                      opacity={0.4}
                      className={styles.ring1}
                    />
                    <circle
                      r={isH ? 6 : 5}
                      fill="none"
                      stroke={team.primaryColor}
                      strokeWidth={0.6}
                      opacity={0.5}
                      className={styles.ring2}
                    />
                    {/* Core dot */}
                    <circle
                      r={isH ? 4 : 3}
                      fill={team.primaryColor}
                      filter={`drop-shadow(0 0 ${isH ? 6 : 3}px ${team.primaryColor})`}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Label on hover */}
                    {isH && (
                      <text
                        textAnchor="middle"
                        y={-14}
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '4px',
                          fill: team.primaryColor,
                          letterSpacing: '0.05em',
                          pointerEvents: 'none',
                        }}
                      >
                        {team.name.toUpperCase()}
                      </text>
                    )}
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* HTML Tooltip (outside SVG for rich content) */}
            {hoveredTeam && hoveredLoc && (
              <div
                className={styles.tooltip}
                style={{ '--team-color': hoveredTeam.primaryColor }}
              >
                <div className={styles.tooltipLogo}>
                  <img
                    src={hoveredTeam.logo}
                    alt={hoveredTeam.name}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div className={styles.tooltipCat}>
                  {hoveredTeam.category === 'cdl' ? 'CDL 2026' : 'WARZONE'}
                </div>
                <div className={styles.tooltipName}>{hoveredTeam.name}</div>
                <div className={styles.tooltipCity}>{hoveredLoc.label}</div>
                <Link to={`/teams/${hoveredTeam.slug}`} className={styles.tooltipLink}>
                  VOIR L'ÉQUIPE →
                </Link>
              </div>
            )}

            {/* Stats HUD */}
            <div className={styles.statsHUD}>
              <div className={styles.statItem}>
                <span className={styles.statVal}>{visibleLocations.length}</span>
                <span className={styles.statKey}>EQUIPES</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statVal}>{regions}</span>
                <span className={styles.statKey}>REGIONS</span>
              </div>
              <div className={styles.statDiv} />
              <div className={styles.statItem}>
                <span className={styles.statVal}>LIVE</span>
                <span className={styles.statKey}>STATUS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
