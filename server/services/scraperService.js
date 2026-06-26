const axios = require('axios');
const cheerio = require('cheerio');
const prisma = require('./prismaClient');
const { slugify } = require('./articleService');

let lastSyncAt = null;
let lastSyncErrors = [];
let lastSyncCount = 0;

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ── Sources RSS — fiables, pas de JS requis ───────────────────
// Mots-clés CoD obligatoires pour tous les flux
const COD_KEYWORDS = [
  'warzone', 'call of duty', 'cod', 'bo7', 'black ops 7',
  'black ops', 'cdl', 'call of duty league', 'wrs', 'resurgence',
  'vanguard', 'modern warfare', 'activision esport',
];

const RSS_SOURCES = [
  {
    name: 'Dexerto',
    url: 'https://www.dexerto.com/feed/',
    category: 'warzone',
    codKeywords: COD_KEYWORDS,
  },
  {
    name: 'Dot Esports',
    url: 'https://dotesports.com/feed',
    category: 'cdl',
    codKeywords: COD_KEYWORDS,
  },
  {
    name: 'PCGamer CoD',
    url: 'https://www.pcgamer.com/rss/tag/call-of-duty/',
    category: 'warzone',
    codKeywords: COD_KEYWORDS, // double-vérification même avec URL filtrée
  },
  {
    name: 'TheGamer',
    url: 'https://www.thegamer.com/feed/',
    category: 'cdl',
    codKeywords: COD_KEYWORDS,
  },
];

// ── Extraire une image depuis le HTML/texte ───────────────────
function extractFirstImage(html) {
  if (!html) return null;
  const match = html.match(/src=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)/i)
    || html.match(/url=["']([^"']+\.(jpg|jpeg|png|webp)[^"']*)/i);
  return match ? match[1] : null;
}

function stripHtml(html) {
  return html
    ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
}

function isCodRelated(title, description, keywords) {
  if (!keywords) return true;
  const text = (title + ' ' + (description || '')).toLowerCase();
  return keywords.some(kw => {
    // Word boundary pour éviter "cod" dans "crocodile", "wrs" dans "awards", etc.
    const escaped = kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i').test(text);
  });
}

// ── Parser RSS générique (fonctionne pour Atom et RSS 2.0) ───
function parseRSS($, sourceName) {
  const articles = [];

  $('item, entry').each((_, el) => {
    const $el = $(el);

    const title = $el.find('title').first().text().trim().replace(/^<!\[CDATA\[|\]\]>$/g, '');

    // URL : <link> (texte), <link href>, ou <guid>
    const linkText = $el.find('link').first().text().trim();
    const linkHref = $el.find('link').first().attr('href');
    const guid = $el.find('guid').first().text().trim();
    const sourceUrl = linkHref || (linkText.startsWith('http') ? linkText : null) || guid || null;

    // Description
    const rawDesc = $el.find('description, summary, content').first().text().trim();
    const summary = stripHtml(rawDesc).substring(0, 500);

    // Date
    const rawDate = $el.find('pubDate, published, updated, dc\\:date').first().text().trim();
    let publishedAt;
    try { publishedAt = rawDate ? new Date(rawDate) : new Date(); }
    catch { publishedAt = new Date(); }

    // Image — plusieurs stratégies
    const mediaUrl = $el.find('media\\:content, media\\:thumbnail').first().attr('url');
    const enclosureUrl = $el.find('enclosure[type^="image"]').first().attr('url');
    const contentEncoded = $el.find('content\\:encoded').first().text();
    const imageUrl = mediaUrl || enclosureUrl || extractFirstImage(contentEncoded) || extractFirstImage(rawDesc) || null;

    if (title && sourceUrl && title.length > 8 && sourceUrl.startsWith('http')) {
      articles.push({ title, sourceUrl, summary: summary || null, imageUrl, publishedAt, sourceName });
    }
  });

  return articles.slice(0, 20);
}

// ── Catégorie intelligente selon le contenu ───────────────────
function detectCategory(title, defaultCategory) {
  const t = title.toLowerCase();
  if (t.includes('cdl') || t.includes('call of duty league') || t.includes('major') || t.includes('championship')) {
    return 'cdl';
  }
  if (t.includes('warzone') || t.includes('wrs') || t.includes('resurgence')) {
    return 'warzone';
  }
  return defaultCategory;
}

// ── Slug stable (sans timestamp) pour la déduplication ───────
function stableSlugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
}

// ── Upsert en BDD — déduplication par sourceUrl ──────────────
async function upsertArticle(article, defaultCategory) {
  const category = detectCategory(article.title, defaultCategory);

  // Vérifier si l'article existe déjà par URL source
  if (article.sourceUrl) {
    const existing = await prisma.article.findFirst({ where: { sourceUrl: article.sourceUrl } });
    if (existing) {
      // Mettre à jour l'image si manquante
      if (!existing.imageUrl && article.imageUrl) {
        await prisma.article.update({ where: { id: existing.id }, data: { imageUrl: article.imageUrl } });
      }
      return false; // déjà en BDD
    }
  }

  // Slug stable unique (ajoute un compteur si collision)
  let slug = stableSlugify(article.title);
  const exists = await prisma.article.findUnique({ where: { slug } });
  if (exists) slug = slug + '-' + Date.now().toString(36);

  try {
    await prisma.article.create({
      data: {
        slug,
        title: article.title,
        summary: article.summary,
        imageUrl: article.imageUrl,
        sourceUrl: article.sourceUrl,
        sourceName: article.sourceName,
        category,
        publishedAt: article.publishedAt,
      },
    });
    return true;
  } catch (err) {
    if (err.code === 'P2002') return false;
    throw err;
  }
}

// ── Scraper principal ─────────────────────────────────────────
const runScraper = async () => {
  lastSyncErrors = [];
  let totalSaved = 0;

  for (const source of RSS_SOURCES) {
    try {
      console.log(`[SCRAPER] Fetching RSS: ${source.name} — ${source.url}`);

      const response = await axios.get(source.url, {
        headers: HEADERS,
        timeout: 20000,
        responseType: 'text',
      });

      const $ = cheerio.load(response.data, { xmlMode: true, decodeEntities: true });
      let articles = parseRSS($, source.name);

      // Filtre CoD si nécessaire
      if (source.codKeywords) {
        articles = articles.filter(a => isCodRelated(a.title, a.summary || '', source.codKeywords));
      }

      console.log(`[SCRAPER] ${source.name}: ${articles.length} articles CoD trouvés`);

      for (const article of articles) {
        try {
          const saved = await upsertArticle(article, source.category);
          if (saved) totalSaved++;
        } catch (err) {
          lastSyncErrors.push(`${source.name} insert: ${err.message}`);
        }
      }
    } catch (err) {
      const msg = err.response ? `HTTP ${err.response.status}` : err.message;
      console.error(`[SCRAPER] Échec ${source.name}: ${msg}`);
      lastSyncErrors.push(`${source.name}: ${msg}`);
    }
  }

  lastSyncAt = new Date().toISOString();
  lastSyncCount = totalSaved;
  console.log(`[SCRAPER] Done — ${totalSaved} articles sauvegardés`);

  return { savedCount: totalSaved, errors: lastSyncErrors };
};

const getLastSyncInfo = async () => {
  const articleCount = await prisma.article.count();
  return { lastSyncAt, lastSyncCount, lastSyncErrors, totalArticlesInDb: articleCount };
};

module.exports = { runScraper, getLastSyncInfo };
