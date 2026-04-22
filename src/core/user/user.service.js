const { User } = require('../../models');
const { hashPassword, comparePassword } = require('../../utils/password.util');
const { USER_MESSAGES } = require('../../shared/messages');

async function createUser({ name, email, password, role }) {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        const error = new Error(USER_MESSAGES.EMAIL_ALREADY_REGISTERED);
        error.status = 400;
        throw error;
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
        name,
        email,
        passwordHash,
        role: role || 'QA',
    });

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
    };
}

async function getUsers() {
    return User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'avatarUrl', 'createdAt'],
    });
}

async function findByEmail(email) {
    return User.findOne({ where: { email } });
}

async function getProfile(userId) {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'role', 'avatarUrl', 'createdAt'],
    });

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    return user;
}

async function updateProfile(userId, { name, avatarUrl }) {
    const user = await User.findByPk(userId);

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    if (!name || !name.trim()) {
        const error = new Error('El nombre es obligatorio');
        error.status = 400;
        throw error;
    }

    await user.update({
        name: name.trim(),
        avatarUrl: avatarUrl?.trim() || null,
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
    };
}

async function changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findByPk(userId);

    if (!user) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        throw error;
    }

    if (!currentPassword || !newPassword) {
        const error = new Error('La contraseña actual y la nueva son obligatorias');
        error.status = 400;
        throw error;
    }

    const isValidPassword = await comparePassword(currentPassword, user.passwordHash);

    if (!isValidPassword) {
        const error = new Error('La contraseña actual no es correcta');
        error.status = 400;
        throw error;
    }

    if (newPassword.length < 6) {
        const error = new Error('La nueva contraseña debe tener al menos 6 caracteres');
        error.status = 400;
        throw error;
    }

    const passwordHash = await hashPassword(newPassword);

    await user.update({ passwordHash });

    return {
        message: 'Contraseña actualizada correctamente',
    };
}

module.exports = {
    createUser,
    getUsers,
    findByEmail,
    getProfile,
    updateProfile,
    changePassword,
};