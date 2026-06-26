const teamService = require('../services/teamService');

const listTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getTeams({ category: req.query.category });
    res.json(teams);
  } catch (err) {
    next(err);
  }
};

const listPlayers = async (req, res, next) => {
  try {
    const players = await teamService.getPlayers({ teamId: req.query.team_id });
    res.json(players);
  } catch (err) {
    next(err);
  }
};

module.exports = { listTeams, listPlayers };
