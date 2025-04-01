const {find} = require('../infrastructure/repositories/mongo-log.repository');

class LogController {
    static async getLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {};

            if (req.query.userId) filters.userId = req.query.userId;
            if (req.query.activityType) filters.activityType = req.query.activityType;
            if (req.query.startDate) filters.timestamp = { $gte: new Date(req.query.startDate) };
            if (req.query.endDate) filters.timestamp = { ...filters.timestamp, $lte: new Date(req.query.endDate) };

            const result = await
                find(filters, page, limit);
            console.log('Logs retrieved successfully');
            res.json(result);
        } catch (err) {
            console.error('Failed to retrieve logs:', err.message);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = LogController;