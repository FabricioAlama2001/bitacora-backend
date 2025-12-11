// src/auth/auth.middleware.js
const { verifyToken } = require('./jwt.util');

const authMiddleware = (req, res, next) => {
    const header = req.headers['authorization'];

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // { id, nombre, email, rol }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = {
    authMiddleware,
};
