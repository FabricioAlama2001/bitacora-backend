const { User } = require('../../models');
const { hashPassword } = require('../../utils/password.util');
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
    };
}

async function getUsers() {
    return User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'createdAt'],
    });
}

async function findByEmail(email) {
    return User.findOne({ where: { email } });
}

module.exports = {
    createUser,
    getUsers,
    findByEmail,
};