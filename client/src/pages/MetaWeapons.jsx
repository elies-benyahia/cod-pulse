import { useState, useMemo } from 'react';
import MetaTags from '../components/MetaTags';
import { useWeaponImages } from '../hooks/api';
import styles from './MetaWeapons.module.css';

// ── Méta réelle Black Ops 7 Warzone — Saison 4 (19 juin 2026) ──
// Sources : warzoneloadout.games · wzstats.gg · MAJ 17 juin 2026

const WARZONE_META = {
  updated: '19 Juin 2026 — Saison 4 · Sources warzoneloadout.games & wzstats.gg',
  tiers: {
    S: [
      {
        id: 'mxr17',
        name: 'MXR-17',
        category: 'AR',
        ttk: '310ms',
        damage: 94,
        range: 92,
        fireRate: 74,
        mobility: 66,
        recoil: 80,
        proPick: true,
        pickRate: 'Top 3 AR',
        summary: 'Meilleur AR longue portée de la Saison 4. Dominant sur Urzikstan grâce à son TTK et sa vélocité de balle. Choix pro numéro 1 en WRS.',
        build: ['Monolithic Suppressor', '17" Greaves Scourge Barrel', 'FANG HoverPoint ELO', 'Winch Stock', 'Rhodes Drum Mag'],
        image: null,
      },
      {
        id: 'ds20-mirage',
        name: 'DS20 Mirage',
        category: 'AR',
        ttk: '320ms',
        damage: 91,
        range: 90,
        fireRate: 71,
        mobility: 65,
        recoil: 83,
        proPick: true,
        pickRate: 'Top 2 AR',
        summary: 'AR polyvalent S tier, performant aussi bien en sniper support qu\'en longue portée pure. Utilisé par Vitality et Gen.G.',
        build: ['VAS 5.56 Suppressor', '18.9" Westerlies Barrel', 'FANG HoverPoint ELO', 'Assault Division Stock', 'Andean Extended Mag'],
        image: null,
      },
      {
        id: 'carbon57',
        name: 'Carbon 57',
        category: 'SMG',
        ttk: '205ms',
        damage: 82,
        range: 45,
        fireRate: 96,
        mobility: 90,
        recoil: 84,
        proPick: true,
        pickRate: '#1 SMG',
        summary: 'Meilleur SMG de la Saison 4 selon wzstats.gg. Domine en close range ET sniper support. Incontournable en ranked et tournois WRS.',
        build: ['LTI Stentorian Brake', '14" Rockleigh Barrel', 'Sapper Guard Handstop', 'MFS Renown Plus Mag', 'Accelerated Recoil System'],
        image: null,
        isNew: false,
      },
      {
        id: 'dravec45',
        name: 'Dravec 45',
        category: 'SMG',
        ttk: '215ms',
        damage: 80,
        range: 48,
        fireRate: 94,
        mobility: 88,
        recoil: 82,
        proPick: true,
        pickRate: '#2 SMG',
        summary: 'SMG élite, #2 worldwide sur wzstats.gg. TTK destructeur en close range. Excellent combo avec MXR-17 en sniper support.',
        build: ['Bowen .45 Suppressor', '19" EAM Horizon Barrel', 'MFS Agile Laser Pro', 'Gator Extended Mag', 'Bolt Carrier Group'],
        image: null,
      },
      {
        id: 'strider300',
        name: 'Strider 300',
        category: 'Sniper',
        ttk: '1 coup',
        damage: 99,
        range: 99,
        fireRate: 34,
        mobility: 42,
        recoil: 93,
        proPick: false,
        pickRate: '#1 Sniper',
        summary: 'Meilleur sniper S4 selon warzoneloadout.games. One-shot garanti sur toutes les distances. La référence absolue pour le rôle sniper.',
        build: ['Monolithic Suppressor', '25" Bowen Grooved Barrel', 'Carnation Fast Mag', 'Hatch Quick Grip', '.300 WM Overpressured'],
        image: null,
      },
    ],
    A: [
      {
        id: 'ak27',
        name: 'AK-27',
        category: 'AR',
        ttk: '330ms',
        damage: 89,
        range: 88,
        fireRate: 69,
        mobility: 63,
        recoil: 78,
        proPick: true,
        pickRate: '#1 LR sur wzstats',
        summary: '#1 long range selon wzstats.gg. Excellent recul, idéal pour les joueurs qui maîtrisent leur arme. Utilisé par Fun Esports.',
        build: ['Monolithic Suppressor', '17.6" Vandal Heavy Barrel', 'FANG HoverPoint ELO', 'Pugil Heavy Stock', 'Saber Pack Heavy Drum'],
        image: null,
      },
      {
        id: 'vx-compact',
        name: 'VX Compact',
        category: 'AR',
        ttk: '335ms',
        damage: 86,
        range: 85,
        fireRate: 72,
        mobility: 70,
        recoil: 81,
        proPick: false,
        pickRate: 'A tier',
        summary: 'AR multi-rôle très polyvalent. Fonctionne en longue portée, sniper support et close range. Parfait pour les joueurs qui aiment la flexibilité.',
        build: ['Monolithic Suppressor', '13" Promontory Barrel', 'FANG HoverPoint ELO', 'Require Stability Stock', 'Acclivity Extended Mag II'],
        image: null,
      },
      {
        id: 'mpc25',
        name: 'MPC-25',
        category: 'SMG',
        ttk: '225ms',
        damage: 77,
        range: 46,
        fireRate: 92,
        mobility: 89,
        recoil: 79,
        proPick: false,
        pickRate: 'A tier',
        summary: 'Solide alternative au Carbon 57. Excellent en sniper support avec son TTK rapide et son profil de recul prévisible.',
        build: ['K&S Compensator', '14.5" VAS Ashe Barrel', 'FANG HoverPoint ELO', 'MPC Overload Drum', 'Recoil Sync Unit'],
        image: null,
      },
      {
        id: 'vs-recon',
        name: 'VS Recon',
        category: 'Sniper',
        ttk: '1 coup',
        damage: 98,
        range: 98,
        fireRate: 36,
        mobility: 44,
        recoil: 90,
        proPick: false,
        pickRate: '#1 Sniper wzstats',
        summary: 'Meilleur sniper selon wzstats.gg (#1 pick rate sniper). Alternative au Strider 300 avec rechambrage légèrement plus rapide.',
        build: ['Monolithic Suppressor', '23" G-Force Barrel', 'MFS R-Stop Handguard', 'R-1 Shelf Grip', '7.62 NATO Overpressured'],
        image: null,
      },
      {
        id: 'hawker-hx',
        name: 'Hawker HX',
        category: 'Sniper',
        ttk: '1 coup',
        damage: 97,
        range: 97,
        fireRate: 37,
        mobility: 46,
        recoil: 89,
        proPick: false,
        pickRate: '#2 Sniper wzstats',
        summary: '#2 sniper sur wzstats.gg. Mobilité légèrement supérieure aux autres snipers. Favori des joueurs agressifs en sniper.',
        build: ['Monolithic Suppressor', '23.7" Composite-11 Barrel', 'Flatload Speed Mag', 'Auroral Light Grip', '.338 LM Overpressured'],
        image: null,
      },
      {
        id: 'voyak-kt3',
        name: 'Voyak KT-3',
        category: 'AR',
        ttk: '340ms',
        damage: 87,
        range: 86,
        fireRate: 68,
        mobility: 64,
        recoil: 79,
        proPick: false,
        pickRate: 'A tier',
        summary: 'AR sous-estimé avec des stats solides sur les deux usages (longue portée et sniper support). En montée depuis patch 4.0.',
        build: ['Monolithic Suppressor', '17.6" LTI Grav-4 Barrel', 'Redwell 30-S 2x', 'V-Last Control Pad', 'SK-Garrison Drum'],
        image: null,
      },
      {
        id: 'kogot7',
        name: 'Kogot-7',
        category: 'SMG',
        ttk: '228ms',
        damage: 76,
        range: 44,
        fireRate: 93,
        mobility: 91,
        recoil: 77,
        proPick: false,
        pickRate: 'A tier',
        summary: 'SMG compact et précis. Très bon en sniper support. Montée depuis les derniers ajustements du patch 4.1.',
        build: ['SWF Tishina-11', '13.5" Canis-05 Barrel', 'FANG HoverPoint ELO', 'VAS Convergence Foregrip', 'Vex Expanse Mag'],
        image: null,
      },
    ],
    B: [
      {
        id: 'vst',
        name: 'VST',
        category: 'SMG',
        ttk: '235ms',
        damage: 74,
        range: 42,
        fireRate: 91,
        mobility: 87,
        recoil: 76,
        proPick: false,
        pickRate: '#3 close range wzstats',
        summary: '#3 close range sur wzstats.gg. Solide mais légèrement dépassé par Carbon 57 et Dravec 45. Bon choix si tu maîtrises déjà ces deux armes.',
        build: ['Hawker Series 45', '14" LTI Expedition Barrel', 'Hawker Cub-55 Pad', 'VAS Convergence Foregrip', 'Avarice Extended Mag II'],
        image: null,
      },
      {
        id: 'peacekeeper',
        name: 'Peacekeeper Mk1',
        category: 'AR',
        ttk: '345ms',
        damage: 85,
        range: 87,
        fireRate: 70,
        mobility: 63,
        recoil: 82,
        proPick: false,
        pickRate: 'B tier',
        summary: 'AR vétéran avec de bonnes stats. Tombe en B tier car dépassé par MXR-17 et DS20 Mirage en S4.',
        build: ['Redwell Shade-X Suppressor', '19.4" Stimulus Barrel', 'FANG HoverPoint ELO', 'MFS Counterforce-C1 Stock', 'Vulcan Reach Extension'],
        image: null,
      },
      {
        id: 'xr3-ion',
        name: 'XR-3 Ion',
        category: 'Sniper',
        ttk: '1-2 coups',
        damage: 88,
        range: 93,
        fireRate: 42,
        mobility: 50,
        recoil: 85,
        proPick: false,
        pickRate: 'B tier',
        summary: 'Sniper semi-auto intéressant mais pas one-shot en toutes circonstances. Niche en résurgence pour les players semi-sniper.',
        build: ['LTI Triad Suppressor', '20" Ion Trinity Barrel', 'FANG HoverPoint ELO', 'Zero-S Handguard', '7.62 NATO Overpressured'],
        image: null,
      },
      {
        id: 'sokol545',
        name: 'Sokol 545',
        category: 'LMG',
        ttk: '300ms',
        damage: 93,
        range: 88,
        fireRate: 65,
        mobility: 42,
        recoil: 70,
        proPick: false,
        pickRate: '#1 LMG',
        summary: 'Seul LMG viable en S4. TTK impressionnant pour un LMG. Uniquement en position défensive ou fin de zone statique.',
        build: ['Monolithic Suppressor', '18.2" Parlous Heavy Barrel', 'FANG HoverPoint ELO', 'Taction Control Stock', 'Buffer Spring'],
        image: null,
      },
      {
        id: 'rev46',
        name: 'REV-46',
        category: 'SMG',
        ttk: '240ms',
        damage: 73,
        range: 40,
        fireRate: 90,
        mobility: 88,
        recoil: 75,
        proPick: false,
        pickRate: 'B tier',
        summary: 'SMG avec un build sniper support viable. Pas au niveau des top SMGs mais reste une option correcte si tu cherches la variété.',
        build: ['Monolithic Suppressor', 'Caudal Target Barrel', 'FANG HoverPoint ELO', 'Komodo Drum Mag', 'Recoil Sync Unit'],
        image: null,
      },
    ],
    C: [
      {
        id: 'maddox',
        name: 'Maddox RFB',
        category: 'AR',
        ttk: '360ms',
        damage: 83,
        range: 80,
        fireRate: 68,
        mobility: 62,
        recoil: 77,
        proPick: false,
        pickRate: 'C tier',
        summary: 'AR pas compétitif en S4. Pas mauvais mais aucune raison de le prendre face au MXR-17, DS20 ou AK-27.',
        build: [],
        image: null,
      },
      {
        id: 'mk78',
        name: 'MK.78',
        category: 'LMG',
        ttk: '315ms',
        damage: 90,
        range: 85,
        fireRate: 62,
        mobility: 38,
        recoil: 68,
        proPick: false,
        pickRate: 'C tier',
        summary: 'LMG lourd sans avantage compétitif sur Sokol 545. Mobilité trop faible pour le jeu actuel.',
        build: [],
        image: null,
      },
    ],
  },
};

