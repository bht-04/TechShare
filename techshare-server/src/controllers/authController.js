const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../utils/tokens");

const formatUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  fullName: user.fullName,
  avatar: user.avatar || "",
});

const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email?.trim() || !password || !fullName?.trim()) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }

    const user = await User.create({
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName.trim(),
    });

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.status(201).json({
      user: formatUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password +refreshToken");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.json({
      user: formatUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Thiếu refresh token" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || user.refreshToken !== hashToken(refreshToken)) {
      return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ" });
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json({ user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, refresh, logout, getMe };
