const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    activityType: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: Object, default: {} }
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// Export as an object with methods
module.exports = {
    save: async (logData) => {
        try {
            const log = new ActivityLog(logData);
            await log.save();
            console.log('Log saved to MongoDB:', log.userId);
        } catch (err) {
            console.error('Failed to save log:', err.message);
            throw err;
        }
    },
    createIndexes: async () => {
        try {
            await ActivityLog.createIndexes([
                { key: { userId: 1 } },
                { key: { activityType: 1 } },
                { key: { timestamp: -1 } }
            ]);
            console.log('Indexes created successfully');
        } catch (err) {
            console.error('Index creation failed:', err.message);
        }
    },
    find: async (filters, page = 1, limit = 10) => {
        try {
            const skip = (page - 1) * limit;
            const [logs, total] = await Promise.all([
                ActivityLog.find(filters)
                    .sort({ timestamp: -1 })
                    .limit(limit)
                    .skip(skip)
                    .lean(),
                ActivityLog.countDocuments(filters)
            ]);

            return {
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (err) {
            console.error('Database query failed:', err.message);
            throw err;
        }
    }
};
