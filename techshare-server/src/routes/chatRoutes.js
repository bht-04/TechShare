const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { upload } = require("../config/cloudinary");

router.get("/conversations", chatController.getConversations);
router.get("/:requestId/messages", chatController.getMessages);
router.post("/:requestId/messages", chatController.sendMessage);
router.post("/:requestId/messages/media", upload.single("file"), chatController.sendMessageWithMedia);
router.patch("/:requestId/read", chatController.markAsRead);

module.exports = router;