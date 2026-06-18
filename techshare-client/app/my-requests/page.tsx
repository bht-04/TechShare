"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import Link from "next/link";
import { toast } from "sonner";

interface Volunteer {
  _id: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
}

interface SupportRequest {
  _id: string;
  supportType: string;
  description: string;
  status: string;
  urgency: string;
  supportDate: string;
  timeSlot: string;
  inPerson: boolean;
  online: boolean;
  avatarUrl?: string;
  volunteerId?: Volunteer;
  volunteerName?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyRequestsPage() {
  const { user, isLoading } = useAuth();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
const itemsPerPage = 5;

  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      fetchRequestsSilently();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [user]);

   const fetchRequestsSilently = async () => {
    if (isRefreshing) return; 
    
    setIsRefreshing(true);
    try {
      const response = await api.get(`/requests/user/${user?.id}`);
      setRequests(response.data);
    } catch (error) {
      console.error("Error refreshing requests:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get(`/requests/user/${user?.id}`);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmComplete = async (requestId: string) => {
    if (confirm("Bạn đã nhận được hỗ trợ? Xác nhận hoàn thành?")) {
      try {
        await api.patch(`/requests/${requestId}/confirm-complete`);
        toast.success("Cảm ơn bạn! Vui lòng đánh giá chất lượng hỗ trợ.");
        fetchRequests();
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    }
  };

  const rejectComplete = async (requestId: string) => {
    if (confirm("Bạn chưa hài lòng? Yêu cầu hỗ trợ thêm?")) {
      try {
        await api.patch(`/requests/${requestId}/reject-complete`);
        toast.success("Đã gửi yêu cầu hỗ trợ thêm đến tình nguyện viên.");
        fetchRequests();
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-700", text: "Chờ xử lý", icon: "" },
      accepted: { color: "bg-blue-100 text-blue-700", text: "Đã tiếp nhận", icon: "" },
      "in-progress": { color: "bg-purple-100 text-purple-700", text: "Đang xử lý", icon: "" },
      pending_complete: { color: "bg-orange-100 text-orange-700", text: "Chờ xác nhận", icon: "" },
      completed: { color: "bg-green-100 text-green-700", text: "Hoàn thành", icon: "" },
      reviewed: { color: "bg-gray-100 text-gray-700", text: "Đã đánh giá", icon: "" },
      cancelled: { color: "bg-red-100 text-red-700", text: "Đã hủy", icon: "" },
    };
    return badges[status] || badges.pending;
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      low: { color: "bg-gray-100 text-gray-600", text: "Thấp" },
      medium: { color: "bg-yellow-100 text-yellow-700", text: "Trung bình" },
      high: { color: "bg-red-100 text-red-700", text: "Cao" },
    };
    return badges[urgency] || badges.medium;
  };

  const getSupportTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      smartphone: "",
      computer: "",
      security: "",
      other: "",
    };
    return icons[type] || "";
  };

  const getSupportTypeName = (type: string) => {
    const names: Record<string, string> = {
      smartphone: "Hỗ trợ Smartphone",
      computer: "Hỗ trợ Máy tính",
      security: "Bảo mật Online",
      other: "Hỗ trợ khác",
    };
    return names[type] || type;
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return req.status === "pending" || req.status === "accepted";
    if (activeTab === "in-progress") return req.status === "in-progress" || req.status === "pending_complete";
    if (activeTab === "completed") return req.status === "completed" || req.status === "reviewed";
    if (activeTab === "cancelled") return req.status === "cancelled";
    return true;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
const paginatedRequests = filteredRequests.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);


const handleCreateAgain = (req: SupportRequest) => {
  const requestData = {
    supportType: req.supportType,
    description: req.description,
    urgency: req.urgency,
    supportDate: req.supportDate,
    timeSlot: req.timeSlot,
    inPerson: req.inPerson,
    online: req.online,
    otherSupportDesc: req.supportType === "other" ? req.description : "",
  };
  
  localStorage.setItem("reuseRequestData", JSON.stringify(requestData));
  window.location.href = "/RequestAssistance";
};

useEffect(() => {
  setCurrentPage(1);
}, [activeTab]);

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải danh sách yêu cầu...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Vui lòng đăng nhập để xem yêu cầu của bạn</p>
        <Link href="/" className="text-blue-600 mt-2 inline-block">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-[90vh]">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Yêu cầu hỗ trợ của tôi
        </h1>
        <p className="text-gray-600">Theo dõi trạng thái các yêu cầu hỗ trợ của bạn</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        {[
          { key: "all", label: "Tất cả", icon: "" },
          { key: "pending", label: "Chờ xử lý", icon: "" },
          { key: "in-progress", label: "Đang xử lý", icon: "" },
          { key: "completed", label: "Hoàn thành", icon: "" },
          { key: "cancelled", label: "Đã hủy", icon: "" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
            <span className="ml-1 text-xs">
              ({requests.filter((r) => {
                if (tab.key === "pending") return r.status === "pending" || r.status === "accepted";
                if (tab.key === "in-progress") return r.status === "in-progress" || r.status === "pending_complete";
                if (tab.key === "completed") return r.status === "completed" || r.status === "reviewed";
                if (tab.key === "cancelled") return r.status === "cancelled";
                return true;
              }).length})
            </span>
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Bạn chưa có yêu cầu hỗ trợ nào</p>
          <Link href="/RequestAssistance" className="text-blue-600 mt-2 inline-block">
            + Tạo yêu cầu ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedRequests.map((req) => {
            const statusBadge = getStatusBadge(req.status);
            const urgencyBadge = getUrgencyBadge(req.urgency);
            
            return (
              <div key={req._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {/* {req.avatarUrl ? (
  <img 
    src={req.avatarUrl} 
    alt="Avatar"
    className="w-10 h-10 rounded-xl object-cover"
  />
) : (
  <div className="w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center text-white text-xl">
    {getSupportTypeIcon(req.supportType)}
  </div>
)} */}
                    <div>
                      <h3 className="font-semibold text-gray-800">{getSupportTypeName(req.supportType)}</h3>
                      <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyBadge.color}`}>
                      {urgencyBadge.text}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                      {statusBadge.icon} {statusBadge.text}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{req.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Ngày hỗ trợ</p>
                    <p className="text-sm font-medium text-gray-700">{req.supportDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Khung giờ</p>
                    <p className="text-sm font-medium text-gray-700">{req.timeSlot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Hình thức</p>
                    <p className="text-sm font-medium text-gray-700">
                      {req.online && "Online "}
                      {req.inPerson && "Trực tiếp"}
                    </p>
                  </div>
                 <div>
  <p className="text-xs text-gray-400">Tình nguyện viên</p>
  <div className="flex items-center gap-2 mt-1">
    {req.volunteerId?.avatarUrl ? (
      <img 
        src={req.volunteerId.avatarUrl} 
        alt={req.volunteerId.fullName}
        className="w-6 h-6 rounded-full object-cover"
      />
    ) : (
      <div className="w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold">
        {(req.volunteerId?.fullName || req.volunteerName || "").charAt(0).toUpperCase()}
      </div>
    )}
    <p className="text-sm font-medium text-gray-700">
      {req.volunteerId?.fullName || req.volunteerName || "Đang chờ"}
    </p>
  </div>
</div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  {req.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={star <= req.rating! ? "text-yellow-400" : "text-gray-300"}>★</span>
                        ))}
                      </div>
                      {req.ratingComment && <span className="text-xs text-gray-400">"{req.ratingComment}"</span>}
                    </div>
                  )}

                  {req.status === "pending_complete" && !req.rating && (
                    <div className="flex gap-2 w-full">
                      <button onClick={() => confirmComplete(req._id)} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-s">
                        Xác nhận hoàn thành
                      </button>
                      <button onClick={() => rejectComplete(req._id)} className="px-4 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm">
                        Cần hỗ trợ thêm
                      </button>
                    </div>
                  )}

                 {req.status === "completed" && !req.rating && (
  <div className="flex gap-2">
    <Link
      href={`/rate-request/${req._id}`}
      className="px-4 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition"
    >
      Đánh giá ngay
    </Link>
    <button
      onClick={() => handleCreateAgain(req)}
      className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
    >
      Tạo lại
    </button>
  </div>
)}

{req.status === "reviewed" && (
  <button
    onClick={() => handleCreateAgain(req)}
    className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
  >
    + Tạo lại yêu cầu này
  </button>
)}

                  {(req.status === "accepted" || req.status === "in-progress") && req.volunteerId && (
                    <Link href={`/chat/${req._id}`} className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      Chat với Tình Nguyện Viên
                    </Link>
                  )}

                  {req.status === "pending" && (
                    <button onClick={async () => {
                      if (toast.error("Hủy yêu cầu thành công")) {
                        await api.patch(`/requests/${req._id}/status`, { status: "cancelled" });
                        fetchRequests();
                      }
                    }} className="px-4 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">
                      Hủy yêu cầu
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
  );
}