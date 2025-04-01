class ActivityLog {
    constructor({ id, userId, activityType, timestamp, details }) {
        this.id = id;
        this.userId = userId;
        this.activityType = activityType;
        this.timestamp = timestamp;
        this.details = details;
    }

}

module.exports = ActivityLog;