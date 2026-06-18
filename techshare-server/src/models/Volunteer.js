const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    university: {
      type: String,
      required: true,
    },
    major: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    availableDays: {
      type: String,
      required: true,
    },
    supportType: {
      type: String,
      required: true,
      enum: ["smartphone", "computer", "security", "office", "other"],
    },
    inPerson: {
      type: Boolean,
      default: false,
    },
    online: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    otherSupportDesc: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "active",
    },
    totalSupported: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);