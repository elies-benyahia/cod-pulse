'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CDL_TEAM_URLS = [
  { slug: 'boston-breach',         name: 'Boston Breach',          url: 'https://www.callofdutyleague.com/en-us/teams/boston-breach' },
  { slug: 'carolina-royal-ravens', name: 'Carolina Royal Ravens',  url: 'https://www.callofdutyleague.com/en-us/teams/carolina-royal-ravens' },
  { slug: 'cloud9-new-york',       name: 'Cloud9 New York',        url: 'https://www.callofdutyleague.com/en-us/teams/cloud9-new-york' },
  { slug: 'faze-vegas',            name: 'FaZe Vegas',             url: 'https://www.callofdutyleague.com/en-us/teams/faze-vegas' },
  { slug: 'g2-minnesota',          name: 'G2 Minnesota',           url: 'https://www.callofdutyleague.com/en-us/teams/g2-minnesota' },
  { slug: 'los-angeles-thieves',   name: 'Los Angeles Thieves',    url: 'https://www.callofdutyleague.com/en-us/teams/los-angeles-thieves' },
  { slug: 'miami-heretics',        name: 'Miami Heretics',         url: 'https://www.callofdutyleague.com/en-us/teams/miami-heretics' },
  { slug: 'optic-texas',           name: 'OpTic Texas',            url: 'https://www.callofdutyleague.com/en-us/teams/optic-texas' },
  { slug: 'paris-gentle-mates',    name: 'Paris Gentle Mates',     url: 'https://www.callofdutyleague.com/en-us/teams/paris-gentle-mates' },
  { slug: 'riyadh-falcons',        name: 'Riyadh Falcons',         url: 'https://www.callofdutyleague.com/en-us/teams/riyadh-falcons' },
  { slug: 'toronto-koi',           name: 'Toronto KOI',            url: 'https://www.callofdutyleague.com/en-us/teams/toronto-koi' },
  { slug: 'vancouver-surge',       name: 'Vancouver Surge',        url: 'https://www.callofdutyleague.com/en-us/teams/vancouver-surge' },
];

// IDs telescope connus — mis à jour manuellement depuis DevTools
// Format : 'Gamertag (exact, case-sensitive)' → URL complète
const KNOWN_PLAYER_IMAGES = {
  // Boston Breach (IDs confirmés via inspection callofdutyleague.com)
  'Purj':   'https://telescope.callofduty.com/ts/codp/content/cdl/270.png',
  'Spart':  'https://telescope.callofduty.com/ts/codp/content/cdl/97.png',
  'TJHaLy': 'https://telescope.callofduty.com/ts/codp/content/cdl/107.png',
  'Afro':   'https://telescope.callofduty.com/ts/codp/content/cdl/581.png',
};

async function upsertPlayerImage(gamertag, imageUrl, source) {
  try {
    await prisma.player.upsert({
      where: { gamertag },
      update: { imageUrl, imageSource: source, updatedAt: new Date() },
      create: { gamertag, imageUrl, imageSource: source },
    });
    return true;
  } catch (err) {
    // Pas de joueur avec ce gamertag en DB — log discret
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CDLImages] No DB record for ${gamertag} — skipped`);
    }
    return false;
  }
}

// Applique instantanément les IDs connus (pas de Puppeteer)
async function applyKnownImages() {
  let count = 0;
  for (const [gamertag, imageUrl] of Object.entries(KNOWN_PLAYER_IMAGES)) {
    const ok = await upsertPlayerImage(gamertag, imageUrl, 'telescope');
    if (ok) {
      console.log(`[CDLImages] ✓ ${gamertag} → ${imageUrl}`);
      count++;
    }
  }
  console.log(`[CDLImages] ${count} known images applied`);
  return count;
}

// Scraping Puppeteer — intercepte les requêtes réseau telescope
async function scrapeCDLPlayerImages() {
  console.log('[CDLImages] Démarrage scraping Puppeteer...');
  let totalSynced = 0;

  // Import dynamique pour compatibilité CommonJS
  let puppeteer;
  try {
    const mod = await import('puppeteer');
    puppeteer = mod.default;
  } catch (err) {
    console.error('[CDLImages] Puppeteer non disponible:', err.message);
    return applyKnownImages();
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
    ],
  });

  for (const team of CDL_TEAM_URLS) {
    console.log(`[CDLImages] Scraping ${team.name}...`);
    const telescopeUrls = [];

    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      );

      // Intercepter toutes les réponses images telescope
      page.on('response', (response) => {
        const url = response.url();
        if (url.includes('telescope.callofduty.com') &&
            url.includes('/cdl/') &&
            url.endsWith('.png')) {
          telescopeUrls.push(url);
        }
      });

      await page.goto(team.url, { waitUntil: 'networkidle2', timeout: 35000 });

      // Attendre le chargement des composants React
      await page.waitForTimeout(2000);

      // Scroll pour déclencher lazy load
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 300) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 150));
        }
      });

      await page.waitForTimeout(2000);

      // Extraire gamertags + src images depuis le DOM
      const players = await page.evaluate(() => {
        const result = [];
        const selectors = [
          '[class*="Player"]',
          '[class*="player"]',
          '[class*="Athlete"]',
          '[class*="roster"]',
        ];
        const containers = document.querySelectorAll(selectors.join(','));

        containers.forEach(el => {
          const textEls = el.querySelectorAll('h2, h3, h4, [class*="name"], [class*="handle"], [class*="tag"]');
          const imgEl = el.querySelector('img[src*="telescope"]');
          if (imgEl) {
            const gamertag = Array.from(textEls)
              .map(t => t.textContent.trim())
              .find(t => t.length > 0 && t.length < 30) || '';
            result.push({ gamertag, src: imgEl.src });
          }
        });
        return result;
      });

      console.log(`[CDLImages] ${team.name}: ${players.length} joueurs DOM, ${telescopeUrls.length} URLs telescope`);

      // Associer joueurs ↔ images
      for (const player of players) {
        if (!player.gamertag || !player.src) continue;
        const ok = await upsertPlayerImage(player.gamertag, player.src, 'telescope');
        if (ok) totalSynced++;
      }

      // Si on n'a pas pu associer via DOM, utiliser les URLs dans l'ordre d'apparition
      // (dernier recours — moins précis)
      if (players.length === 0 && telescopeUrls.length > 0) {
        console.log(`[CDLImages] ${team.name}: pas de DOM match, ${telescopeUrls.length} URLs brutes interceptées`);
      }

      await page.close();
      await new Promise(r => setTimeout(r, 2500));

    } catch (err) {
      console.error(`[CDLImages] Erreur ${team.name}: ${err.message}`);
    }
  }

  await browser.close();

  try {
    await prisma.syncLog.create({
      data: {
        type:    'cdl_player_images',
        status:  totalSynced > 0 ? 'success' : 'warn',
        count:   totalSynced,
        message: `${totalSynced} joueurs synced depuis callofdutyleague.com`,
      },
    });
  } catch { /* DB log optionnel */ }

  console.log(`[CDLImages] Terminé — ${totalSynced} joueurs synced`);
  return totalSynced;
}

// Retourne les images connues comme map gamertag → URL (pour l'API)
function getKnownImagesMap() {
  return { ...KNOWN_PLAYER_IMAGES };
}

module.exports = {
  scrapeCDLPlayerImages,
  applyKnownImages,
  getKnownImagesMap,
  KNOWN_PLAYER_IMAGES,
};
