const { Router } = require('express');
const controller = require('../controllers/teamController');
const { apiRateLimiter } = require('../middlewares/rateLimit');

const router = Router();
router.use(apiRateLimiter);

router.get('/', controller.listTeams);
router.get('/players', controller.listPlayers);

module.exports = router;
