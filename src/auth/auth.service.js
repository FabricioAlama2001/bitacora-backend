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

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
    }

    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
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