// Optional payload validator hook for routes using custom validation middleware.
function validate(req, res, next) {
  const errors = Array.isArray(req.validationErrors) ? req.validationErrors : [];
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Données invalides', details: errors });
  }
  return next();
}

module.exports = { validate };
