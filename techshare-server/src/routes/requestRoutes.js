const express = require("express");
const router = express.Router();
const supportRequestController = require("../controllers/supportRequestController");

// User routes
router.get("/check/:userId", supportRequestController.checkCanCreateRequest);
router.post("/", supportRequestController.createRequest);
router.get("/user/:userId", supportRequestController.getUserRequests);
router.get("/unrated/:userId", supportRequestController.getUnratedRequests);
router.patch("/:id/rate", supportRequestController.rateRequest);
router.patch("/:id/rate-system", supportRequestController.rateSystem);  // ✅ BỎ COMMENT
router.patch("/:id/confirm-complete", supportRequestController.confirmComplete);
router.patch("/:id/reject-complete", supportRequestController.rejectComplete);

// Volunteer routes
router.get("/pending", supportRequestController.getPendingRequests);
router.patch("/:id/accept", supportRequestController.acceptRequest);
router.patch("/:id/status", supportRequestController.updateStatus);
router.patch("/:id/request-complete", supportRequestController.requestComplete);
router.get("/:id", supportRequestController.getRequestById);
router.patch("/:id/stop-support", supportRequestController.stopSupport);

module.exports = router;