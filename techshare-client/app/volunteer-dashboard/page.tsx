"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import Link from "next/link";
import { toast } from "sonner";

interface SupportRequest {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  address: string;
  supportType: string;
  description: string;
  urgency: string;
  supportDate: string;
  timeSlot: string;
  inPerson: boolean;
  online: boolean;
  status: string;
  volunteerId?: {
    _id: string;
    fullName: string;
  };
    preferredVolunteerId?: {  
    _id: string;
    fullName: string;
  };
  userId: string;
  createdAt: string;
}

export default function VolunteerDashboard() {
  const { user, isLoading } = useAuth();

  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [volunteerInfo, setVolunteerInfo] = useState<any>(null);

  // Check volunteer lần đầu
  useEffect(() => {
    if (user?.id) {
      checkVolunteerStatus();
    }
  }, [user]);

  // Auto reload requests mỗi 3s
  useEffect(() => {
    if (!user?.id || !volunteerInfo?._id) return;

    // load ngay lần đầu
    fetchRequests(volunteerInfo._id, user.id);

    // polling mỗi 3 giây
    const interval = setInterval(() => {
      fetchRequests(volunteerInfo._id, user.id);
    }, 3000);

    // cleanup
    return () => clearInterval(interval);
  }, [user?.id, volunteerInfo?._id]);

  const checkVolunteerStatus = async () => {
    try {
      const response = await api.get(`/volunteers/check/${user?.id}`);

      if (response.data.isRegistered) {
        setIsVolunteer(true);
        setVolunteerInfo(response.data.volunteer);
      } else {
        setIsVolunteer(false);
      }
    } catch (error) {
      console.error("Error checking volunteer status:", error);
      setIsVolunteer(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async (
    volunteerId?: string,
    userId?: string
  ) => {
    try {
      const url =
        volunteerId && userId
          ? `/requests/pending?volunteerId=${volunteerId}&userId=${userId}`
          : "/requests/pending";

      const response = await api.get(url);

      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const acceptRequest = async (
    requestId: string,
    requestClerkId: string
  ) => {
    if (!volunteerInfo) return;

    // chặn tự nhận support
    if (requestClerkId === user?.id) {
      toast.error("Bạn không thể tự hỗ trợ chính mình!");
      return;
    }

    try {
      await api.patch(`/requests/${requestId}/accept`, {
        volunteerId: volunteerInfo._id,
        volunteerName: volunteerInfo.fullName,
        userId: user?.id,
      });

      fetchRequests(volunteerInfo._id, user?.id);

      toast.success("Đã nhận hỗ trợ thành công!");
    } catch (error: any) {
      console.error("Error accepting request:", error);

      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra"
      );
    }
  };

  const startProgress = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}/status`, {
        status: "in-progress",
      });

      fetchRequests(volunteerInfo._id, user?.id);

      toast.success("Đã bắt đầu xử lý!");
    } catch (error) {
      console.error("Error:", error);

      toast.error("Có lỗi xảy ra");
    }
  };

  const requestComplete = async (requestId: string) => {
    try {
      await api.patch(`/requests/${requestId}/request-complete`);

      toast.success(
        "Đã gửi yêu cầu xác nhận hoàn thành! Chờ người dùng xác nhận."
      );

      fetchRequests(volunteerInfo._id, user?.id);
    } catch (error) {
      console.error("Error:", error);

      toast.error("Có lỗi xảy ra");
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges: Record<
      string,
      { color: string; text: string; bg: string }
    > = {
      low: {
        color: "text-gray-700",
        text: "Thấp",
        bg: "bg-gray-100",
      },
      medium: {
        color: "text-yellow-700",
        text: "Trung bình",
        bg: "bg-yellow-100",
      },
      high: {
        color: "text-red-700",
        text: "Cao",
        bg: "bg-red-100",
      },
    };

    return badges[urgency] || badges.medium;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<
      string,
      { color: string; text: string; bg: string }
    > = {
      pending: {
        color: "text-yellow-700",
        text: "Chờ xử lý",
        bg: "bg-yellow-100",
      },
      accepted: {
        color: "text-blue-700",
        text: "Đã nhận",
        bg: "bg-blue-100",
      },
      "in-progress": {
        color: "text-purple-700",
        text: "Đang xử lý",
        bg: "bg-purple-100",
      },
      pending_complete: {
        color: "text-orange-700",
        text: "Chờ xác nhận",
        bg: "bg-orange-100",
      },
      completed: {
        color: "text-green-700",
        text: "Hoàn thành",
        bg: "bg-green-100",
      },
      cancelled: {
        color: "text-red-700",
        text: "Đã hủy",
        bg: "bg-red-100",
      },
    };

    return badges[status] || badges.pending;
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
    if (activeTab === "available") {
      return req.status === "pending";
    }

    if (activeTab === "my") {
      return (
        req.volunteerId?._id === volunteerInfo?._id &&
        ["accepted", "in-progress", "pending_complete"].includes(
          req.status
        )
      );
    }

    if (activeTab === "completed") {
      return (
        req.volunteerId?._id === volunteerInfo?._id &&
        req.status === "completed"
      );
    }

    return true;
  });

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!isVolunteer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa phải Tình nguyện viên</h2>
        <p className="text-gray-500 mb-6">Đăng ký để trở thành tình nguyện viên và hỗ trợ cộng đồng</p>
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
    <div className="p-4 sm:p-6 h-[90vh]">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Tất cả các yêu cầu
            </h1>
            <p className="text-gray-600">
              Chào mừng {volunteerInfo?.fullName || "Tình nguyện viên"} | Quản lý các yêu cầu hỗ trợ
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        {[
          { key: "available", label: "Yêu cầu mới", count: requests.filter(r => r.status === "pending").length },
          { key: "my", label: "Đang xử lý", count: requests.filter(r => r.volunteerId?._id === volunteerInfo?._id && 
            ["accepted", "in-progress", "pending_complete"].includes(r.status)).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? "bg-white text-blue-600" : "bg-gray-200 text-gray-600"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Không có yêu cầu hỗ trợ nào</p>
          {activeTab === "available" && (
            <p className="text-sm text-gray-400 mt-2">Hãy chờ người dùng tạo yêu cầu mới</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredRequests.map((req) => {
            const urgencyBadge = getUrgencyBadge(req.urgency);
            const statusBadge = getStatusBadge(req.status);
            const isOwnRequest = req.userId === user?.id;
            
            return (
              <div
                key={req._id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm border transition-all ${
                  isOwnRequest ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100 hover:shadow-lg"
                }`}
              >
                {isOwnRequest && (
                  <div className="bg-yellow-100 text-yellow-700 text-xs text-center py-1">
                    Đây là yêu cầu của bạn, không thể tự hỗ trợ
                  </div>
                )}
                
                <div className="p-5 pb-3 border-b border-gray-100">
                 <div className="flex items-center justify-between mb-3">
  <div className="flex items-center gap-2">
    <span className="text-2xl">{getSupportTypeIcon(req.supportType)}</span>
    <h3 className="font-semibold text-gray-800">
      {getSupportTypeName(req.supportType)}
    </h3>
    {req.preferredVolunteerId?._id === volunteerInfo?._id && (
      <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
        ⭐ Được đề xuất
      </span>
    )}
  </div>
  <div className="flex gap-2">
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyBadge.bg} ${urgencyBadge.color}`}>
      {urgencyBadge.text}
    </span>
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
      {statusBadge.text}
    </span>
  </div>
</div>
                  
                  <div className="flex items-center gap-3 text-sm">
{req.avatarUrl ? (
  <img 
    src={req.avatarUrl} 
    alt={req.fullName}
    className="w-8 h-8 rounded-full object-cover"
  />
) : (
  <div className="w-8 h-8 bg-gradient-to-br rounded-full flex items-center justify-center text-black border-black border text-sm font-medium">
    {req.fullName ? req.fullName.charAt(0).toUpperCase() : "?"}
  </div>
)}
                    <div>
                      <p className="font-medium text-gray-800">{req.fullName || "Không có tên"}</p>
                      <p className="text-xs text-gray-400">{req.phone || "Không có SĐT"} | {req.email || "Không có email"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-gray-400">Địa chỉ</span>
                    <p className="text-gray-600 text-sm">{req.address || "Không có địa chỉ"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Mô tả yêu cầu:</p>
                    <p className="text-sm text-gray-700">{req.description || "Không có mô tả"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Ngày hỗ trợ</p>
                      <p className="font-medium text-gray-700">{req.supportDate || "Chưa xác định"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Khung giờ</p>
                      <p className="font-medium text-gray-700">{req.timeSlot || "Chưa xác định"}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {req.online && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Online</span>}
                    {req.inPerson && <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Trực tiếp</span>}
                  </div>
                </div>

<div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
  {req.status === "pending" && !isOwnRequest && (
    <button
      onClick={() => acceptRequest(req._id, req.userId)}
      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
    >
      Nhận hỗ trợ
    </button>
  )}
  
  {(req.status === "accepted" || req.status === "in-progress") && req.volunteerId?._id === volunteerInfo?._id && (
    <>
      <Link
        href={`/chat/${req._id}`}
        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 text-center"
      >
        Nhắn tin hỗ trợ
      </Link>
      {req.status === "in-progress" && (
        <button
          onClick={() => requestComplete(req._id)}
          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
        >
          Yêu cầu hoàn thành
        </button>
      )}
    </>
  )}
  
  {req.status === "pending_complete" && req.volunteerId?._id === volunteerInfo?._id && (
    <div className="w-full text-center text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
      Đã gửi yêu cầu hoàn thành, đang chờ người dùng xác nhận...
    </div>
  )}

  {req.status === "completed" && req.volunteerId?._id === volunteerInfo?._id && (
    <div className="w-full text-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">
      Đã hoàn thành - Chờ người dùng đánh giá
    </div>
  )}
</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}