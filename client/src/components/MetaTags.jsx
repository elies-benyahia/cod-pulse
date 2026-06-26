import { useEffect } from 'react';

export default function MetaTags({ title, description, image, url }) {
  const fullTitle = title ? `${title} — WARZONE / CDL` : 'WARZONE / CDL ESPORT';

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (name, content, prop = false) => {
      if (!content) return;
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url || window.location.href, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
  }, [fullTitle, description, image, url]);

  return null;
}
