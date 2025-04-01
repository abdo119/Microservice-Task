
const  KafkaProducer  = require('./infrastructure/messaging/kafka-producer');
const express = require('express');
require("dotenv").config();
const app = express();
app.use(express.json());

const mongoose = require('mongoose');

const connectWithRetry = async () => {
    const MAX_RETRIES = 5;
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const url = "mongodb://localhost:27017/"
            await mongoose.connect( url, {
                dbName: 'eventdb',
                serverSelectionTimeoutMS: 5000
            });
            console.log('MongoDB connected successfully');
            await require('./infrastructure/repositories/mongo-log.repository').createIndexes();
            return;
        } catch (err) {
            retries++;
            console.error(`MongoDB connection attempt ${retries} failed. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    console.error('MongoDB connection failed after 5 attempts');
    process.exit(1);
};

connectWithRetry();
// Kafka Setup with Retry Logic
const startKafka = async () => {
    const MAX_RETRIES = 5;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
        try {
            await KafkaProducer.connect();
            console.log('Kafka setup completed successfully');
            return;
        } catch (err) {
            retryCount++;
            console.error(`Kafka setup attempt ${retryCount} failed. Retrying in 5 seconds...`, err.message);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retrying
        }
    }

    console.error('Kafka setup failed after 5 attempts. Exiting...');
    process.exit(1);
};

startKafka();


app.post('/log', async (req, res) => {
    try {
        await KafkaProducer.sendLog(req.body);
        res.status(202).json({ status: 'Log queued for processing' });
    } catch (err) {
        console.error('Failed to queue log:', err.message);
        res.status(500).json({ error: 'Failed to queue log for processing' });
    }
});


app.get('/health', (req, res) => {
    res.json({ status: 'UP' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});