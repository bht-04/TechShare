const Message = require("../models/Message");
const SupportRequest = require("../models/SupportRequest");
const Volunteer = require("../models/Volunteer");
const { upload } = require("../config/cloudinary");


const sendMessageWithMedia = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { senderId, senderName, senderType, text } = req.body;
    
    let mediaUrl = null;
    let mediaType = null;
    
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";
    }
    
    const message = await Message.create({
      requestId,
      senderId,
      senderName,
      senderType,
      text: text || "",
      mediaUrl,
      mediaType,
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};


const getConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    
    const volunteer = await Volunteer.findOne({ userId: userId });
    const isVolunteer = !!volunteer;
    
    let requests = [];
    
    if (isVolunteer) {
      requests = await SupportRequest.find({
        $or: [
          { volunteerId: volunteer._id },
          { userId: userId }
        ]
      })
      .populate("volunteerId", "fullName phone avatarUrl")
      .sort({ updatedAt: -1 });
    } else {
      requests = await SupportRequest.find({
        userId: userId
      })
      .populate("volunteerId", "fullName phone avatarUrl")
      .sort({ updatedAt: -1 });
    }
  
    const conversations = await Promise.all(requests.map(async (req) => {
      const lastMessage = await Message.findOne({ requestId: req._id }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({
        requestId: req._id,
        read: false,
        senderId: { $ne: userId }
      });
      
      let otherUser = {};
      
      if (isVolunteer) {
        if (req.userId === userId && req.volunteerId) {
          otherUser = {
            id: req.volunteerId._id?.toString(),
            name: req.volunteerId.fullName || req.volunteerName,
            avatar: req.volunteerId?.avatarUrl || null,
          };
        } else if (req.volunteerId?._id?.toString() === volunteer._id.toString()) {
          otherUser = {
            id: req.userId,
            name: req.fullName,
            avatar: null,
          };
        } else {
          otherUser = {
            id: null,
            name: "Đang chờ tình nguyện viên...",
            avatar: null,
          };
        }
      } else {
        // User đang xem
        const volunteerInfo = req.volunteerId;
        if (volunteerInfo || req.volunteerName) {
          otherUser = {
            id: volunteerInfo?._id?.toString() || req.volunteerName,
            name: volunteerInfo?.fullName || req.volunteerName || "Tình nguyện viên",
            avatar: volunteerInfo?.avatarUrl || null,
          };
        } else {
          otherUser = {
            id: null,
            name: "Đang chờ tình nguyện viên...",
            avatar: null,
          };
        }
      }
      
      return {
        requestId: req._id,
        otherUser,
        lastMessage: lastMessage?.text || "Chưa có tin nhắn",
        lastMessageTime: lastMessage?.createdAt || req.updatedAt,
        unreadCount,
        status: req.status,
        supportType: req.supportType,
      };
    }));
    
    const validConversations = conversations.filter(conv => conv.otherUser.id);
    validConversations.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
    
    res.json(validConversations);
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const messages = await Message.find({ requestId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { senderId, senderName, senderType, text } = req.body;
    
    const message = await Message.create({
      requestId,
      senderId,
      senderName,
      senderType,
      text,
    });
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userId } = req.body;
    
    await Message.updateMany(
      { requestId, senderId: { $ne: userId }, read: false },
      { read: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  sendMessageWithMedia,
}; 