const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const moviesRoutes = require("./routes/movieRoutes");
const { connectRabbitMQ } = require("./config/rabbitmq");



dotenv.config();
const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());


app.use("/api/movies", moviesRoutes);


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('movies service db Connected successfully');
    } catch (error) {
        console.error(error.message);
    }
};

const connectRabbitMQAndStartServer = async () => {
    try {
        await connectRabbitMQ();
        console.log('Connected to RabbitMQ successfully');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
    }
}

connectDB();
connectRabbitMQAndStartServer();

app.listen(PORT, () => {
    console.log(`movies service running on port ${PORT}`);
});



