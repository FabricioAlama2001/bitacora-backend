const { Ticket, TicketWorklog, User } = require('../../models');
const { Op } = require('sequelize');

const {
  TICKET_STATUS,
  WORKLOG_TYPE,
  ERROR_TYPE,
  SEVERITY,
  ENVIRONMENT,
} = require('../../shared/enums');

const TICKET_MESSAGES = require('../../shared/messages/ticket.messages');
const WORKLOG_MESSAGES = require('../../shared/messages/worklog.messages');

const INCLUDE_TICKET_CREATOR = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'role', 'email'] },
];

const INCLUDE_WORKLOG_CREATOR = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'role', 'email'] },
];

const VALID_ERROR_TYPES = Object.keys(ERROR_TYPE);
const VALID_STATUSES = Object.keys(TICKET_STATUS);
const VALID_SEVERITIES = Object.values(SEVERITY).map((item) => item.label);
const VALID_ENVIRONMENTS = Object.keys(ENVIRONMENT);

const VALID_TRANSITIONS = {
  REPORTED: ['IN_DEV'],
  IN_DEV: ['IN_QA'],
  IN_QA: ['IN_DEV', 'CLOSED'],
  CLOSED: [],
};

function validateTicketCreate(data) {
  const errors = [];

  if (!data.project) errors.push('project es obligatorio');
  if (!data.title) errors.push('title es obligatorio');
  if (!data.severity) errors.push('severity es obligatoria');
  if (!data.environment) errors.push('environment es obligatorio');
  if (!data.shortDescription) errors.push('shortDescription es obligatoria');

  if (data.severity && !VALID_SEVERITIES.includes(data.severity)) {
    errors.push(`severity inválida (válidas: ${VALID_SEVERITIES.join(', ')})`);
  }

  if (data.environment && !VALID_ENVIRONMENTS.includes(data.environment)) {
    errors.push(`environment inválido (válidos: ${VALID_ENVIRONMENTS.join(', ')})`);
  }

  if (errors.length > 0) {
    const error = new Error(errors.join('; '));
    error.status = 400;
    throw error;
  }
}

function validateTicketUpdate(data) {
  const errors = [];

  if (data.severity && !VALID_SEVERITIES.includes(data.severity)) {
    errors.push(`severity inválida (válidas: ${VALID_SEVERITIES.join(', ')})`);
  }

  if (data.environment && !VALID_ENVIRONMENTS.includes(data.environment)) {
    errors.push(`environment inválido (válidos: ${VALID_ENVIRONMENTS.join(', ')})`);
  }

  if (errors.length > 0) {
    const error = new Error(errors.join('; '));
    error.status = 400;
    throw error;
  }
}

function validateTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

function normalizeMonth(monthStr) {
  if (!monthStr) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  return monthStr;
}

function getMonthRangeFromStr(monthStr) {
  const [yearStr, monthOnlyStr] = monthStr.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthOnlyStr) - 1;

  const start = new Date(year, monthIndex, 1, 0, 0, 0);
  const end = new Date(year, monthIndex + 1, 1, 0, 0, 0);

  return { start, end };
}

exports.listTickets = async () => {
  return Ticket.findAll({
    include: INCLUDE_TICKET_CREATOR,
    order: [['id', 'DESC']],
  });
};

exports.listTicketsByMonth = async (monthStr) => {
  const normalizedMonth = normalizeMonth(monthStr);
  const { start, end } = getMonthRangeFromStr(normalizedMonth);

  const inMonth = { qaReportDate: { [Op.gte]: start, [Op.lt]: end } };
  const openFromPreviousMonths = {
    status: { [Op.ne]: 'CLOSED' },
    qaReportDate: { [Op.lt]: start },
  };

  return Ticket.findAll({
    where: { [Op.or]: [inMonth, openFromPreviousMonths] },
    include: INCLUDE_TICKET_CREATOR,
    order: [['qaReportDate', 'ASC']],
  });
};

