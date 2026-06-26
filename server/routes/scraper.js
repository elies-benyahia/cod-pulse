const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { runScraper, getLastSyncInfo } = require('../services/scraperService');

const router = Router();

// Déclenchement manuel du scraper (admin uniquement)
router.post('/trigger', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const result = await runScraper();
    res.json({ message: 'Scraping completed', result });
  } catch (err) {
    next(err);
  }
});

router.get('/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const info = await getLastSyncInfo();
    res.json(info);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
