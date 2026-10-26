const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Erreur interne du serveur";
    let errors = null;

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = "Erreur de validation des données";
        errors = Object.values(err.errors).map(val => val.message);
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'champ';
        message = `Un enregistrement avec cette valeur pour le champ '${field}' existe déjà.`;
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Identifiant invalide : ${err.value}`;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { errorHandler };