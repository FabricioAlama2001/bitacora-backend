// src/auth/role.middleware.js
const { ROLES } = require('../constants/roles');

const requireRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !rolesPermitidos.includes(user.rol)) {
            return res.status(403).json({ message: 'No tienes permisos' });
        }
        next();
    };
};

module.exports = {
    requireRole,
};
