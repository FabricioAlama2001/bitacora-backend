const kpisService = require('../../core/kpis/kpis.service');

exports.getKpis = async (req, res, next) => {
    try {
        const month = req.query.month || null; // 'YYYY-MM' o null
        const user = req.user || null;         // lo pone authMiddleware

        const data = await kpisService.getKpis({ month, user });
        res.json(data);
    } catch (err) {
        next(err);
    }
};
