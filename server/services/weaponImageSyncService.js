'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WZSTATS_META_URL = 'https://wzstats.gg/warzone-2/full-loadouts';
const WZ_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.9',
  'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
  'Referer': 'https://wzstats.gg/',
};

// URLs vérifiées au 22 juin 2026 — Saison 4
const WEAPONS_FALLBACK = [
  { slug: 'ak-27',       name: 'AK-27',       type: 'AR',     tier: 'A', rank: 1,  role: 'Long Range',  proPick: true,  imageUrl: 'https://img.wzstats.gg/ak-27-bold_version5/gunDisplayLoadouts' },
  { slug: 'carbon-57',   name: 'Carbon 57',   type: 'SMG',    tier: 'S', rank: 1,  role: 'Close Range', proPick: true,  imageUrl: 'https://img.wzstats.gg/carbon-57-bold_version4/gunDisplayLoadouts' },
  { slug: 'ds20-mirage', name: 'DS20 Mirage', type: 'AR',     tier: 'S', rank: 2,  role: 'Long Range',  proPick: true,  imageUrl: 'https://img.wzstats.gg/ds20-mirage-bold_version4/gunDisplayLoadouts' },
  { slug: 'dravec-45',   name: 'Dravec 45',   type: 'SMG',    tier: 'S', rank: 2,  role: 'Close Range', proPick: true,  imageUrl: 'https://img.wzstats.gg/dravec-45-bold_version6/gunDisplayLoadouts' },
  { slug: 'mxr-17',      name: 'MXR-17',      type: 'AR',     tier: 'S', rank: 3,  role: 'Long Range',  proPick: true,  imageUrl: 'https://img.wzstats.gg/mxr-17-bold_version5/gunDisplayLoadouts' },
  { slug: 'vst',         name: 'VST',         type: 'SMG',    tier: 'S', rank: 3,  role: 'Close Range', proPick: false, imageUrl: 'https://img.wzstats.gg/vst-bold_version1/gunDisplayLoadouts' },
  { slug: 'vs-recon',    name: 'VS Recon',    type: 'Sniper', tier: 'A', rank: 1,  role: 'Sniper',      proPick: false, imageUrl: 'https://img.wzstats.gg/vs-recon-bold_version4/gunDisplayLoadouts' },
  { slug: 'hawker-hx',   name: 'Hawker HX',   type: 'Sniper', tier: 'A', rank: 2,  role: 'Sniper',      proPick: false, imageUrl: 'https://img.wzstats.gg/hawker-hx-bold_version3/gunDisplayLoadouts' },
  { slug: 'strider-300', name: 'Strider 300', type: 'Sniper', tier: 'S', rank: 1,  role: 'Sniper',      proPick: false, imageUrl: 'https://img.wzstats.gg/strider-300-bold_version1/gunDisplayLoadouts' },
  { slug: 'vx-compact',  name: 'VX Compact',  type: 'AR',     tier: 'A', rank: 6,  role: 'Long Range',  proPick: false, imageUrl: 'https://img.wzstats.gg/vx-compact-bold_version1/gunDisplayLoadouts' },
  { slug: 'voyak-kt-3',  name: 'Voyak KT-3',  type: 'AR',     tier: 'A', rank: 4,  role: 'Long Range',  proPick: false, imageUrl: 'https://img.wzstats.gg/voyak-kt-3-bold_version2/gunDisplayLoadouts' },
  { slug: 'kogot-7',     name: 'Kogot-7',     type: 'SMG',    tier: 'A', rank: 4,  role: 'Close Range', proPick: false, imageUrl: 'https://img.wzstats.gg/kogot-7-bold_version3/gunDisplayLoadouts' },
  { slug: 'mk35-isr',    name: 'MK35 ISR',    type: 'AR',     tier: 'A', rank: 5,  role: 'Long Range',  proPick: false, imageUrl: 'https://img.wzstats.gg/mk35-isr-bold_version1/gunDisplayLoadouts' },
  { slug: 'ryden-45k',   name: 'Ryden 45K',   type: 'SMG',    tier: 'A', rank: 5,  role: 'Close Range', proPick: false, imageUrl: 'https://img.wzstats.gg/ryden-45k-bold_version5/gunDisplayLoadouts' },
];

// Tente de scraper wzstats.gg — retourne null si Cloudflare bloque
async function scrapeWeaponImages() {
  try {
    const cheerio = require('cheerio');
    const res = await fetch(WZSTATS_META_URL, {
      headers: WZ_HEADERS,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok || res.status === 302) return null;

    const html = await res.text();
    // Si Cloudflare challenge intercepté
    if (html.includes('cf-challenge') || html.includes('Just a moment')) return null;

    const $ = cheerio.load(html);
    const found = new Map();

    $('img').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (!src.includes('img.wzstats.gg') || !src.includes('gunDisplayLoadouts')) return;

      const match = src.match(/img\.wzstats\.gg\/([^/]+)-bold_version(\d+)\/gunDisplayLoadouts/);
      if (!match) return;

      const slug = match[1];
      const container = $(el).closest('[class*="loadout"], [class*="gun"], div');
      const displayName = container.find('h2, h3, h4, p').first().text().trim() ||
        slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      found.set(slug, { slug, name: displayName, imageUrl: src });
    });

    return found.size > 0 ? found : null;
  } catch {
    return null;
  }
}

async function upsertWeapons(weapons) {
  let count = 0;
  for (const w of weapons) {
    try {
      await prisma.weapon.upsert({
        where: { slug: w.slug },
        update: { imageUrl: w.imageUrl, updatedAt: new Date() },
        create: {
          slug:    w.slug,
          name:    w.name,
          type:    w.type || null,
          tier:    w.tier || null,
          rank:    w.rank || null,
          role:    w.role || null,
          imageUrl: w.imageUrl,
          proPick: w.proPick || false,
          game:    'warzone-bo7',
        },
      });
      count++;
    } catch { /* skip individual failure */ }
  }
  return count;
}

async function syncWeaponImages() {
  console.log('[WeaponSync] Starting...');

  // Try live scrape first
  const scraped = await scrapeWeaponImages();
  if (scraped) {
    const weapons = Array.from(scraped.values());
    const count = await upsertWeapons(weapons);
    console.log(`[WeaponSync] Scraped ${count} weapons from wzstats.gg`);
    try {
      await prisma.syncLog.create({
        data: { type: 'weapons', status: 'success', count, message: `Scraped ${count} from wzstats.gg` },
      });
    } catch { /* DB log is optional */ }
    return { source: 'scrape', count };
  }

  // Fall back to hardcoded CDN URLs
  const count = await upsertWeapons(WEAPONS_FALLBACK);
  console.log(`[WeaponSync] Seeded ${count} weapons from fallback`);
  try {
    await prisma.syncLog.create({
      data: { type: 'weapons', status: 'fallback', count, message: `Fallback: ${count} weapons` },
    });
  } catch { /* DB log is optional */ }
  return { source: 'fallback', count };
}

// Seed once at startup if table is empty
async function seedWeaponsIfEmpty() {
  try {
    const existing = await prisma.weapon.count();
    if (existing > 0) {
      console.log(`[WeaponSync] ${existing} weapons already in DB — skip seed`);
      return;
    }
    await syncWeaponImages();
  } catch (err) {
    console.error('[WeaponSync] Seed error:', err.message);
  }
}

module.exports = { syncWeaponImages, seedWeaponsIfEmpty, WEAPONS_FALLBACK };
