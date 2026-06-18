const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
    reporterId: { type: String, required: true }, 
    reason: { 
      type: String, 
      enum: ["spam", "inappropriate", "misinformation", "duplicate", "other"],
      required: true 
    },
    reasonDetail: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["pending", "resolved", "dismissed"],
      default: "pending"
    },
  },
  { timestamps: true }
);

reportSchema.index({ resourceId: 1, reporterId: 1 }, { unique: true });

module.exports = mongoose.model("Report", reportSchema);