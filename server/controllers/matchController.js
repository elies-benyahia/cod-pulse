const matchService = require('../services/matchService');

const listMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getMatches({
      category: req.query.category,
      limit: req.query.limit
    });
    res.json(matches);
  } catch (err) {
    next(err);
  }
};

module.exports = { listMatches };
