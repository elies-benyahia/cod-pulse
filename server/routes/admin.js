'use strict';

const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const {
  scrapeCDLPlayerImages,
  applyKnownImages,
  getKnownImagesMap,
} = require('../services/cdlPlayerImageService');
const { syncWeaponImages } = require('../services/weaponImageSyncService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = Router();

// Toutes les routes admin requièrent authentification + rôle admin
router.use(authenticate, requireAdmin);

// ── GET /api/admin/status ──────────────────────────────────────
// Résumé de l'état des données
router.get('/status', async (req, res, next) => {
  try {
    const [players, weapons, syncLogs] = await Promise.all([
      prisma.player.count({ where: { imageUrl: { not: null } } }),
      prisma.weapon.count({ where: { imageUrl: { not: null } } }),
      prisma.syncLog.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    res.json({
      playersWithImage: players,
      weaponsWithImage: weapons,
      knownImages: Object.keys(getKnownImagesMap()).length,
      recentSyncs: syncLogs,
    });
  } catch (err) { next(err); }
});

// ── POST /api/admin/sync/cdl-images/known ─────────────────────
// Applique les IDs telescope hardcodés (instantané, ~1 sec)
router.post('/sync/cdl-images/known', async (req, res, next) => {
  try {
    const count = await applyKnownImages();
    res.json({ ok: true, message: `${count} images applied from known IDs`, count });
  } catch (err) { next(err); }
});

// ── POST /api/admin/sync/cdl-images ───────────────────────────
// Scraping Puppeteer complet de toutes les équipes CDL (~2-3 min)
router.post('/sync/cdl-images', (req, res) => {
  // Fire-and-forget — le scraping est long
  scrapeCDLPlayerImages()
    .then(count => console.log(`[Admin] CDL scrape done: ${count} synced`))
    .catch(err => console.error('[Admin] CDL scrape error:', err.message));

  res.json({
    ok: true,
    message: 'Scraping CDL player images démarré en arrière-plan (~2-3 min)',
    note: 'Surveillez les logs serveur pour suivre la progression',
  });
});

// ── POST /api/admin/sync/weapons ──────────────────────────────
// Force un sync immédiat des images armes
router.post('/sync/weapons', async (req, res, next) => {
  try {
    const result = await syncWeaponImages();
    res.json({ ok: true, ...result });
  } catch (err) { next(err); }
});

// ── GET /api/admin/players/images ─────────────────────────────
// Liste des joueurs avec/sans image
router.get('/players/images', async (req, res, next) => {
  try {
    const players = await prisma.player.findMany({
      select: {
        gamertag: true,
        imageUrl: true,
        imageSource: true,
        team: { select: { name: true, slug: true } },
      },
      orderBy: [{ team: { name: 'asc' } }, { gamertag: 'asc' }],
    });
    const withImage    = players.filter(p => p.imageUrl).length;
    const withoutImage = players.filter(p => !p.imageUrl).length;
    res.json({ total: players.length, withImage, withoutImage, players });
  } catch (err) { next(err); }
});

// ── PATCH /api/admin/players/:gamertag/image ───────────────────
// Mettre à jour manuellement l'image d'un joueur
router.patch('/players/:gamertag/image', async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || !imageUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'imageUrl must be a valid https URL' });
    }
    const player = await prisma.player.update({
      where: { gamertag: req.params.gamertag },
      data:  { imageUrl, imageSource: 'manual', updatedAt: new Date() },
    });
    res.json({ ok: true, player });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Player not found' });
    next(err);
  }
});

module.exports = router;
