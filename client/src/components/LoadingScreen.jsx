import { useEffect, useState } from 'react';
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ onDone }) {
  const [phase, setPhase] = useState('in'); // in | out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('out'), 1800);
    const t2 = setTimeout(() => onDone(), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`${styles.screen} ${phase === 'out' ? styles.fadeOut : ''}`} aria-hidden="true">
      <div className={styles.scanline} />
      <div className={styles.grid} />

      <div className={styles.center}>
        <div className={styles.logoWrap}>
          <img src="/cod-pulse-logo.png" alt="CoD Pulse" className={styles.logo} />
          <div className={styles.glow} />
        </div>
        <div className={styles.bar}>
          <div className={styles.barFill} />
        </div>
        <p className={styles.label}>CHARGEMENT DU SYSTÈME</p>
      </div>

      <div className={styles.cornerTL} />
      <div className={styles.cornerTR} />
      <div className={styles.cornerBL} />
      <div className={styles.cornerBR} />
    </div>
  );
}
