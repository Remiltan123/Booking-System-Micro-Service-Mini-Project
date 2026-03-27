const { getChannel } = require("../config/rabbitmq");
const sendEmail = require("../service/emailService");

const queue = "forgot_passwordemail_queue";

const startEmailConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue(queue, { durable: true });

  console.log("Waiting for messages...");

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        const data = JSON.parse(msg.content.toString());

        console.log("Received:", data);

        await sendEmail(data.email, data.subject, data.html);

        channel.ack(msg);
      } catch (error) {
        console.error("Error processing message:", error);
        channel.nack(msg, false, false);
      }
    }
  });
};

module.exports = startEmailConsumer;