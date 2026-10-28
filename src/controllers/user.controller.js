const User = require('../models/user.model');
const bcrypt = require('bcrypt');

// Modifier le profil (nom, email, etc.)
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; // Récupéré depuis le token JWT (verifyToken)
        const { nom, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { nom, email },
            { new: true, runValidators: true }
        ).select('-password'); // Exclure le mot de passe de la réponse

        if (!updatedUser) {
            const error = new Error("Utilisateur non trouvé.");
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "Profil mis à jour avec succès",
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// Modifier le mot de passe
const updatePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { ancienMotDePasse, nouveauMotDePasse } = req.body;

        if (!ancienMotDePasse || !nouveauMotDePasse) {
            const error = new Error("Veuillez fournir l'ancien et le nouveau mot de passe.");
            error.statusCode = 400;
            throw error;
        }

        // Récupérer l'utilisateur avec son mot de passe haché
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error("Utilisateur non trouvé.");
            error.statusCode = 404;
            throw error;
        }

        // Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(ancienMotDePasse, user.password);
        if (!isMatch) {
            const error = new Error("L'ancien mot de passe est incorrect.");
            error.statusCode = 401;
            throw error;
        }

        // Hacher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(nouveauMotDePasse, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Mot de passe mis à jour avec succès"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    updatePassword
};