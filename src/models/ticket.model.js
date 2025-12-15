// src/models/ticket.model.js
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
        proyecto: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        titulo: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        modulo: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        cliente: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        severidad: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        ticket: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        entorno: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        estado: {
            type: DataTypes.ENUM('REPORTADO', 'EN_DEV', 'EN_QA', 'CERRADO'),
            allowNull: false,
            defaultValue: 'REPORTADO',
        },
        reporteQa: {
            type: DataTypes.DATE,
            field: 'reporte_qa',
            allowNull: true,
        },
        envioDev: {
            type: DataTypes.DATE,
            field: 'envio_dev',
            allowNull: true,
        },
        retornoQa: {
            type: DataTypes.DATE,
            field: 'retorno_qa',
            allowNull: true,
        },
        cierre: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        vecesDevuelto: {
            type: DataTypes.INTEGER,
            field: 'veces_devuelto',
            defaultValue: 0,
        },
        descripcionBreve: {
            type: DataTypes.TEXT,
            field: 'descripcion_breve',
            allowNull: true,
        },
        responsableDev: {
            type: DataTypes.STRING(150),
            field: 'responsable_dev',
            allowNull: true,
        },
        horasQa: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'horas_qa',
            allowNull: true,
        },
        linkDocumento: {
            type: DataTypes.STRING(255),
            field: 'link_documento',
            allowNull: true,
        },
        creadoPorId: {
            type: DataTypes.INTEGER,
            field: 'creado_por_id',
            allowNull: true,
        },
    },
    {
        tableName: 'bitacora',
        timestamps: true,
    }
);

module.exports = Ticket;
