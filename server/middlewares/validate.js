const { validationResult } = require('express-validator');

// --- Middleware de validation express-validator ---
// Centralise la vérification des résultats de validation.
// Toutes les entrées utilisateur sont validées avant d'atteindre le contrôleur.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

module.exports = { validate };
