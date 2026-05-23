const { getChannel } = require("../config/rabbitmq");

const MOVIE_EVENTS_QUEUE = "movie_events_queue";
const MOVIE_EXCHANGE = "movie_exchange";
const MOVIE_SELECTION_QUEUE = "movie_selection_events_queue";

const handleMovieEvent = async (data) => {
  switch (data.type || data.action) {
    case "MOVIE_CREATED":
      console.log("Movie created event received:", {
        movieId: data.data?._id,
        title: data.data?.title,
      });
      break;

    case "MOVIE_SELECTED":
      console.log("Movie selected event received:", {
        movieId: data.movieId,
        timestamp: data.timestamp,
      });
      break;

    case "MOVIE_UPDATED":
      console.log("Movie updated event received:", {
        movieId: data.data?._id,
        title: data.data?.title,
      });
      break;

    case "MOVIE_DELETED":
      console.log("Movie deleted event received:", {
        movieId: data.data?._id,
        title: data.data?.title,
      });
      break;

    default:
      throw new Error("Unknown movie event type");
  }
};

const consumeQueue = async (channel, queue) => {
  await channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      await handleMovieEvent(data);
      channel.ack(msg);
    } catch (error) {
      console.error("Error processing movie event:", error);
      channel.nack(msg, false, false);
    }
  });
};

const startMovieEventConsumer = async () => {
  const channel = getChannel();

  await channel.assertQueue(MOVIE_EVENTS_QUEUE, { durable: true });
  await consumeQueue(channel, MOVIE_EVENTS_QUEUE);

  await channel.assertExchange(MOVIE_EXCHANGE, "fanout", { durable: false });
  await channel.assertQueue(MOVIE_SELECTION_QUEUE, { durable: true });
  await channel.bindQueue(MOVIE_SELECTION_QUEUE, MOVIE_EXCHANGE, "");
  await consumeQueue(channel, MOVIE_SELECTION_QUEUE);

  console.log("Waiting for movie events...");
};

module.exports = startMovieEventConsumer;
