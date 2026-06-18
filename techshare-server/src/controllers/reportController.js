const Report = require("../models/Report");
const Resource = require("../models/Resource");
const { notifyArticleReported } = require("../../socket");


const reportResource = async (req, res) => {
  try {
    const { resourceId, reporterId, reason, reasonDetail } = req.body;
  
    
    // Kiểm tra đã báo cáo chưa
    const existingReport = await Report.findOne({ resourceId, reporterId });
    if (existingReport) {
      return res.status(400).json({ message: "Bạn đã báo cáo bài viết này rồi" });
    }
    

    const report = await Report.create({
      resourceId,
      reporterId,
      reason,
      reasonDetail: reasonDetail || "",
    });
    

    const reportCount = await Report.countDocuments({ resourceId });
    await Resource.findByIdAndUpdate(resourceId, { reportCount });
    

    const resource = await Resource.findById(resourceId);
    

    if (reportCount >= 3) {
      await Resource.findByIdAndUpdate(resourceId, {
        isHidden: true,
        hiddenReason: `Bài viết bị báo cáo ${reportCount}/3 lần`
      });
    }
    

    if (resource && resource.authorId) {
      notifyArticleReported(resource.authorId, resource, reportCount);
    }
    
    res.json({ 
      success: true, 
      message: "Đã gửi báo cáo, cảm ơn bạn đã đóng góp cho cộng đồng" 
    });
  } catch (error) {
    console.error("Error in reportResource:", error);
    res.status(500).json({ message: error.message });
  }
};


const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("resourceId").sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getReportsByResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const userId = req.headers["x-user-id"] || req.query.userId;
    
    const Resource = require("../models/Resource");
    const Volunteer = require("../models/Volunteer");
    
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    
    const volunteer = await Volunteer.findOne({ userId });
    if (!volunteer || resource.authorId.toString() !== volunteer._id.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xem báo cáo của bài viết này" });
    }
    
    const reports = await Report.find({ resourceId }).sort({ createdAt: -1 });
    
    res.json({
      resource: {
        id: resource._id,
        title: resource.title,
        isHidden: resource.isHidden,
        reportCount: resource.reportCount,
        hiddenReason: resource.hiddenReason,
      },
      reports: reports.map(r => ({
        id: r._id,
        reason: r.reason,
        reasonDetail: r.reasonDetail,
        createdAt: r.createdAt,
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  reportResource,
  getReports,
  getReportsByResource
};