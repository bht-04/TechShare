const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportRequest",
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderType: {
      type: String,
      enum: ["user", "volunteer"],
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaType: {
      type: String,
      enum: ["image", "video", null],
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);