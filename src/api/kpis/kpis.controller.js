const kpisService = require('../../core/kpis/kpis.service');

exports.getKpis = async (req, res, next) => {
    try {
        const month = req.query.month || null;
        const user = req.user || null;

        const data = await kpisService.getKpis({ month, user });
        res.json(data);
    } catch (error) {
        next(error);
    }
};