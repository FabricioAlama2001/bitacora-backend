// src/models/user.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rol: {
            type: DataTypes.ENUM('QA', 'PM', 'ADMIN'),
            allowNull: false,
            defaultValue: 'QA',
        },
    },
    {
        tableName: 'usuarios',
        timestamps: true,
    }
);

module.exports = User;
