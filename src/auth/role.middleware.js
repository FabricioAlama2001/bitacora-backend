// src/auth/role.middleware.js
const { ROLES } = require('../constants/roles');

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'No tienes permisos' });
        }

        next();
    };
};

module.exports = {
    requireRole,
};