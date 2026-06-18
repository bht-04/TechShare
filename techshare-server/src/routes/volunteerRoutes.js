const express = require("express");
const router = express.Router();
const volunteerController = require("../controllers/volunteerController");

router.get("/", volunteerController.getVolunteers);
router.get("/check/:userId", volunteerController.checkVolunteerStatus);
router.get("/:id", volunteerController.getVolunteerById);

router.post("/", volunteerController.createVolunteer);
router.patch("/:id", volunteerController.updateVolunteer);
router.patch("/:id/increment", volunteerController.incrementSupported);
router.get("/:id/reviews", volunteerController.getVolunteerReviews);

module.exports = router;