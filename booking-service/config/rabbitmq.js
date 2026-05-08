const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
  const connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();
  console.log("Booking Service connected to RabbitMQ");
  return channel;
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
