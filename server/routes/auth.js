const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { loginRateLimiter } = require('../middlewares/rateLimit');

const router = Router();

router.post('/login',
  loginRateLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().isLength({ min: 6 })
  ],
  validate,
  controller.login
);

router.get('/me', authenticate, controller.me);

module.exports = router;