const CDL_META = {
  updated: 'CDL 2026 — Post Major 3 · Major 4 : 26-28 juin 2026',
  mapPool: [
    { name: 'Hacienda',       modes: ['Hardpoint', 'Search & Destroy'],            status: 'active', notes: 'Map équilibrée. FaZe Vegas a le meilleur record HP ici.' },
    { name: 'Invasion',       modes: ['Hardpoint', 'Control'],                     status: 'active', notes: 'Map SMG dominée. Carbon 57 obligatoire. Shotzzy et Simp excellent.' },
    { name: 'Highrise',       modes: ['Hardpoint', 'Search & Destroy', 'Control'], status: 'active', notes: 'Classic CDL. OpTic TX domine le S&D. DS20 Mirage favorisé.' },
    { name: 'Scud',           modes: ['Search & Destroy'],                         status: 'active', notes: 'S&D map longue portée. Riyadh Falcons meilleur record. AK-27 privilégié.' },
    { name: 'Skyline',        modes: ['Hardpoint', 'Control'],                     status: 'active', notes: 'Nouvelle map BO7 S4. Ajoutée en remplacement de Terminal.' },
    { name: 'Rewind',         modes: ['Hardpoint', 'Search & Destroy', 'Control'], status: 'active', notes: 'Map S3. Meta encore établie, VX Compact performant ici.' },
    { name: 'Lowtown',        modes: ['Hardpoint'],                                status: 'veto',   notes: 'Souvent bannie. Trop de sightlines avantageant les ARs.' },
  ],
  weapons: {
    S: [
      { id: 'ds20-cdl',   name: 'DS20 Mirage', category: 'AR',  damage: 92, range: 88, fireRate: 70, summary: 'AR dominant CDL S4. 2 joueurs DS20 Mirage par équipe en standard. TTK imbattable en compétitif.', proPick: true, pickRate: '78%' },
      { id: 'carbon-cdl', name: 'Carbon 57',   category: 'SMG', damage: 83, range: 42, fireRate: 96, summary: 'SMG de référence en CDL. Toutes les équipes jouent Carbon 57 en premier SMG. TTK inarrêtable en close.', proPick: true, pickRate: '82%' },
      { id: 'dravec-cdl', name: 'Dravec 45',   category: 'SMG', damage: 80, range: 45, fireRate: 93, summary: 'Second SMG dominant. Certaines équipes le préfèrent au Carbon pour son recul plus prévisible.', proPick: true, pickRate: '18%' },
    ],
    A: [
      { id: 'ak27-cdl',   name: 'AK-27',       category: 'AR',  damage: 88, range: 86, fireRate: 68, summary: 'Alternative au DS20 Mirage utilisée par LA Thieves et Boston Breach. Recul plus linéaire.', proPick: false, pickRate: '22%' },
      { id: 'vx-cdl',     name: 'VX Compact',  category: 'AR',  damage: 85, range: 82, fireRate: 72, summary: 'AR polyvalent apprécié en S&D pour sa flexibilité. Utilisé par Paris Gentle Mates.', proPick: false, pickRate: '12%' },
    ],
  },
};

