const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes")
const { connectRabbitMQ } = require("./config/rabbitmq");
const eurekaClient = require("./config/eureka-client");


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.use("/api/users", userRoutes);

app.get("/api/users/test", (req, res) => {
    console.log(" REQUEST HANDLED BY PORT:", process.env.PORT);

    res.json({
        message: "Response from user-service",
        port: process.env.PORT
    });
});


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('user service db Connected successfully');
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
    console.log(`user service running on port ${PORT}`);

    eurekaClient.start((error) => {
        if (error) {
            console.log("Eureka registration failed ", error);
        } else {
            console.log("User Service registered in Eureka");
        }
    });
});



