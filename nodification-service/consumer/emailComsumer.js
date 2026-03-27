const sendEmail = require("../service/emailService");
const {forgotPasswordTemplate } = require("../emailTemplate/forgotPassword");
const { getChannel } = require("../config/rabbitmq");

const queue = "forgot_passwordemail_queue";

const startEmailConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue(queue, { durable: true });

  console.log("Waiting for email messages...");

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      let html = "";

      switch (data.type) {
        case "FORGOT_PASSWORD":
          const resetLink = `${data.frontendUrl}/reset-password/${data.resetToken}`;
          html = forgotPasswordTemplate(resetLink);
          break;

        default:
          throw new Error("Unknown email type");
      }

      await sendEmail(data.email, data.subject, html);

      channel.ack(msg);
      console.log("Email sent:", data.email);

    } catch (error) {
      console.error("Error processing message:", error);
      channel.nack(msg, false, false);
    }
  });
};

module.exports = startEmailConsumer;