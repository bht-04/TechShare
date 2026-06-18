"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaEye, FaThumbsUp, FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "sonner";

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  helpfulCount: number;
  viewCount: number;
  isHidden: boolean;
  hiddenReason?: string;
  reportCount: number;
  createdAt: string;
}

interface Report {
  id: string;
  reason: string;
  reasonDetail: string;
  createdAt: string;
}

export default function MyArticlesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVolunteer, setIsVolunteer] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Resource | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 3;

  useEffect(() => {
    if (user?.id) {
      checkVolunteerStatus();
    }
  }, [user]);

  const checkVolunteerStatus = async () => {
    try {
      const response = await api.get(`/volunteers/check/${user?.id}`);
      if (response.data.isRegistered) {
        setIsVolunteer(true);
        fetchArticles();
      } else {
        setIsVolunteer(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsVolunteer(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await api.get("/resources/my", {
        params: { userId: user?.id }
      });
      setArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa bài viết này?")) {
      try {
        await api.delete(`/resources/${id}`);
        setArticles(articles.filter(a => a._id !== id));
        toast.success("Xóa thành công!");
      } catch (error) {
        console.error("Error:", error);
        toast.error("Có lỗi xảy ra");
      }
    }
  };

  const handleViewReports = async (article: Resource) => {
    setSelectedArticle(article);
    setShowReportModal(true);
    setLoadingReports(true);
    
    try {
      const response = await api.get(`/resources/${article._id}/reports`, {
        headers: { "x-user-id": user?.id }
      });
      setReports(response.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Không thể tải báo cáo");
    } finally {
      setLoadingReports(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { icon: string; name: string; color: string; bg: string }> = {
      smartphone: { icon: "", name: "Smartphone", color: "text-green-700", bg: "bg-green-100" },
      security: { icon: "", name: "Bảo mật", color: "text-red-700", bg: "bg-red-100" },
      general: { icon: "", name: "Kiến thức chung", color: "text-blue-700", bg: "bg-blue-100" },
    };
    return categories[category] || categories.general;
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: "Spam, quảng cáo",
      inappropriate: "Nội dung không phù hợp",
      misinformation: "Thông tin sai lệch",
      duplicate: "Trùng lặp nội dung",
      other: "Lý do khác",
    };
    return labels[reason] || reason;
  };


  const totalPages = Math.ceil(articles.length / itemsPerPage);
const paginatedArticles = articles.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

useEffect(() => {
  setCurrentPage(1);
}, []);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!isVolunteer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa phải Tình nguyện viên</h2>
        <p className="text-gray-500 mb-6">Đăng ký để trở thành tình nguyện viên và đăng bài</p>
        <Link
          href="/volunteer-registration"
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
        >
          Đăng ký ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[90vh] bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Quản lý bài viết
            </h1>
            <p className="text-gray-600">Đăng tải kiến thức công nghệ để hỗ trợ cộng đồng</p>
          </div>
          <Link
            href="/tinh-nguyen-vien/bai-viet/tao-moi"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
          >
            <FaPlus size={14} />
            <span>Đăng bài mới</span>
          </Link>
        </div>

  
        {articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 mb-4">Bạn chưa có bài viết nào.</p>
            <Link href="/tinh-nguyen-vien/bai-viet/tao-moi" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <FaPlus size={14} />
              <span>Đăng bài ngay</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {paginatedArticles.map((article) => {
              const category = getCategoryInfo(article.category);
              return (
                <div key={article._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      {/* Left content */}
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${category.bg} ${category.color}`}>
                            {category.icon} {category.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <FaEye size={11} /> {article.viewCount || 0}
                          </span>
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <FaThumbsUp size={11} /> {article.helpfulCount || 0}
                          </span>
                          {article.reportCount > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              article.reportCount >= 3 
                                ? "bg-red-100 text-red-700" 
                                : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {article.reportCount} báo cáo
                            </span>
                          )}
                          {article.isHidden && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <FaExclamationTriangle size={10} /> Đã ẩn
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{article.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{article.description}</p>
                        
                        {article.isHidden && article.hiddenReason && (
                          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                            <FaExclamationTriangle size={10} /> Lý do ẩn: {article.hiddenReason}
                          </p>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {article.reportCount > 0 && (
                          <button
                            onClick={() => handleViewReports(article)}
                            className="text-yellow-600 hover:text-yellow-700 text-sm flex items-center gap-1 px-2 py-1 rounded-md hover:bg-yellow-50 transition"
                            title="Xem báo cáo"
                          >
                            Báo cáo ({article.reportCount})
                          </button>
                        )}
                        <Link
                          href={`/tinh-nguyen-vien/bai-viet/sua/${article._id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition"
                        >
                          <FaEdit size={13} /> Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 transition"
                        >
                          <FaTrash size={12} /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
  <div className="flex items-center justify-center gap-3 mt-8">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
    >
      Trang trước
    </button>
    <span className="text-sm text-gray-600">
      Trang {currentPage} / {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
    >
      Trang sau
    </button>
  </div>
)}
          </div>
        )}
      </div>

      {showReportModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaExclamationTriangle /> Báo cáo bài viết
                </h3>
                <p className="text-sm text-yellow-100 mt-1 line-clamp-1">
                  {selectedArticle.title}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-600">
                    Trạng thái: {selectedArticle.isHidden ? (
                      <span className="text-red-600 font-medium flex items-center gap-1">Đã ẩn</span>
                    ) : (
                      <span className="text-green-600 font-medium flex items-center gap-1">Đang hiển thị</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    Số lần báo cáo: <strong>{selectedArticle.reportCount}/3</strong>
                  </p>
                </div>
                {selectedArticle.isHidden && (
                  <Link
                    href={`/tinh-nguyen-vien/bai-viet/sua/${selectedArticle._id}`}
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition text-center"
                  >
                    Sửa bài ngay
                  </Link>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] p-5 space-y-3">
              {loadingReports ? (
                <div className="text-center py-10 text-gray-500">Đang tải báo cáo...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>Chưa có báo cáo nào cho bài viết này</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {getReasonLabel(report.reason)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(report.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    {report.reasonDetail && (
                      <p className="text-sm text-gray-600 mt-2 pl-3 border-l-2 border-yellow-400">
                        "{report.reasonDetail}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <FaExclamationTriangle size={12} />
                Hãy chỉnh sửa bài viết dựa trên góp ý của cộng đồng để bài viết được hiển thị lại
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}