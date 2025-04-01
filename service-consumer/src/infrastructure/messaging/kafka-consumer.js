const { Kafka } = require('kafkajs');
const { save } = require('../repositories/mongo-log.repository');
const ActivityLog = require("../../domain/entities/ActivityLog");

class KafkaConsumer {
    constructor() {
        this.kafka = new Kafka({
            brokers: ['localhost:9092'],
            retry: {
                initialRetryTime: 300,
                maxRetryTime: 30000,
                retries: 5
            },
            logLevel: require('kafkajs').logLevel.INFO
        });

        this.consumer = this.kafka.consumer({
            groupId: 'log-group',
            heartbeatInterval: 3000,
            sessionTimeout: 10000,
            rebalanceTimeout: 60000,
            allowAutoTopicCreation: true,
            autoOffsetReset: 'earliest'
        });

        this.running = false;
    }

    async start() {
        if (this.running) return;
        this.running = true;

        try {
            await this.consumer.connect();

            // Corrected event listener
            this.consumer.on(this.consumer.events.CRASH, ({ error }) => {
                console.error('Consumer crashed:', error);
                this._handleCriticalError(error);
            });

            await this.consumer.subscribe({ topic: 'user-activity-logs' });

            await this.consumer.run({
                autoCommit: false, // Disable auto-commit to control offsets manually
                eachMessage: async ({ topic, partition, message, heartbeat }) => {
                    try {
                        const log = JSON.parse(message.value.toString());
                        console.log('Received message:', log);
                        await save(log);
                        await this.consumer.commitOffsets([{ topic, partition, offset: message.offset }]);
                    } catch (err) {
                        console.error('Processing error:', err.message);
                    }
                }
            });

            console.log('Kafka consumer started successfully');
        } catch (err) {
            this._handleCriticalError(err);
        }
    }

    async disconnect() {
        if (!this.running) return;

        try {
            await this.consumer.disconnect();
            this.running = false;
            console.log('Kafka consumer disconnected');
        } catch (err) {
            console.error('Error during disconnect:', err);
        }
    }

    _handleCriticalError(err) {
        console.error('Critical consumer error:', err);
        // Implement graceful shutdown or restart logic
        process.exit(1);
    }
}

module.exports = new KafkaConsumer();