const sendEmail = require("../service/emailService");
const { forgotPasswordTemplate } = require("../emailTemplate/forgotPassword");
const { bookingConfirmationTemplate } = require("../emailTemplate/bookingConfirmation");
const { getChannel } = require("../config/rabbitmq");

const queues = ["forgot_passwordemail_queue", "booking_confirmation_queue"];

const startEmailConsumer = async () => {
  const channel = getChannel();

  for (const queue of queues) {
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const data = JSON.parse(msg.content.toString());
        let html = "";

        switch (data.type) {
          case "FORGOT_PASSWORD": {
            const resetLink = `${data.frontendUrl}/reset-password/${data.resetToken}`;
            html = forgotPasswordTemplate(resetLink);
            break;
          }

          case "BOOKING_CONFIRMED":
            html = bookingConfirmationTemplate(data);
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
  }

  console.log("Waiting for email messages...");
};

module.exports = startEmailConsumer;
