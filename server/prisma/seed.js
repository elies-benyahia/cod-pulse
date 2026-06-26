require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin2024!', 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@warzone-cdl.fr' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@warzone-cdl.fr',
      passwordHash: hash,
      role: 'admin'
    }
  });
  console.log('[SEED] Admin user created');

  // CDL Teams
  const cdlTeams = [
    { name: 'Atlanta FaZe', slug: 'atlanta-faze', category: 'cdl', region: 'North America' },
    { name: 'OpTic Texas', slug: 'optic-texas', category: 'cdl', region: 'North America' },
    { name: 'New York Subliners', slug: 'new-york-subliners', category: 'cdl', region: 'North America' },
    { name: 'LA Thieves', slug: 'la-thieves', category: 'cdl', region: 'North America' },
    { name: 'Minnesota RØKKR', slug: 'minnesota-rokkr', category: 'cdl', region: 'North America' },
    { name: 'Boston Breach', slug: 'boston-breach', category: 'cdl', region: 'North America' },
    { name: 'Seattle Surge', slug: 'seattle-surge', category: 'cdl', region: 'North America' },
    { name: 'Vegas Legion', slug: 'vegas-legion', category: 'cdl', region: 'North America' }
  ];

  for (const team of cdlTeams) {
    await prisma.team.upsert({
      where: { slug: team.slug },
      update: {},
      create: team
    });
  }
  console.log('[SEED] CDL teams created');

  // Warzone teams
  const wzTeams = [
    { name: 'FaZe Clan', slug: 'faze-clan-wz', category: 'warzone', region: 'Global' },
    { name: 'NaVi', slug: 'navi-wz', category: 'warzone', region: 'EU' },
    { name: 'Sentinels', slug: 'sentinels-wz', category: 'warzone', region: 'North America' }
  ];

  for (const team of wzTeams) {
    await prisma.team.upsert({
      where: { slug: team.slug },
      update: {},
      create: team
    });
  }
  console.log('[SEED] Warzone teams created');

  // Sample articles
  const articles = [
    {
      slug: 'warzone-bo7-season-1-meta-breakdown',
      title: 'Black Ops 7 Season 1: Complete Meta Breakdown — Best Weapons & Loadouts',
      summary: 'The Season 1 meta has settled. Here\'s what the top 250 are running, why the XM4 is still dominant, and which loadouts pros refuse to drop.',
      category: 'warzone',
      sourceName: 'Editorial',
      publishedAt: new Date('2025-03-15')
    },
    {
      slug: 'cdl-2025-major-1-results-atlanta-faze',
      title: 'CDL Major 1 Results: Atlanta FaZe Dominate, OpTic Struggle in Pool Play',
      summary: 'FaZe sweep their pool 3-0 while OpTic Texas suffers a shock loss to Boston Breach. Full results and bracket breakdown inside.',
      category: 'cdl',
      sourceName: 'Editorial',
      publishedAt: new Date('2025-03-10')
    },
    {
      slug: 'warzone-ranked-play-tips-diamond',
      title: 'How to Reach Diamond in Warzone Ranked Play — 7 Things You\'re Doing Wrong',
      summary: 'Diamond players share their placement strategies, rotation timings, and the one mistake that keeps most players stuck in Platinum.',
      category: 'warzone',
      sourceName: 'Editorial',
      publishedAt: new Date('2025-03-08')
    },
    {
      slug: 'cdl-roster-moves-2025-offseason',
      title: '2025 CDL Offseason: Every Roster Move Confirmed So Far',
      summary: 'Tracking all the signings, releases, and free agents as the 2025 CDL season takes shape. Updated daily.',
      category: 'cdl',
      sourceName: 'Editorial',
      publishedAt: new Date('2025-03-05')
    },
    {
      slug: 'warzone-patch-notes-1-5-0',
      title: 'Warzone Patch 1.5.0: SMG Tuning, Map Updates & New Contracts Explained',
      summary: 'Raven Software drops mid-season patch. We break down every change that matters for competitive play.',
      category: 'warzone',
      sourceName: 'Editorial',
      publishedAt: new Date('2025-03-01')
    },
    {
      slug: 'cdl-standings-week-4',
      title: 'CDL Season 2025 Standings After Week 4 — FaZe Still Unbeaten',
      summary: 'Atlanta FaZe maintain their perfect record. Full standings, win/loss records, and point differential analysis.',
      category: 'cdl',
      sourceName: 'Editorial',
      publishedAt: new Date('2025-02-28')
    }
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: article
    });
  }
  console.log('[SEED] Sample articles created');
}

main()
  .catch(e => {
    console.error('[SEED] Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
