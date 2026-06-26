const { Router } = require('express');
const controller = require('../controllers/matchController');
const { apiRateLimiter } = require('../middlewares/rateLimit');

const router = Router();
router.use(apiRateLimiter);

router.get('/', controller.listMatches);

module.exports = router;
