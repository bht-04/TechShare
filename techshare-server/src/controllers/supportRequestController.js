const SupportRequest = require("../models/SupportRequest");
const Volunteer = require("../models/Volunteer");
const Survey = require("../models/Survey"); // Thêm model Survey
const { notifyRequestConfirmed } = require("../../socket");
const axios = require('axios');

const checkCanCreateRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const hasSurveyed = await Survey.findOne({ userId });
    
    if (hasSurveyed) {
      return res.json({
        canCreate: true,
        needReview: false,
        needReviewCount: 0,
        message: null
      });
    }
    
    const totalRequests = await SupportRequest.countDocuments({ userId });
    
    const needReview = totalRequests >= 3;
    
    res.json({
      canCreate: !needReview,
      needReview: needReview,
      needReviewCount: needReview ? 3 : 0,
      message: needReview ? "Bạn đã tạo 1 yêu cầu. Vui lòng đánh giá chất lượng TechShare để tiếp tục tạo yêu cầu mới." : null
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { 
      userId, 
      preferredVolunteerId,
      preferredVolunteerName,
      ...otherData 
    } = req.body;
    
    
    const hasSurveyed = await Survey.findOne({ userId });
    
    if (!hasSurveyed) {
      const totalRequests = await SupportRequest.countDocuments({ userId });
      if (totalRequests >= 3) {
        return res.status(400).json({
          message: "Bạn cần đánh giá chất lượng dịch vụ TechShare trước khi tạo yêu cầu mới",
          needReview: true
        });
      }
    }
    
    const newRequest = await SupportRequest.create({
      userId,
      ...otherData,
      preferredVolunteerId: preferredVolunteerId || null,
      preferredVolunteerName: preferredVolunteerName || "",
    });
    
    
    if (preferredVolunteerId) {
      try {
        const { sendNotification } = require("../../socket");
        sendNotification(preferredVolunteerId, {
          type: "new_request",
          title: "Yêu cầu hỗ trợ mới",
          message: `${newRequest.fullName} cần hỗ trợ về ${newRequest.supportType}`,
          requestId: newRequest._id,
        });
      } catch (socketError) {
        console.error("Socket error (notification not sent):", socketError.message);
      }
    }
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error in createRequest:", error);
    res.status(500).json({ message: error.message });
  }
};

const rateSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const request = await SupportRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    if (request.status !== "completed") {
      return res.status(400).json({ message: "Chỉ có thể đánh giá khi đã hoàn thành" });
    }
    
    if (request.systemRated) {
      return res.status(400).json({ message: "Bạn đã đánh giá yêu cầu này rồi" });
    }
    
    request.systemRating = rating;
    request.systemComment = comment;
    request.systemRatedAt = new Date();
    request.systemRated = true;
    await request.save();
  
    
    const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbySr02kCZSpXQcPGqGE_7wJ7jDcx9XJWSmeENqCs4lkXQAJz9l3c4JHRDVM8yrIqgGJ/exec";
    
    const payload = {
      userId: request.userId,
      fullName: request.fullName,
      rating: rating,
      comment: comment || "",
    };
    
    axios.post(GOOGLE_SHEET_WEBHOOK_URL, payload)
      .then(() => {
        console.log(`Đã lưu đánh giá của ${request.fullName} vào Google Sheet`);
      })
      .catch((err) => {
        console.error(`Lỗi gửi đến Google Sheet: ${err.message}`);
      });
    

    
    res.json({ 
      success: true,
      message: "Cảm ơn bạn đã đánh giá chất lượng dịch vụ của TechShare!",
      request 
    });
    
  } catch (error) {
    console.error("Error in rateSystem:", error);
    res.status(500).json({ message: error.message });
  }
};


const getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const Volunteer = require("../models/Volunteer");
    
    const currentUser = await Volunteer.findOne({ userId });
    const userAvatarUrl = currentUser?.avatarUrl || "";
    
    const requests = await SupportRequest.find({ userId })
      .populate("volunteerId", "fullName phone avatarUrl")
      .sort({ createdAt: -1 });
    
    const requestsWithAvatar = requests.map(req => {
      const reqObj = req.toObject();
      reqObj.avatarUrl = userAvatarUrl;
      return reqObj;
    });
    
    res.json(requestsWithAvatar);
  } catch (error) {
    console.error("Error in getUserRequests:", error);
    res.status(500).json({ message: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const { volunteerId, userId } = req.query;
    
    let query = {};
    
    if (volunteerId && userId) {
      query = {
        $or: [
          { 
            status: "pending",
            userId: { $ne: userId }
          },
          { 
            volunteerId: volunteerId,
            status: { $in: ["accepted", "in-progress", "pending_complete"] }
          }
        ]
      };
    } else {
      query = { status: "pending" };
    }
    
    const requests = await SupportRequest.find(query)
      .populate("volunteerId", "fullName phone avatarUrl")
      .populate("preferredVolunteerId", "fullName")
      .sort({ createdAt: -1 });
    const Volunteer = require("../models/Volunteer");
    for (let req of requests) {
      const userVolunteer = await Volunteer.findOne({ userId: req.userId });
      if (userVolunteer?.avatarUrl) {
        req._doc = req._doc || {};
        req._doc.avatarUrl = userVolunteer.avatarUrl;
      }
    }
    
    if (volunteerId) {
      requests.sort((a, b) => {
        const aIsPreferred = a.preferredVolunteerId?._id?.toString() === volunteerId;
        const bIsPreferred = b.preferredVolunteerId?._id?.toString() === volunteerId;
        
        if (aIsPreferred && !bIsPreferred) return -1;
        if (!aIsPreferred && bIsPreferred) return 1;
        return 0;
      });
    }
    
    res.json(requests);
  } catch (error) {
    console.error("Error in getPendingRequests:", error);
    res.status(500).json({ message: error.message });
  }
};
const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { volunteerId, volunteerName, userId } = req.body;
    
    const request = await SupportRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    if (request.userId === userId) {
      return res.status(400).json({ message: "Bạn không thể tự hỗ trợ chính mình" });
    }
    
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Yêu cầu này đã được nhận rồi" });
    }
    
    request.volunteerId = volunteerId;
    request.volunteerName = volunteerName;
    request.status = "accepted";
    await request.save();
    
    try {
      const { sendNotification } = require("../../socket");
      sendNotification(request.userId, {
        type: "request_accepted",
        title: "Yêu cầu đã được tiếp nhận",
        message: `${volunteerName} đã nhận hỗ trợ cho bạn`,
        requestId: request._id,
      });
    } catch (socketError) {
      console.error("Socket error:", socketError.message);
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await SupportRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const requestComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SupportRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    if (request.status !== "in-progress") {
      return res.status(400).json({ message: "Không thể hoàn thành ở trạng thái này" });
    }
    
    request.status = "pending_complete";
    await request.save();
    

    try {
      const { sendNotification } = require("../../socket");
      sendNotification(request.userId, {
        type: "request_complete",
        title: "Yêu cầu hoàn thành",
        message: `TNV ${request.volunteerName} đã hoàn thành hỗ trợ, vui lòng xác nhận`,
        requestId: request._id,
      });
    } catch (socketError) {
      console.error("Socket error:", socketError.message);
    }
    
    res.json({ message: "Đã gửi yêu cầu xác nhận hoàn thành", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SupportRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    if (request.status !== "pending_complete") {
      return res.status(400).json({ message: "Không có yêu cầu xác nhận nào" });
    }
    
    request.status = "completed";
    await request.save();
    
    if (request.volunteerId) {
      await Volunteer.findByIdAndUpdate(request.volunteerId, {
        $inc: { totalSupported: 1 }
      });
      
      notifyRequestConfirmed(request);
    }
    
    res.json({ message: "Đã xác nhận hoàn thành", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SupportRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    if (request.status !== "pending_complete") {
      return res.status(400).json({ message: "Không có yêu cầu xác nhận nào" });
    }
    
    request.status = "in-progress";
    await request.save();
    
    res.json({ message: "Yêu cầu hỗ trợ thêm đã được gửi", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    const request = await SupportRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    if (request.status !== "completed") {
      return res.status(400).json({ message: "Chỉ có thể đánh giá khi đã hoàn thành" });
    }
    
    if (request.rating) {
      return res.status(400).json({ message: "Bạn đã đánh giá yêu cầu này rồi" });
    }
    
    request.rating = rating;
    request.ratingComment = comment;
    request.ratedAt = new Date();
    request.status = "reviewed";
    await request.save();
    
    const Review = require("../models/Review");
    await Review.create({
      userId: request.userId,
      userName: request.fullName,
      userEmail: request.email,
      rating: rating,
      comment: comment,
      volunteerId: request.volunteerId,
      status: "approved"
    });
    
    if (request.volunteerId) {
      const allRatings = await SupportRequest.find({
        volunteerId: request.volunteerId,
        rating: { $ne: null }
      });
      
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      await Volunteer.findByIdAndUpdate(request.volunteerId, { rating: avgRating });
    }
    
    console.log(`Review saved for request ${id} with rating ${rating}`);
    res.json(request);
  } catch (error) {
    console.error("Error in rateRequest:", error);
    res.status(500).json({ message: error.message });
  }
};

const getUnratedRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await SupportRequest.find({
      userId,
      status: "completed",
      rating: null
    }).populate("volunteerId", "fullName phone avatarUrl rating totalSupported");
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await SupportRequest.findById(id)
      .populate("volunteerId", "fullName phone avatarUrl rating totalSupported");
    
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const stopSupport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const request = await SupportRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    }
    
    if (request.status !== "accepted" && request.status !== "in-progress") {
      return res.status(400).json({ 
        message: `Không thể dừng hỗ trợ ở trạng thái ${request.status}` 
      });
    }
    

    request.stopReason = reason || "Tình nguyện viên đã kết thúc hỗ trợ";
    request.status = "completed"; 
    await request.save();
    
    try {
      const { sendNotification } = require("../../socket");
      sendNotification(request.userId, {
        type: "support_stopped",
        title: "Hỗ trợ đã kết thúc",
        message: `${request.volunteerName} đã dừng hỗ trợ. Vui lòng đánh giá chất lượng dịch vụ.`,
        requestId: request._id,
      });
    } catch (socketError) {
      console.error("Socket error:", socketError.message);
    }
    
    res.json({ 
      success: true, 
      message: "Đã dừng hỗ trợ", 
      request 
    });
  } catch (error) {
    console.error("Error in stopSupport:", error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  checkCanCreateRequest,
  createRequest,
  getUserRequests,
  getPendingRequests,
  acceptRequest,
  updateStatus,
  requestComplete,
  confirmComplete,
  rejectComplete,
  rateRequest,
  getUnratedRequests,
  getRequestById,
  rateSystem,
  stopSupport
};