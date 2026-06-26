const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const articleRoutes = require('./routes/articles');
const teamRoutes = require('./routes/teams');
const matchRoutes = require('./routes/matches');
const authRoutes = require('./routes/auth');
const scraperRoutes = require('./routes/scraper');
const liveRoutes    = require('./routes/live');
const rankedRoutes  = require('./routes/ranked');
const weaponRoutes  = require('./routes/weapons');
const adminRoutes   = require('./routes/admin');

const app = express();

// --- Sécurité : headers HTTP sécurisés via Helmet ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// --- CORS restrictif : seules les origines autorisées peuvent appeler l'API ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Routes ---
app.use('/api/articles', articleRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/live',    liveRoutes);
app.use('/api/ranked',  rankedRoutes);
app.use('/api/weapons', weaponRoutes);
app.use('/api/admin',  adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Gestion des erreurs globales ---
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

module.exports = app;
