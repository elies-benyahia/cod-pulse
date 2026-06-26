'use strict';

const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = Router();

// GET /api/weapons?tier=S&type=AR&game=warzone-bo7
router.get('/', async (req, res, next) => {
  try {
    const { tier, type, game = 'warzone-bo7' } = req.query;
    const where = { game };
    if (tier) where.tier = tier;
    if (type) where.type = type;

    const weapons = await prisma.weapon.findMany({
      where,
      orderBy: [{ tier: 'asc' }, { rank: 'asc' }],
    });

    res.json({ data: weapons, count: weapons.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/weapons/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const weapon = await prisma.weapon.findUnique({ where: { slug: req.params.slug } });
    if (!weapon) return res.status(404).json({ error: 'Not found' });
    res.json({ data: weapon });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