// ── Composants ───────────────────────────────────────────────

function StatBar({ value, color = 'var(--accent)' }) {
  return (
    <div className={styles.statBarWrap}>
      <div className={styles.statBarFill} style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function TierBadge({ tier }) {
  const colors = { S: '#D4A017', A: '#FF6B35', B: '#4A90D9', C: '#666', D: '#444' };
  return (
    <span className={styles.tierBadge} style={{ '--tier-color': colors[tier] || '#444' }}>
      {tier}
    </span>
  );
}

function WeaponCard({ weapon, tier }) {
  const [expanded, setExpanded] = useState(false);
  const catColors = { AR: '#D4A017', SMG: '#FF3A1A', Sniper: '#71B7FF', LMG: '#00CC66', Shotgun: '#AA00FF' };

  return (
    <div
      className={`${styles.weaponCard} ${weapon.proPick ? styles.proPick : ''}`}
      onClick={() => setExpanded(e => !e)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setExpanded(v => !v)}
      aria-expanded={expanded}
    >
      <div className={styles.weaponMain}>
        {/* Image ou silhouette */}
        <div className={styles.weaponImageWrap}>
          {weapon.image ? (
            <img
              src={weapon.image}
              alt={weapon.name}
              className={styles.weaponImage}
              loading="lazy"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div
            className={styles.weaponSilhouette}
            style={{ display: weapon.image ? 'none' : 'flex', '--cat-color': catColors[weapon.category] || '#888' }}
            data-cat={weapon.category}
          >
            <WeaponSilhouette type={weapon.category} />
          </div>
        </div>

        {/* Info */}
        <div className={styles.weaponInfo}>
          <div className={styles.weaponHeader}>
            <TierBadge tier={tier} />
            <span className={styles.weaponCat} style={{ color: catColors[weapon.category] }}>
              {weapon.category}
            </span>
            {weapon.proPick && <span className={styles.proTag}>PRO PICK</span>}
          {weapon.isNew && <span className={styles.newTag}>NOUVEAU S4</span>}
            {weapon.pickRate && <span className={styles.pickRate}>{weapon.pickRate} usage</span>}
          </div>
          <h3 className={styles.weaponName}>{weapon.name}</h3>
          <p className={styles.weaponSummary}>{weapon.summary}</p>
        </div>

        {/* Stats rapides */}
        <div className={styles.weaponQuickStats}>
          <div className={styles.quickStat}>
            <span className={styles.quickLabel}>DMG</span>
            <StatBar value={weapon.damage} />
          </div>
          <div className={styles.quickStat}>
            <span className={styles.quickLabel}>RANGE</span>
            <StatBar value={weapon.range} color="rgba(212,160,23,0.6)" />
          </div>
          <div className={styles.quickStat}>
            <span className={styles.quickLabel}>ROF</span>
            <StatBar value={weapon.fireRate} color="rgba(255,58,26,0.7)" />
          </div>
          {weapon.ttk && (
            <div className={styles.ttk}>
              TTK <strong>{weapon.ttk}</strong>
            </div>
          )}
        </div>

        <div className={styles.expandIcon}>{expanded ? '▲' : '▼'}</div>
      </div>

      {/* Détails expandables */}
      {expanded && weapon.build && weapon.build.length > 0 && (
        <div className={styles.weaponDetail}>
          <div className={styles.buildTitle}>MEILLEUR BUILD</div>
          <div className={styles.buildGrid}>
            {weapon.build.map((att, i) => (
              <div key={i} className={styles.buildSlot}>
                <span className={styles.buildSlotNum}>{i + 1}</span>
                <span className={styles.buildSlotName}>{att}</span>
              </div>
            ))}
          </div>
          {weapon.mobility && (
            <div className={styles.fullStats}>
              <div className={styles.fullStat}>
                <span>Mobilité</span>
                <StatBar value={weapon.mobility} color="#71B7FF" />
              </div>
              <div className={styles.fullStat}>
                <span>Contrôle</span>
                <StatBar value={weapon.recoil} color="#00CC66" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// SVG silhouettes par catégorie d'arme
function WeaponSilhouette({ type }) {
  const shapes = {
    AR: (
      <svg viewBox="0 0 120 40" fill="currentColor">
        <rect x="8" y="15" width="80" height="10" rx="1"/>
        <rect x="88" y="13" width="24" height="3" rx="1"/>
        <rect x="30" y="25" width="12" height="10" rx="1"/>
        <rect x="20" y="12" width="8" height="16" rx="1"/>
        <polygon points="8,15 2,20 8,25"/>
      </svg>
    ),
    SMG: (
      <svg viewBox="0 0 100 40" fill="currentColor">
        <rect x="10" y="14" width="60" height="11" rx="1"/>
        <rect x="70" y="12" width="18" height="3" rx="1"/>
        <rect x="28" y="25" width="10" height="10" rx="1"/>
        <rect x="18" y="11" width="7" height="14" rx="1"/>
        <polygon points="10,14 4,19 10,24"/>
      </svg>
    ),
    Sniper: (
      <svg viewBox="0 0 140 40" fill="currentColor">
        <rect x="5" y="17" width="110" height="8" rx="1"/>
        <rect x="115" y="15" width="20" height="3" rx="1"/>
        <rect x="50" y="9" width="14" height="8" rx="2"/>
        <rect x="35" y="25" width="10" height="10" rx="1"/>
        <rect x="22" y="14" width="7" height="13" rx="1"/>
      </svg>
    ),
    LMG: (
      <svg viewBox="0 0 120 45" fill="currentColor">
        <rect x="8" y="16" width="82" height="12" rx="1"/>
        <rect x="90" y="14" width="22" height="3" rx="1"/>
        <rect x="25" y="28" width="25" height="12" rx="1"/>
        <rect x="15" y="13" width="10" height="16" rx="1"/>
        <polygon points="8,16 2,22 8,28"/>
      </svg>
    ),
    Shotgun: (
      <svg viewBox="0 0 110 40" fill="currentColor">
        <rect x="8" y="15" width="70" height="12" rx="1"/>
        <rect x="78" y="14" width="22" height="4" rx="1"/>
        <rect x="30" y="27" width="12" height="10" rx="1"/>
        <rect x="20" y="12" width="9" height="16" rx="1"/>
      </svg>
    ),
  };
  return shapes[type] || shapes.AR;
}

function MapCard({ map }) {
  return (
    <div className={`${styles.mapCard} ${map.status === 'veto' ? styles.mapVeto : ''}`}>
      <div className={styles.mapHeader}>
        <span className={styles.mapName}>{map.name}</span>
        {map.status === 'veto' && <span className={styles.vetoTag}>SOUVENT VETO</span>}
      </div>
      <div className={styles.mapModes}>
        {map.modes.map(m => (
          <span key={m} className={styles.modeTag}>{m}</span>
        ))}
      </div>
      {map.notes && <p className={styles.mapNotes}>{map.notes}</p>}
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────

const TIER_ORDER = ['S', 'A', 'B', 'C', 'D'];

export default function MetaWeapons() {
  const [game, setGame]   = useState('warzone');
  const [filter, setFilter] = useState('all');
  const imageMap = useWeaponImages('warzone-bo7');

  const meta = game === 'warzone' ? WARZONE_META : CDL_META;

  const catLabels = ['all', 'AR', 'SMG', 'Sniper', 'LMG', 'Shotgun'];

  const filteredTiers = useMemo(() => {
    if (!meta.tiers) return {};

    function enrichWeapon(w) {
      const nameKey = w.name.toLowerCase().replace(/[\s-]/g, '');
      const img = imageMap[w.name.toLowerCase()]
        || imageMap[nameKey]
        || imageMap[w.id]
        || w.image;
      return img !== w.image ? { ...w, image: img } : w;
    }

    if (filter === 'all') {
      const out = {};
      for (const tier of TIER_ORDER) {
        if (meta.tiers[tier]) out[tier] = meta.tiers[tier].map(enrichWeapon);
      }
      return out;
    }
    const out = {};
    for (const tier of TIER_ORDER) {
      const weapons = (meta.tiers[tier] || []).filter(w => w.category === filter).map(enrichWeapon);
      if (weapons.length) out[tier] = weapons;
    }
    return out;
  }, [meta, filter, imageMap]);

  return (
    <>
      <MetaTags
        title="Meta Armes — CoD Pulse"
        description="Meta Warzone et CDL 2026. Tier list armes, meilleurs loadouts, map pool CDL saison 3."
      />

      <div className={styles.pageHeader}>
        <div className="container">
          <span className={styles.overline}>SAISON 3 · JUIN 2026</span>
          <h1 className={styles.title}>META</h1>
          <p className={styles.updated}>{meta.updated}</p>
        </div>
      </div>

      <div className="container">
        {/* Game tabs */}
        <div className={styles.gameTabs}>
          <button
            className={`${styles.gameTab} ${game === 'warzone' ? styles.gameTabActive : ''}`}
            onClick={() => { setGame('warzone'); setFilter('all'); }}
            data-game="warzone"
          >
            WARZONE
          </button>
          <button
            className={`${styles.gameTab} ${game === 'cdl' ? styles.gameTabActiveCDL : ''}`}
            onClick={() => { setGame('cdl'); setFilter('all'); }}
            data-game="cdl"
          >
            CDL
          </button>
        </div>

        {/* CDL — Map pool */}
        {game === 'cdl' && meta.mapPool && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionBar} />
              MAP POOL 2026
            </h2>
            <div className={styles.mapGrid}>
              {meta.mapPool.map(m => <MapCard key={m.name} map={m} />)}
            </div>
          </section>
        )}

        {/* Tier list */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionBar} />
              TIER LIST — {game === 'warzone' ? 'WARZONE BR' : 'CDL COMPETITIVE'}
            </h2>
            {/* Category filter */}
            <div className={styles.catFilters}>
              {catLabels.filter(c => c === 'all' || (c !== 'LMG' && c !== 'Shotgun') || game === 'warzone').map(c => (
                <button
                  key={c}
                  className={`${styles.catBtn} ${filter === c ? styles.catBtnActive : ''}`}
                  onClick={() => setFilter(c)}
                >
                  {c === 'all' ? 'TOUT' : c}
                </button>
              ))}
            </div>
          </div>

          {TIER_ORDER.filter(t => filteredTiers[t]).map(tier => (
            <div key={tier} className={styles.tierSection}>
              <div className={styles.tierLabel}>
                <TierBadge tier={tier} />
                <span className={styles.tierDesc}>
                  {tier === 'S' ? 'Méta dominant' : tier === 'A' ? 'Très viable' : tier === 'B' ? 'Situationnel' : 'A éviter'}
                </span>
              </div>
              <div className={styles.weaponList}>
                {filteredTiers[tier].map(w => (
                  <WeaponCard key={w.id} weapon={w} tier={tier} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Best loadouts */}
        {game === 'warzone' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionBar} />
              LOADOUTS PRO RECOMMANDES
            </h2>
            <div className={styles.loadoutGrid}>
              {[
                { name: 'META PRO S4', primary: 'MXR-17', secondary: 'Carbon 57', desc: 'Combo #1 des pros WRS saison 4. MXR-17 longue portée + Carbon 57 en close. Joué par Vitality, Falcons et FaZe.', tier: 'S', badge: 'TOP META' },
                { name: 'LONG RANGE', primary: 'DS20 Mirage', secondary: 'Dravec 45', desc: 'Référence pro. DS20 Mirage sniper support + Dravec 45 close. Adopté par Gen.G et Sentinels sur Urzikstan.', tier: 'S', badge: null },
                { name: 'SNIPER AGGRO', primary: 'Strider 300', secondary: 'Carbon 57', desc: 'Sniper one-shot + meilleur SMG. Combo ultra-agressif de HusKerrs (Sentinels) et HisoKa (Twisted Minds).', tier: 'S', badge: null },
                { name: 'VERSATILE', primary: 'AK-27', secondary: 'Dravec 45', desc: 'Combo polyvalent pour joueurs qui maîtrisent le recul. AK-27 #1 sur wzstats.gg long range + Dravec en close.', tier: 'A', badge: null },
              ].map((l, i) => (
                <div key={i} className={styles.loadoutCard}>
                  <div className={styles.loadoutHeader}>
                    <TierBadge tier={l.tier} />
                    <strong className={styles.loadoutName}>{l.name}</strong>
                    {l.badge && <span className={styles.newTag}>{l.badge}</span>}
                  </div>
                  <div className={styles.loadoutWeapons}>
                    <span className={styles.loadoutPrimary}>{l.primary}</span>
                    <span className={styles.loadoutPlus}>+</span>
                    <span className={styles.loadoutSecondary}>{l.secondary}</span>
                  </div>
                  <p className={styles.loadoutDesc}>{l.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
