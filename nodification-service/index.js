const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");



dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());



const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        //later we have to change this to nodification service db
        console.log('user service db Connected successfully');
    } catch (error) {
        console.error(error.message);
    }
};

connectDB();
app.listen(PORT, () => {
    console.log(`user service running on port ${PORT}`);
});