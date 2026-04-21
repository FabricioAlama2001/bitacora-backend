const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TicketWorklog = sequelize.define(
    'TicketWorklog',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        ticketId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        hours: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: false,
        },

        type: {
            type: DataTypes.ENUM('WORK', 'RETURN'),
            allowNull: false,
            defaultValue: 'WORK',
        },
        errorType: {
            type: DataTypes.STRING(60),
            allowNull: true,
        },
        errorDetail: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: 'ticket_worklogs',
        timestamps: true,
    }
);

module.exports = TicketWorklog;