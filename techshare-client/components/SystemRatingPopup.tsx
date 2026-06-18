"use client";

import { useState } from "react";
import api from "@/app/services/api";
import { useAuth } from "@/context/AuthContext";
import logo from "../app/logo_techshare.png"
import { toast } from "sonner";

interface SystemSurveyPopupProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function SystemSurveyPopup({ onClose, onSuccess }: SystemSurveyPopupProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/surveys", {
        userId: user?.id,
        fullName: user?.fullName || "Người dùng",
        email: user?.email || "",
        rating,
        comment: comment.trim() || "Cảm ơn TechShare đã hỗ trợ!",
      });

      toast.success("Cảm ơn bạn đã đánh giá! Bạn có thể tiếp tục tạo yêu cầu hỗ trợ.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">    <img 
      src={logo.src}
      alt="TechShare Logo"
      className="h-[48px] w-full object-cover"
    /></div>
          <p className="text-gray-500 text-sm mt-2">
            Bạn đã tạo 3 yêu cầu. Vui lòng đánh giá để tiếp tục tạo yêu cầu mới.
          </p>
        </div>

        <div className="mb-4 text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bạn hài lòng về chất lượng hỗ trợ?
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-4xl focus:outline-none transition-transform hover:scale-110"
              >
                <span className={(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-300"}>
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {rating === 1 && "⭐ Rất không hài lòng"}
            {rating === 2 && "⭐⭐ Không hài lòng"}
            {rating === 3 && "⭐⭐⭐ Bình thường"}
            {rating === 4 && "⭐⭐⭐⭐ Hài lòng"}
            {rating === 5 && "⭐⭐⭐⭐⭐ Rất hài lòng"}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chia sẻ cảm nhận của bạn (không bắt buộc)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Điều gì bạn thích? Điều gì cần cải thiện?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          Đánh giá giúp chúng tôi cải thiện chất lượng dịch vụ
        </p>
      </div>
    </div>
  );
}