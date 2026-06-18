const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Survey", surveySchema);