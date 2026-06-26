require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const { startCronJobs } = require('./jobs/scraperJob');

const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`[SERVER] Running on port ${PORT} — env: ${process.env.NODE_ENV}`);
  if (process.env.SCRAPE_ENABLED === 'true') {
    startCronJobs();
  }
});
