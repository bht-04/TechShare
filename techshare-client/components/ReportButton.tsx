"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import { toast } from "sonner";

interface ReportButtonProps {
  resourceId: string;
  onReported?: () => void;
}

export default function ReportButton({ resourceId, onReported }: ReportButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonDetail, setReasonDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    { value: "spam", label: "Bài viết spam, quảng cáo" },
    { value: "inappropriate", label: "Nội dung không phù hợp" },
    { value: "misinformation", label: "Thông tin sai lệch" },
    { value: "duplicate", label: "Trùng lặp nội dung" },
    { value: "other", label: "Lý do khác" },
  ];

const handleSubmit = async () => {
  if (!reason) {
    toast.error("Vui lòng chọn lý do báo cáo");
    return;
  }

  setLoading(true);
  try {
    const response = await api.post("/resources/reports", {
      resourceId,
      reporterId: user?.id,
      reason,
      reasonDetail,
    });
    
    toast.success("Cảm ơn bạn đã báo cáo! Bài viết sẽ được xem xét.");
    setShowModal(false);
    if (onReported) onReported();
  } catch (error: any) {
    console.error("Report error:", error);
    console.error("Response:", error.response?.data);
    
    if (error.response?.status === 400) {
      toast.error("Bạn đã báo cáo bài viết này rồi");
    } else {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  } finally {
    setLoading(false);
  }
};

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-gray-400 hover:text-red-500 transition-colors text-sm flex items-center gap-1"
      >
        Báo cáo
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Báo cáo bài viết</h3>
            <p className="text-sm text-gray-500 mb-4">
              Cảm ơn bạn đã giúp cộng đồng TechShare trong sạch!
            </p>

            <div className="space-y-3 mb-4">
              {reasons.map((r) => (
                <label key={r.value} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>

            <textarea
              placeholder="Mô tả thêm (không bắt buộc)..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}