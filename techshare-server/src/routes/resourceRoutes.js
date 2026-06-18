const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");
const reportController = require("../controllers/reportController");

// Public routes
router.get("/", resourceController.getPublishedResources);
router.get("/my", resourceController.getMyResources);
router.get("/:id", resourceController.getResourceById);

// Create, update, delete
router.post("/", resourceController.createResource);
router.put("/:id", resourceController.updateResource);
router.delete("/:id", resourceController.deleteResource);

// Helpful & Report
router.patch("/:id/helpful", resourceController.markHelpful);
router.post("/reports", reportController.reportResource);  // POST /api/resources/reports
router.get("/:resourceId/reports", reportController.getReportsByResource);

module.exports = router;