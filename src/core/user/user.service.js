// src/core/user/user.service.js
const { User } = require('../../models');
const { hashPassword } = require('../../utils/password.util');

async function createUser({ nombre, email, password, rol }) {
    const existe = await User.findOne({ where: { email } });
    if (existe) {
        const error = new Error('El email ya está registrado');
        error.status = 400;
        throw error;
    }

    const passwordHash = await hashPassword(password);

    const nuevo = await User.create({
        nombre,
        email,
        passwordHash,
        rol: rol || 'QA',
    });

    // no devolvemos el hash
    return {
        id: nuevo.id,
        nombre: nuevo.nombre,
        email: nuevo.email,
        rol: nuevo.rol,
    };
}

async function getUsers() {
    const users = await User.findAll({
        attributes: ['id', 'nombre', 'email', 'rol', 'createdAt'],
    });
    return users;
}

async function findByEmail(email) {
    return User.findOne({ where: { email } });
}

module.exports = {
    createUser,
    getUsers,
    findByEmail,
};