exports.getTicketById = async (id) => {
  const ticket = await Ticket.findByPk(id, {
    include: INCLUDE_TICKET_CREATOR,
  });

  if (!ticket) {
    const error = new Error(TICKET_MESSAGES.NOT_FOUND);
    error.status = 404;
    throw error;
  }

  return ticket;
};

exports.createTicket = async (data, user = null) => {
  validateTicketCreate(data);
  const now = new Date();

  const payload = {
    project: data.project,
    title: data.title,
    module: data.module,
    client: data.client,
    severity: data.severity,
    ticketNumber: data.ticketNumber,
    environment: data.environment,
    status: 'REPORTED',
    qaReportDate: data.qaReportDate || now,
    sentToDevDate: null,
    returnedToQaDate: null,
    closedAt: null,
    timesReturned: 0,
    shortDescription: data.shortDescription,
    devOwner: data.devOwner,
    qaHours: data.qaHours,
    documentLink: data.documentLink,
    createdById: user?.id || null,
  };

  const newTicket = await Ticket.create(payload);
  return newTicket;
};

exports.updateTicket = async (id, data) => {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) {
    const error = new Error(TICKET_MESSAGES.NOT_FOUND);
    error.status = 404;
    throw error;
  }

  validateTicketUpdate(data);

  const currentStatus = ticket.status;
  const newStatus = data.status ?? currentStatus;

  if (!VALID_STATUSES.includes(newStatus)) {
    const error = new Error(TICKET_MESSAGES.INVALID_STATUS);
    error.status = 400;
    throw error;
  }

  if (!validateTransition(currentStatus, newStatus)) {
    const error = new Error(
      `${TICKET_MESSAGES.INVALID_STATUS_TRANSITION}: ${currentStatus} -> ${newStatus}`
    );
    error.status = 400;
    throw error;
  }

  const now = new Date();
  let sentToDevDate = ticket.sentToDevDate;
  let returnedToQaDate = ticket.returnedToQaDate;
  let closedAt = ticket.closedAt;
  let timesReturned = ticket.timesReturned;

  if (data.sentToDevDate) sentToDevDate = data.sentToDevDate;
  if (data.returnedToQaDate) returnedToQaDate = data.returnedToQaDate;
  if (data.closedAt) closedAt = data.closedAt;

  if (currentStatus !== 'IN_DEV' && newStatus === 'IN_DEV') {
    if (!sentToDevDate) sentToDevDate = now;
  }

  if (currentStatus !== 'IN_QA' && newStatus === 'IN_QA') {
    if (!returnedToQaDate) returnedToQaDate = now;
  }

  if (currentStatus !== 'CLOSED' && newStatus === 'CLOSED') {
    if (!closedAt) closedAt = now;
  }

  await ticket.update({
    project: data.project ?? ticket.project,
    title: data.title ?? ticket.title,
    module: data.module ?? ticket.module,
    client: data.client ?? ticket.client,
    severity: data.severity ?? ticket.severity,
    ticketNumber: data.ticketNumber ?? ticket.ticketNumber,
    environment: data.environment ?? ticket.environment,
    status: newStatus,
    qaReportDate: data.qaReportDate ?? ticket.qaReportDate,
    sentToDevDate,
    returnedToQaDate,
    closedAt,
    timesReturned,
    shortDescription: data.shortDescription ?? ticket.shortDescription,
    devOwner: data.devOwner ?? ticket.devOwner,
    qaHours: data.qaHours ?? ticket.qaHours,
    documentLink: data.documentLink ?? ticket.documentLink,
  });

  return ticket;
};

exports.deleteTicket = async (id) => {
  const ticket = await Ticket.findByPk(id);

  if (!ticket) {
    const error = new Error(TICKET_MESSAGES.NOT_FOUND);
    error.status = 404;
    throw error;
  }

  await ticket.destroy();

  return { message: TICKET_MESSAGES.DELETE_SUCCESS };
};

