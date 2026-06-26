const cron = require('node-cron');
const { runScraper } = require('../services/scraperService');
const { refreshTop250 } = require('../services/top250Service');
const { syncWeaponImages, seedWeaponsIfEmpty } = require('../services/weaponImageSyncService');
const { startCDLImagesCron, stopCDLImagesCron } = require('./cdlImagesCron');

// Importé dynamiquement pour éviter les dépendances circulaires au boot
function getStaticEntries(mode) {
  try {
    const ranked = require('../routes/ranked');
    return ranked.__staticEntries?.[mode] || [];
  } catch { return []; }
}

let tasks = [];

const startCronJobs = () => {
  const interval = parseInt(process.env.SCRAPE_INTERVAL_MINUTES) || 60;
  const cronExpr = `*/${interval} * * * *`;

  console.log(`[CRON] Article scraper every ${interval} min`);
  console.log('[CRON] Top 250 refresh every 2 hours');
  console.log('[CRON] Weapon images sync every 6 hours');

  // Articles
  runScraper().catch(err => console.error('[CRON] Initial scrape:', err.message));
  tasks.push(cron.schedule(cronExpr, () => {
    runScraper().catch(err => console.error('[CRON] Scrape error:', err.message));
  }));

  // Top 250 — toutes les 2h
  tasks.push(cron.schedule('0 */2 * * *', async () => {
    console.log('[CRON] Top 250 refresh triggered');
    try {
      await refreshTop250('warzone', []);
      await refreshTop250('mp', []);
    } catch (err) {
      console.error('[CRON] Top 250 error:', err.message);
    }
  }));

  // Weapons — seed immédiat si vide, puis sync toutes les 6h
  seedWeaponsIfEmpty().catch(err => console.error('[CRON] Weapon seed error:', err.message));
  tasks.push(cron.schedule('0 */6 * * *', () => {
    syncWeaponImages().catch(err => console.error('[CRON] Weapon sync error:', err.message));
  }));

  // CDL player images — known IDs au boot + scraping hebdo
  startCDLImagesCron();
};

const stopCronJobs = () => {
  tasks.forEach(t => t.stop());
  tasks = [];
  stopCDLImagesCron();
};

module.exports = { startCronJobs, stopCronJobs };
