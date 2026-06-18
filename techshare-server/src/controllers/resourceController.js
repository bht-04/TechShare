const Resource = require("../models/Resource");
const { notifyNewArticle } = require("../../socket");


const getMyResources = async (req, res) => {
  try {

    const userId = req.headers["x-user-id"] || req.query.userId;
  
    
    if (!userId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }
    
    const Volunteer = require("../models/Volunteer");
    const volunteer = await Volunteer.findOne({ userId });
    
    if (!volunteer) {
      return res.status(403).json({ message: "Bạn chưa đăng ký tình nguyện viên" });
    }
    const resources = await Resource.find({ authorId: volunteer._id })
      .sort({ createdAt: -1 });
    
    
    res.json(resources);
  } catch (error) {
    console.error("Error in getMyResources:", error);
    res.status(500).json({ message: error.message });
  }
};


const getPublishedResources = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isHidden: false };
    
    if (category && category !== "all") {
      query.category = category;
    }
    
    const resources = await Resource.find(query)
      .populate("authorId", "fullName rating")
      .sort({ helpfulCount: -1, createdAt: -1 })
      .limit(50);
    
    res.json(resources);
  } catch (error) {
    console.error("Error in getPublishedResources:", error);
    res.status(500).json({ message: error.message });
  }
};


const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate("authorId", "fullName rating avatarUrl");
      
    if (!resource) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    
    resource.viewCount += 1;
    await resource.save();
    
    res.json(resource);
  } catch (error) {
    console.error("Error in getResourceById:", error);
    res.status(500).json({ message: error.message });
  }
};


const createResource = async (req, res) => {
  try {
    const { title, description, category, content, link, author, userId } = req.body;
    
    const Volunteer = require("../models/Volunteer");
    const volunteer = await Volunteer.findOne({ userId });
    
    if (!volunteer) {
      return res.status(403).json({ message: "Bạn cần đăng ký tình nguyện viên" });
    }
    
    const resource = await Resource.create({
      title,
      description,
      category,
      content,
      link: link || "",
      author: author || volunteer.fullName,
      authorId: volunteer._id, 
    });
    
     notifyNewArticle(resource);
    
    res.status(201).json({ success: true, message: "Đăng bài thành công!", resource });
  } catch (error) {
    console.error("Error in createResource:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const { title, description, category, content, link } = req.body;
    const resourceId = req.params.id;
    

    const currentResource = await Resource.findById(resourceId);
    
    if (!currentResource) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    

    const wasHidden = currentResource.isHidden === true;
    
    const updateData = {
      title,
      description,
      category,
      content,
      link: link || "",
    };
    
    if (wasHidden) {
      updateData.isHidden = false;
      updateData.reportCount = 0;
      updateData.hiddenReason = "";
    } else {
      console.log(`Article ${resourceId} updated normally (not hidden)`);
    }
    
    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      updateData,
      { new: true }
    );
    
    let message = "Cập nhật thành công!";
    if (wasHidden) {
      message = "Cập nhật thành công! Bài viết đã được hiển thị lại và reset báo cáo.";
    }
    
    res.json({ 
      success: true, 
      message,
      resource,
      wasReactivated: wasHidden 
    });
    
  } catch (error) {
    console.error("Error in updateResource:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    
    res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    console.error("Error in deleteResource:", error);
    res.status(500).json({ message: error.message });
  }
};

const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    await Resource.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error in markHelpful:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPublishedResources,
  getResourceById,
  createResource,
  getMyResources,
  updateResource,
  deleteResource,
  markHelpful,
};