
const  KafkaConsumer   = require('./infrastructure/messaging/kafka-consumer');
const express = require('express');
const LogController = require('./controller/log.controller');
require("dotenv").config();
const app = express();
app.use(express.json());

// MongoDB Connection
// index.js
// index.js
const mongoose = require('mongoose');

const connectWithRetry = async () => {
    const MAX_RETRIES = 5;
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const url = "mongodb://localhost:27017/"
            await mongoose.connect(url, {
                dbName: 'eventdb',
                authSource: 'admin',
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
            console.log(`Attempting Kafka setup (Attempt ${retryCount + 1})...`);
            await KafkaConsumer.start();
            console.log('Kafka setup completed successfully');
            return; // Exit loop on success
        } catch (err) {
            retryCount++;
            console.error(`Kafka setup attempt ${retryCount} failed. Retrying in 5 seconds...`, err.message);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retrying
        }
    }

    console.error('Kafka setup failed after 5 attempts. Exiting...');
    process.exit(1); // Exit process if Kafka setup fails
};

startKafka();

// Graceful Shutdown
process.on('SIGTERM', async () => {
    try {
        await KafkaConsumer.disconnect();
        console.log('Kafka consumer disconnected gracefully');
    } catch (err) {
        console.error('Error during Kafka consumer shutdown:', err.message);
    } finally {
        process.exit(0);
    }
});


app.get('/logs', LogController.getLogs);


// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});