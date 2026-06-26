import { Link } from 'react-router-dom';

const s = {
  footer: { marginTop: '6rem', paddingBottom: '2rem' },
  line: { height: 1, background: 'var(--gray-800)', marginBottom: '2rem' },
  inner: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--gutter)', flexWrap: 'wrap' },
  left: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  copy: { fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '0.1em', color: 'var(--white-off)' },
  madeBy: { fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-600)' },
  legal: { marginTop: '2rem', maxWidth: 'var(--max-w)', marginInline: 'auto', paddingInline: 'var(--gutter)', borderTop: '1px solid var(--gray-800)', paddingTop: '1.5rem' },
  legalP: { fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gray-600)', lineHeight: 1.7, maxWidth: '70ch' },
};

const linkStyle = { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-400)', textDecoration: 'none' };

export default function Footer() {
  return (
    <footer style={s.footer} role="contentinfo">
      <div style={s.line} aria-hidden="true" />
      <div style={s.inner}>
        <div style={s.left}>
          <span style={s.copy}>© {new Date().getFullYear()} COD PULSE</span>
          <span style={s.madeBy}>Site éditorial indépendant — Non affilié à Activision / Blizzard</span>
        </div>
        <nav style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }} aria-label="Liens pied de page">
          {[['warzone','Warzone'],['cdl','CDL'],['teams','Équipes'],['quiz','Quiz']].map(([to, label]) => (
            <Link key={to} to={`/${to}`} style={linkStyle}>{label}</Link>
          ))}
          <a href="#mentions-legales" style={linkStyle}>Mentions légales</a>
          <a href="#rgpd" style={linkStyle}>RGPD</a>
        </nav>
      </div>
      <div id="mentions-legales" style={s.legal}>
        <p style={s.legalP}>
          Ce site n'utilise aucun cookie de traçage tiers. Les données collectées (navigation) sont strictement limitées
          au fonctionnement du site et ne sont pas cédées à des tiers. Conformément au RGPD (UE 2016/679), vous disposez
          d'un droit d'accès, de rectification et de suppression de vos données. Contact : admin@warzone-cdl.fr
        </p>
      </div>
    </footer>
  );
}
