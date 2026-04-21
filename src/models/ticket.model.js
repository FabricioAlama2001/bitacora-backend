const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Ticket = sequelize.define(
    'Ticket',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        project: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        module: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        client: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        severity: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        ticketNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        environment: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('REPORTED', 'IN_DEV', 'IN_QA', 'CLOSED'),
            allowNull: false,
            defaultValue: 'REPORTED',
        },
        qaReportDate: {
            type: DataTypes.DATE,
            field: 'qa_report_date',
            allowNull: true,
        },
        sentToDevDate: {
            type: DataTypes.DATE,
            field: 'sent_to_dev_date',
            allowNull: true,
        },
        returnedToQaDate: {
            type: DataTypes.DATE,
            field: 'returned_to_qa_date',
            allowNull: true,
        },
        closedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        timesReturned: {
            type: DataTypes.INTEGER,
            field: 'times_returned',
            defaultValue: 0,
        },
        shortDescription: {
            type: DataTypes.TEXT,
            field: 'short_description',
            allowNull: true,
        },
        devOwner: {
            type: DataTypes.STRING(150),
            field: 'dev_owner',
            allowNull: true,
        },
        qaHours: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'qa_hours',
            allowNull: true,
        },
        documentLink: {
            type: DataTypes.STRING(255),
            field: 'document_link',
            allowNull: true,
        },
        createdById: {
            type: DataTypes.INTEGER,
            field: 'created_by_id',
            allowNull: true,
        },
    },
    {
        tableName: 'ticket',
        timestamps: true,
    }
);

module.exports = Ticket;