const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
        channel = await connection.createChannel();
        console.log("Movie Service connected to RabbitMQ");
        return channel;
    } catch (error) {
        console.error("Failed to connect to RabbitMQ in Movie Service:", error.message);
        throw error;
    }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
