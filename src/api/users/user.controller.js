// src/api/users/user.controller.js
const userService = require('../../core/user/user.service');

const listUsers = async (req, res, next) => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
};

const registerUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};
const getMyProfile = async (req, res, next) => {
    try {
        const profile = await userService.getProfile(req.user.id);
        res.json(profile);
    } catch (error) {
        next(error);
    }
};

const updateMyProfile = async (req, res, next) => {
    try {
        const profile = await userService.updateProfile(req.user.id, req.body);
        res.json(profile);
    } catch (error) {
        next(error);
    }
};

const changeMyPassword = async (req, res, next) => {
    try {
        const result = await userService.changePassword(req.user.id, req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listUsers,
    registerUser,
    getMyProfile,
    updateMyProfile,
    changeMyPassword,
};