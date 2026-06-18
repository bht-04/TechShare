const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ["smartphone", "security", "general"] },
    content: { type: String, required: true },
    link: { type: String, default: "" },
    author: { type: String, default: "Tình nguyện viên" },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", required: true },
    
    helpfulCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
    isHidden: { type: Boolean, default: false },
    hiddenReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);