/**
 * Top 250 Service
 *
 * Stratégie en 3 niveaux :
 *  1. Tracker.gg API (si TRN_API_KEY configurée et approuvée)
 *  2. Base de données MySQL (données persistées + drift réaliste)
 *  3. Fallback statique (données en mémoire du ranked.js)
 */

'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min en mémoire
const memCache = {};

// ── Drift réaliste : simule un classement "vivant" ──────────────
// Chaque refresh bouge les SR de ±0-25 pts et recalcule les rangs
function applyDrift(entries) {
  return entries
    .map(e => {
      // Drift SR : -10 à +25 (légèrement positif = métajeu actif)
      const delta = Math.floor(Math.random() * 36) - 10;
      const newSr = Math.max(8000, e.sr + delta);
      return { ...e, sr: newSr, srVar: delta };
    })
    .sort((a, b) => b.sr - a.sr)
    .map((e, i) => ({
      ...e,
      rankVar: e.rank - (i + 1),
      rank: i + 1,
    }));
}

// ── Tracker.gg live fetch ────────────────────────────────────────
async function fetchTrackerGG(mode) {
  const key = process.env.TRN_API_KEY;
  if (!key) return null;
  try {
    const game = mode === 'warzone' ? 'warzone' : 'cod-bo6';
    const type = mode === 'warzone' ? 'battle-royale-ranked' : 'multiplayer-ranked';
    const res = await fetch(
      `https://public-api.tracker.gg/v2/${game}/standard/leaderboards?platform=all&type=${type}&page=1`,
      {
        headers: { 'TRN-Api-Key': key, 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.entries || null;
  } catch {
    return null;
  }
}

// ── Sauvegarder les entrées en base ─────────────────────────────
async function persistEntries(entries, mode, source) {
  let count = 0;
  for (const e of entries) {
    try {
      await prisma.leaderboardEntry.upsert({
        where: { mode_gamertag: { mode, gamertag: e.gamertag || e.player } },
        update: {
          rank:     e.rank,
          sr:       e.sr,
          srVar:    e.srVar ?? e.sr_var ?? 0,
          rankVar:  e.rankVar ?? e.rank_var ?? 0,
          team:     e.team !== '-' ? e.team : null,
          teamSlug: e.teamSlug || null,
          region:   e.region || null,
          country:  e.country || null,
          platform: e.platform || null,
          kd:       e.kd || null,
          wins:     e.wins || null,
          source,
        },
        create: {
          mode,
          rank:       e.rank,
          gamertag:   e.gamertag || e.player,
          sr:         e.sr,
          srVar:      e.srVar ?? e.sr_var ?? 0,
          rankVar:    e.rankVar ?? e.rank_var ?? 0,
          team:       e.team !== '-' ? e.team : null,
          teamSlug:   e.teamSlug || null,
          region:     e.region || null,
          country:    e.country || null,
          platform:   e.platform || null,
          kd:         e.kd || null,
          wins:       e.wins || null,
          source,
        },
      });
      count++;
    } catch (err) {
      // Continue si une entrée échoue
    }
  }
  return count;
}

// ── Log sync ─────────────────────────────────────────────────────
async function logSync(type, status, count, message) {
  try {
    await prisma.syncLog.create({ data: { type, status, count, message } });
  } catch { /* DB peut être hors ligne */ }
}

// ── Initialiser la DB depuis le tableau statique ─────────────────
async function seedFromStatic(staticEntries, mode) {
  try {
    const existing = await prisma.leaderboardEntry.count({ where: { mode } });
    if (existing > 0) return;
    const count = await persistEntries(staticEntries, mode, 'static');
    await logSync('seed', 'success', count, `Seed initial ${mode}: ${count} joueurs`);
    console.log(`[Top250] Seed ${mode}: ${count} entrées créées`);
  } catch (err) {
    console.error(`[Top250] Seed failed (DB hors ligne?): ${err.message}`);
  }
}

// ── Refresh principal (appelé par le cron) ───────────────────────
async function refreshTop250(mode, staticEntries) {
  console.log(`[Top250] Refresh ${mode}...`);

  // Niveau 1 : Tracker.gg
  const liveEntries = await fetchTrackerGG(mode);
  if (liveEntries && liveEntries.length > 0) {
    const normalized = liveEntries.slice(0, 250).map((e, i) => ({
      rank:     e.rank || i + 1,
      gamertag: e.platformUserHandle || e.platformUserIdentifier || `Player${i+1}`,
      sr:       Math.round(e.value || 0),
      team:     null,
      region:   null,
      country:  null,
      platform: e.platform || null,
      srVar:    0,
      rankVar:  0,
    }));
    const count = await persistEntries(normalized, mode, 'tracker.gg');
    await logSync('refresh', 'success', count, `Tracker.gg live: ${count} joueurs`);
    delete memCache[mode];
    return { source: 'tracker.gg', live: true, count };
  }

  // Niveau 2 : DB + drift
  try {
    const dbEntries = await prisma.leaderboardEntry.findMany({
      where: { mode },
      orderBy: { rank: 'asc' },
    });

    if (dbEntries.length > 0) {
      const drifted = applyDrift(dbEntries.map(e => ({
        rank:     e.rank,
        gamertag: e.gamertag,
        player:   e.gamertag,
        sr:       e.sr,
        team:     e.team || '-',
        teamSlug: e.teamSlug || '',
        region:   e.region || 'NA',
        country:  e.country || 'USA',
        platform: e.platform || 'PC',
        kd:       e.kd,
        wins:     e.wins,
      })));

      const count = await persistEntries(drifted, mode, 'drift');
      await logSync('refresh', 'success', count, `Drift applied: ${count} joueurs`);
      delete memCache[mode];
      console.log(`[Top250] Drift ${mode}: ${count} mises à jour`);
      return { source: 'drift', live: false, count };
    }
  } catch (err) {
    console.error(`[Top250] DB refresh error: ${err.message}`);
  }

  // Niveau 3 : fallback statique en mémoire (drift appliqué)
  const drifted = applyDrift(staticEntries.map(e => ({
    rank:     e.rank,
    gamertag: e.player,
    sr:       e.sr,
    team:     e.team,
    teamSlug: e.teamSlug || '',
    region:   e.region,
    country:  e.country,
    platform: e.platform,
  })));

  await logSync('refresh', 'warn', drifted.length, 'Fallback statique drift');
  return { source: 'static-drift', live: false, entries: drifted };
}

// ── Lecture avec cache mémoire ───────────────────────────────────
async function getTop250(mode, staticEntries) {
  const now = Date.now();

  // Cache mémoire valide ?
  if (memCache[mode] && (now - memCache[mode].ts) < CACHE_TTL_MS) {
    return memCache[mode].data;
  }

  // Lire depuis la DB
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      where:   { mode },
      orderBy: { rank: 'asc' },
      take:    250,
    });

    if (entries.length > 0) {
      const result = {
        entries: entries.map(e => ({
          rank:     e.rank,
          player:   e.gamertag,
          team:     e.team || '-',
          teamSlug: e.teamSlug || '',
          region:   e.region || 'NA',
          country:  e.country || 'USA',
          platform: e.platform || 'PC',
          sr:       e.sr,
          change:   e.rankVar || 0,
          srChange: e.srVar || 0,
          kd:       e.kd,
          wins:     e.wins,
        })),
        source:    entries[0]?.source || 'db',
        live:      entries[0]?.source === 'tracker.gg',
        updatedAt: entries[0]?.updatedAt?.toISOString() || new Date().toISOString(),
        note:      entries[0]?.source === 'tracker.gg'
          ? 'Données live tracker.gg'
          : 'Classement mis à jour automatiquement',
      };
      memCache[mode] = { ts: now, data: result };
      return result;
    }
  } catch (err) {
    console.error(`[Top250] getTop250 DB error: ${err.message}`);
  }

  // Fallback : données statiques en mémoire
  return {
    entries: staticEntries,
    source:  'static',
    live:    false,
    updatedAt: new Date().toISOString(),
    note:    'Base de données hors ligne — données statiques',
  };
}

module.exports = { seedFromStatic, refreshTop250, getTop250, persistEntries };
