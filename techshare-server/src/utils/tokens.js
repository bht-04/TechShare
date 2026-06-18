const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "techshare-dev-access-secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "techshare-dev-refresh-secret";

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m";
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

const generateAccessToken = (userId, email) =>
  jwt.sign({ userId, email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  ACCESS_SECRET,
  REFRESH_SECRET,
};
