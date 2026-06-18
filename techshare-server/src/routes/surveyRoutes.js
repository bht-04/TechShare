const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

router.post("/", surveyController.createSurvey);

module.exports = router;