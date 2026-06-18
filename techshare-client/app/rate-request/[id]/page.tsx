"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import Link from "next/link";
// import logo from "../../logo_techshare.png"
import { toast } from "sonner";

export default function RateRequestPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.id && params.id) {
      fetchRequest();
    }
  }, [user, params.id]);

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/requests/user/${user?.id}`);
      const found = response.data.find((r: any) => r._id === params.id);
      if (found && found.status === "completed" && !found.rating) {
        setRequest(found);
      } else {
        setError("Không tìm thấy yêu cầu hoặc đã được đánh giá");
      }
    } catch (error) {
      setError("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.patch(`/requests/${params.id}/rate`, { rating, comment: comment.trim() || "Cảm ơn bạn đã hỗ trợ!" });
      toast.success("Cảm ơn bạn đã đánh giá!");
      router.push("/my-requests");
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!user) return <div className="text-center py-20">Vui lòng đăng nhập</div>;
  if (error || !request) return <div className="text-center py-20"><p className="text-red-500">{error || "Không tìm thấy yêu cầu"}</p><Link href="/my-requests" className="text-blue-600 mt-2 inline-block">Quay lại</Link></div>;

  return (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
      <div className="w-full bg-white shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Đánh giá tình nguyện viên</h1>
          <p className="text-gray-500 text-sm mt-1">Cảm ơn bạn đã sử dụng dịch vụ của TechShare</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div>
              <p className="font-semibold text-gray-800">{request?.supportType === "smartphone" ? "Hỗ trợ Smartphone" : request?.supportType === "security" ? "Bảo mật Online" : "Hỗ trợ Máy tính"}</p>
              <p className="text-xs text-gray-500">Tình nguyện viên: {request?.volunteerName || request?.volunteerId?.fullName}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">Nội dung: {request?.description}</p>
        </div>

        <div className="mb-6 text-center">
          <label className="block text-sm font-medium text-gray-700 mb-3">Chất lượng hỗ trợ</label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="text-5xl focus:outline-none transition-transform hover:scale-110">
                <span className={(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"}>★</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {rating === 1 && "⭐ Rất tệ"} {rating === 2 && "⭐⭐ Tệ"} {rating === 3 && "⭐⭐⭐ Tạm được"} {rating === 4 && "⭐⭐⭐⭐ Tốt"} {rating === 5 && "⭐⭐⭐⭐⭐ Rất tốt"}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét (không bắt buộc)</label>
          <textarea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Chia sẻ cảm nhận của bạn về tình nguyện viên..." className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none" />
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">Hủy</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-semibold transition disabled:opacity-50">{submitting ? "Đang gửi..." : "Gửi đánh giá"}</button>
        </div>
      </div>
    </div>
  );
}