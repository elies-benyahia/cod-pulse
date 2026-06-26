const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { loginRateLimiter } = require('../middlewares/rateLimit');

const router = Router();

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number')
  ],
  validate,
  controller.register
);

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
