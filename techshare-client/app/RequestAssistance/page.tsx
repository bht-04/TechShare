"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import SupportRequestForm from "@/components/SupportRequestForm";
import api from "@/app/services/api";
import Link from "next/link";
import SystemSurveyPopup from "@/components/SystemRatingPopup";
import { toast } from "sonner";

export default function SupportRequestPage() {
  const { user, isLoading } = useAuth();
  const [canCreate, setCanCreate] = useState(true);
  const [needSurvey, setNeedSurvey] = useState(false);
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [initialFormData, setInitialFormData] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      checkCanCreate();
    }
  }, [user]);

  const checkCanCreate = async () => {
    try {
      const response = await api.get(`/requests/check/${user?.id}`);
      setCanCreate(response.data.canCreate);
      setNeedSurvey(response.data.needReview);
      setMessage(response.data.message || "");
      
      if (response.data.needReview) {
        setShowSurveyPopup(true);
      }
    } catch (error) {
      console.error("Error checking:", error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
  const savedData = localStorage.getItem("reuseRequestData");
  if (savedData) {
    const requestData = JSON.parse(savedData);
    setInitialFormData(requestData);
    localStorage.removeItem("reuseRequestData");
    toast.success("Đã tải lại thông tin từ yêu cầu trước!");
  }
}, []);

  useEffect(() => {
  const savedVolunteer = localStorage.getItem("selectedVolunteer");
  if (savedVolunteer) {
    const volunteer = JSON.parse(savedVolunteer);
    localStorage.removeItem("selectedVolunteer");
  }
}, []);

  const handleSurveySuccess = () => {
    setCanCreate(true);
    setNeedSurvey(false);
    setShowSurveyPopup(false);
    window.location.reload();
  };

  const handleClosePopup = () => {
    setShowSurveyPopup(false);
  };

  if (isLoading || checking) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang kiểm tra...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Vui lòng đăng nhập để tạo yêu cầu hỗ trợ</p>
        <Link href="/" className="text-blue-600 mt-2 inline-block">Về trang chủ</Link>
      </div>
    );
  }

  if (showSurveyPopup) {
    return (
      <SystemSurveyPopup
        onClose={handleClosePopup}
        onSuccess={handleSurveySuccess}
      />
    );
  }

  if (needSurvey && !showSurveyPopup) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">{message}</p>
            </div>
            <button
              onClick={() => setShowSurveyPopup(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
            >
              Đánh giá ngay
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-50 pointer-events-none">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tạo yêu cầu hỗ trợ</h1>
          <div className="text-center py-10 text-gray-500">
            Bạn cần đánh giá chất lượng dịch vụ trước khi tạo yêu cầu mới
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-auto mx-auto h-[90vh]">
      <div className="bg-white shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tạo yêu cầu hỗ trợ</h1>
        <SupportRequestForm onSuccess={() => window.location.href = "/my-requests"} initialData={initialFormData} />
      </div>
    </div>
  );
}