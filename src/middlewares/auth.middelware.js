const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: "Accès refusé. Aucun token fourni ou format invalide."
        });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_par_defaut');
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Token invalide ou expiré."
        });
    }
};

const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Accès interdit. Vous n'avez pas les droits nécessaires pour effectuer cette action."
            });
        }
        next();
    };
};

const verifyManagerStore = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next();
    }
    if (req.user.role === 'gestionnaire') {
        const targetStoreId = req.params.magasinId || req.body.magasinId || req.query.magasinId;

        if (!req.user.magasinId) {
            return res.status(403).json({
                success: false,
                message: "Accès refusé. Aucun magasin n'est affecté à votre compte gestionnaire."
            });
        }

        if (targetStoreId && targetStoreId !== req.user.magasinId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Accès refusé. Vous ne pouvez gérer que le matériel et les réservations de votre propre magasin."
            });
        }
    }

    next();
};

module.exports = {
    verifyToken,
    checkRole,
    verifyManagerStore
};