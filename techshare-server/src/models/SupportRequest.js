const mongoose = require("mongoose");

const supportRequestSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    supportType: { type: String, required: true },
    description: { type: String, required: true },
    urgency: { type: String, enum: ["low", "medium", "high"], required: true },
    supportDate: { type: String, required: true },
    timeSlot: { type: String, required: true },
    inPerson: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "in-progress", "pending_complete", "completed", "cancelled", "reviewed"],
      default: "pending"
    },
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },
    volunteerName: { type: String, default: "" },
        preferredVolunteerId: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer", default: null },
    preferredVolunteerName: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: null },
    ratingComment: { type: String, default: "" },
    ratedAt: { type: Date, default: null },
  
    systemRating: { type: Number, min: 1, max: 5, default: null },
    systemComment: { type: String, default: "" },
    systemRatedAt: { type: Date, default: null },
    systemRated: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportRequest", supportRequestSchema);