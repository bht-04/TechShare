const express = require("express");
const cors = require("cors");

const volunteerRoutes = require("./routes/volunteerRoutes");
const requestRoutes = require("./routes/requestRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const chatRoutes = require("./routes/chatRoutes");
const surveyRoutes = require("./routes/surveyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/volunteers", volunteerRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/review", reviewRoutes)
app.use("/api/chat", chatRoutes);
app.use("/api/surveys", surveyRoutes);

module.exports = app;
