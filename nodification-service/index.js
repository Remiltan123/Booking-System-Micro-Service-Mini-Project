const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectRabbitMQ } = require("./config/rabbitmq");
const startEmailConsumer = require("./consumer/emailComsumer");
const eurekaClient = require("./config/eureka-client");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const connectRabbitMQAndStartServer = async () => {
    try {
        await connectRabbitMQ();
        await startEmailConsumer();
        console.log('Connected to RabbitMQ successfully');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
    }
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('nodification service db Connected successfully');
    } catch (error) {
        console.error(error.message);
    }
};

connectDB();
connectRabbitMQAndStartServer();
app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);

    eurekaClient.start((error) => {
        if (error) {
            console.log("Eureka registration failed ", error);
        } else {
            console.log("Notification Service registered in Eureka");
        }
    });
});
