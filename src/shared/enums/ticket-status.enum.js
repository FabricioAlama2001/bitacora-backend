const TICKET_STATUS = Object.freeze({
    REPORTED: {
        code: 'REPORTED',
        label: 'Reportado',
    },
    IN_DEV: {
        code: 'IN_DEV',
        label: 'En desarrollo',
    },
    IN_QA: {
        code: 'IN_QA',
        label: 'En QA',
    },
    CLOSED: {
        code: 'CLOSED',
        label: 'Cerrado',
    },
});

module.exports = TICKET_STATUS;