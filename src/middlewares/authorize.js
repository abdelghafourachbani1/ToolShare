const AppError = require('../utils/AppError');

// Autorise l'accès uniquement aux rôles listés. À placer APRÈS authenticate.
// Exemple : router.post('/', authenticate, authorize(ROLES.ADMIN), controller.create)
function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) throw new AppError(401, 'Authentification requise');
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "Accès interdit : votre rôle n'est pas autorisé");
    }
    next();
  };
}

module.exports = authorize;
