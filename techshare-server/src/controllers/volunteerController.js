const Volunteer = require("../models/Volunteer");

const createVolunteer = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const existing = await Volunteer.findOne({ userId });
    if (existing) {
      return res.status(400).json({ 
        message: "Bạn đã đăng ký làm tình nguyện viên rồi!",
        errorCode: "ALREADY_REGISTERED"
      });
    }
    
    const volunteer = await Volunteer.create(req.body);
    res.status(201).json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVolunteers = async (req, res) => {
  try {
    const { search, supportType } = req.query;
    let query = { status: "active" };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }
    
    if (supportType && supportType !== "all") {
      query.supportType = supportType;
    }
    
    const volunteers = await Volunteer.find(query).sort({ createdAt: -1 });
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkVolunteerStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const volunteer = await Volunteer.findOne({ userId });
    
    res.json({
      isRegistered: !!volunteer,
      volunteer: volunteer || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVolunteerById = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ message: "Không tìm thấy tình nguyện viên" });
    }
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const incrementSupported = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { $inc: { totalSupported: 1 } },
      { new: true }
    );
    res.json(volunteer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Volunteer.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVolunteerReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const SupportRequest = require("../models/SupportRequest");
    
    const reviews = await SupportRequest.find({
      volunteerId: id,
      rating: { $ne: null }
    }).select("rating ratingComment fullName createdAt").sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createVolunteer,
  getVolunteers,
  checkVolunteerStatus,
  getVolunteerById,
  updateVolunteer,
  incrementSupported,
  getVolunteerReviews
};