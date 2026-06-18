const SupportRequest = require("../models/SupportRequest");

const createRequest = async (req, res) => {
  try {
    const request = await SupportRequest.create(req.body);

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await SupportRequest.find();

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getRequests,
};