function validateWorklogCreate(data) {
  const errors = [];

  if (!data.hours || Number(data.hours) <= 0) {
    errors.push(WORKLOG_MESSAGES.INVALID_HOURS);
  }

  if (data.type && !Object.keys(WORKLOG_TYPE).includes(data.type)) {
    errors.push(WORKLOG_MESSAGES.INVALID_TYPE);
  }

  if (data.errorType && !VALID_ERROR_TYPES.includes(String(data.errorType))) {
    errors.push(WORKLOG_MESSAGES.INVALID_ERROR_TYPE);
  }

  if (errors.length > 0) {
    const error = new Error(errors.join('; '));
    error.status = 400;
    throw error;
  }
}

exports.listWorklogs = async (ticketId) => {
  await exports.getTicketById(ticketId);

  return TicketWorklog.findAll({
    where: { ticketId },
    include: INCLUDE_WORKLOG_CREATOR,
    order: [['date', 'ASC'], ['id', 'ASC']],
  });
};

exports.addWorklog = async (ticketId, data, user) => {
  await exports.getTicketById(ticketId);
  validateWorklogCreate(data);

  const payload = {
    ticketId: Number(ticketId),
    date: data.date || new Date().toISOString().slice(0, 10),
    hours: data.hours,
    type: data.type || (data.isReturn ? 'RETURN' : 'WORK'),
    comment: data.comment || null,
    createdById: user?.id || null,
    errorType: data.errorType || null,
    errorDetail: data.errorDetail || null,
  };

  const worklog = await TicketWorklog.create(payload);

  if (data.docUrl && String(data.docUrl).trim()) {
    await Ticket.update(
      { documentLink: String(data.docUrl).trim() },
      { where: { id: Number(ticketId) } }
    );
  }

  const totalQaHours =
    (await TicketWorklog.sum('hours', { where: { ticketId: Number(ticketId) } })) || 0;

  const totalReturns = await TicketWorklog.count({
    where: { ticketId: Number(ticketId), type: 'RETURN' },
  });

  await Ticket.update(
    { qaHours: totalQaHours, timesReturned: totalReturns },
    { where: { id: Number(ticketId) } }
  );

  return worklog;
};

exports.deleteWorklog = async (ticketId, worklogId) => {
  await exports.getTicketById(ticketId);

  const worklog = await TicketWorklog.findOne({
    where: { id: worklogId, ticketId: Number(ticketId) },
  });

  if (!worklog) {
    const error = new Error(WORKLOG_MESSAGES.NOT_FOUND);
    error.status = 404;
    throw error;
  }

  await worklog.destroy();

  const totalQaHours =
    (await TicketWorklog.sum('hours', { where: { ticketId: Number(ticketId) } })) || 0;

  const totalReturns = await TicketWorklog.count({
    where: { ticketId: Number(ticketId), type: 'RETURN' },
  });

  await Ticket.update(
    { qaHours: totalQaHours, timesReturned: totalReturns },
    { where: { id: Number(ticketId) } }
  );

  return { message: WORKLOG_MESSAGES.DELETE_SUCCESS };
};

exports.listClosedTickets = async ({ page = 1, limit = 20, month, q } = {}) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (currentPage - 1) * pageSize;

  const where = {
    status: 'CLOSED',
  };

  if (month) {
    const normalizedMonth = normalizeMonth(month);
    const { start, end } = getMonthRangeFromStr(normalizedMonth);
    where.closedAt = { [Op.gte]: start, [Op.lt]: end };
  }

  if (q && String(q).trim()) {
    const term = `%${String(q).trim()}%`;
    where[Op.or] = [
      { project: { [Op.iLike]: term } },
      { title: { [Op.iLike]: term } },
      { client: { [Op.iLike]: term } },
      { devOwner: { [Op.iLike]: term } },
      { ticketNumber: { [Op.iLike]: term } },
    ];
  }

  const { count, rows } = await Ticket.findAndCountAll({
    where,
    include: INCLUDE_TICKET_CREATOR,
    order: [
      ['closedAt', 'DESC'],
      ['id', 'DESC'],
    ],
    limit: pageSize,
    offset,
  });

  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    rows,
    meta: {
      page: currentPage,
      limit: pageSize,
      total: count,
      totalPages,
    },
  };
};