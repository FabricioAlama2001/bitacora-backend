// src/auth/auth.service.js
const { findByEmail } = require('../core/user/user.service');
const { comparePassword } = require('../utils/password.util');
const { signToken } = require('./jwt.util');

async function login(email, password) {
    const user = await findByEmail(email);
    if (!user) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
    }

    const payload = {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
    };

    const token = signToken(payload);

    return {
        token,
        user: payload,
    };
}

module.exports = {
    login,
};
