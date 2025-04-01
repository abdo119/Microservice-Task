const { Kafka, Partitioners} = require('kafkajs');

class KafkaProducer {
    constructor() {
        this.kafka = new Kafka({
            brokers: ["localhost:9092"],
            createPartitioner: Partitioners.LegacyPartitioner
        });
        this.producer = this.kafka.producer();
    }

    async connect() {
        await this.producer.connect();
    }

    async sendLog(logData) {
        await this.producer.send({
            topic: 'user-activity-logs',
            messages: [{ value: JSON.stringify(logData) }]
        });
    }
}

module.exports = new KafkaProducer();