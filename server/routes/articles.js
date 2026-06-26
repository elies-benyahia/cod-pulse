const { Router } = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/articleController');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { apiRateLimiter } = require('../middlewares/rateLimit');

const router = Router();
router.use(apiRateLimiter);

const articleBodyRules = [
  body('title').trim().notEmpty().isLength({ max: 500 }).escape(),
  body('category').isIn(['warzone', 'cdl']),
  body('summary').optional().trim().isLength({ max: 2000 }).escape(),
  body('content').optional().trim(),
  body('imageUrl').optional().isURL(),
  body('sourceUrl').optional().isURL(),
  body('sourceName').optional().trim().isLength({ max: 255 }).escape(),
  body('slug').optional().trim().isSlug().isLength({ max: 255 }),
  body('publishedAt').optional().isISO8601()
];

router.get('/', controller.list);
router.get('/stats', authenticate, requireAdmin, controller.stats);
router.get('/:slug', controller.getOne);
router.post('/', authenticate, requireAdmin, articleBodyRules, validate, controller.create);
router.put('/:id', authenticate, requireAdmin, [
  param('id').isInt({ gt: 0 }),
  ...articleBodyRules
], validate, controller.update);
router.delete('/:id', authenticate, requireAdmin, [
  param('id').isInt({ gt: 0 })
], validate, controller.remove);

module.exports = router;
