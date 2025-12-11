// src/api/users/user.controller.js
const userService = require('../../core/user/user.service');

const listar = async (req, res, next) => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const registrar = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listar,
    registrar,
};
