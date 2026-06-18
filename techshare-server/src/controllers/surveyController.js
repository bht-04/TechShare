const Survey = require("../models/Survey");
const axios = require('axios');

const createSurvey = async (req, res) => {
  try {
    const { userId, fullName, email, rating, comment } = req.body;
    
    const survey = await Survey.create({
      userId,
      fullName,
      email,
      rating,
      comment,
    });
    
    const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbySr02kCZSpXQcPGqGE_7wJ7jDcx9XJWSmeENqCs4lkXQAJz9l3c4JHRDVM8yrIqgGJ/exec";
    
    const payload = {
      userId,
      fullName,
      rating,
      comment: comment || "",
    };
    
    axios.post(GOOGLE_SHEET_WEBHOOK_URL, payload)
      .then(() => console.log(`Đã lưu đánh giá của ${fullName} vào Google Sheet`))
      .catch(err => console.error(`Lỗi: ${err.message}`));
    
    res.status(201).json({ success: true, message: "Cảm ơn bạn đã đánh giá!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSurvey };