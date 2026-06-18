const Review = require("../models/Review");
const { notifyNewReview } = require("../../socket");

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "approved" })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { userId, userName, userEmail, rating, comment, volunteerId } = req.body;

    const existingReview = await Review.findOne({ userId });
    if (existingReview) {
      return res.status(400).json({ 
        message: "Bạn đã đánh giá rồi. Cảm ơn bạn!" 
      });
    }

    const review = await Review.create({
      userId,
      userName,
      userEmail,
      rating,
      comment,
      volunteerId, 
    });

    if (volunteerId) {
      notifyNewReview(volunteerId, {
        userName,
        rating,
        comment,
        _id: review._id,
      });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReviews,
  createReview,
  getReviewsByUser,
};