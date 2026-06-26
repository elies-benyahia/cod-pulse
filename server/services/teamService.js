const prisma = require('./prismaClient');

const getTeams = async ({ category } = {}) => {
  const where = category ? { category } : {};
  return prisma.team.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { _count: { select: { players: true } } }
  });
};

const getPlayers = async ({ teamId } = {}) => {
  const where = teamId ? { teamId: parseInt(teamId) } : {};
  return prisma.player.findMany({
    where,
    orderBy: { gamertag: 'asc' },
    include: { team: { select: { name: true, slug: true } } }
  });
};

module.exports = { getTeams, getPlayers };
