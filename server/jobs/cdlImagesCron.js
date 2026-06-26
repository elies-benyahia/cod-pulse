'use strict';

const cron = require('node-cron');
const {
  scrapeCDLPlayerImages,
  applyKnownImages,
} = require('../services/cdlPlayerImageService');

let task = null;

function startCDLImagesCron() {
  // Appliquer immédiatement les IDs connus hardcodés (instantané)
  applyKnownImages()
    .then(count => console.log(`[CDLImages] ${count} known images applied at startup`))
    .catch(err => console.error('[CDLImages] applyKnownImages error:', err.message));

  // Scraping complet — 1 fois par semaine, lundi 05h00
  // Les rosters CDL changent rarement en mid-saison
  task = cron.schedule('0 5 * * 1', () => {
    console.log('[CRON] CDL player images full scrape triggered');
    scrapeCDLPlayerImages().catch(err =>
      console.error('[CRON] CDL scrape error:', err.message)
    );
  });

  console.log('[CRON] CDL player images: known applied at boot, full scrape every Monday 05:00');
}

function stopCDLImagesCron() {
  if (task) { task.stop(); task = null; }
}

module.exports = { startCDLImagesCron, stopCDLImagesCron };
