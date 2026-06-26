const prisma = require('./prismaClient');

const getMatches = async ({ category, limit = 10 } = {}) => {
  const where = category ? { category } : {};
  return prisma.matchResult.findMany({
    where,
    orderBy: { playedAt: 'desc' },
    take: parseInt(limit),
    include: {
      teamA: { select: { id: true, name: true, slug: true, logoUrl: true } },
      teamB: { select: { id: true, name: true, slug: true, logoUrl: true } }
    }
  });
};

module.exports = { getMatches };
