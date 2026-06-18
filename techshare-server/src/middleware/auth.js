const Volunteer = require("../models/Volunteer");
const { verifyAccessToken } = require("../utils/tokens");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để thực hiện chức năng này",
        code: "UNAUTHORIZED",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Phiên đăng nhập đã hết hạn",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({
      message: "Token không hợp lệ",
      code: "INVALID_TOKEN",
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyAccessToken(token);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    }
    next();
  } catch {
    next();
  }
};

const isVolunteer = async (req, res, next) => {
  try {
    const userId = req.userId || req.headers["x-user-id"] || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để thực hiện chức năng này",
      });
    }

    const volunteer = await Volunteer.findOne({ userId });
    if (!volunteer) {
      return res.status(403).json({
        message: "Bạn cần đăng ký làm tình nguyện viên để thực hiện chức năng này",
      });
    }

    req.volunteer = volunteer;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authenticate, optionalAuth, isVolunteer };
