// src/auth/auth.controller.js
const authService = require('./auth.service');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result); // { token, user: { ... } }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
};
