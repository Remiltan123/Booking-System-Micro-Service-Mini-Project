const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  channel = await connection.createChannel();
  return channel;
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
