"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import { toast } from "sonner";

interface ReviewFormProps {
  onSuccess?: () => void;
}

export default function ReviewForm({ onSuccess }: ReviewFormProps) {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để gửi đánh giá");
      return;
    }

    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (comment.trim().length < 5) {
      setError("Vui lòng nhập nhận xét (ít nhất 5 ký tự)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/reviews", {
        userId: user!.id,
        userName: user!.fullName || "Người dùng",
        userEmail: user!.email || "",
        rating,
        comment: comment.trim(),
      });

      setRating(0);
      setComment("");
      
      if (onSuccess) onSuccess();
      
      toast.success("Cảm ơn bạn đã đánh giá!");
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 mb-3">Vui lòng đăng nhập để gửi đánh giá</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Đánh giá của bạn</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số sao đánh giá *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl focus:outline-none transition-transform hover:scale-110"
            >
              <span
                className={
                  (hoverRating || rating) >= star
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {rating === 1 && "⭐ Rất tệ"}
          {rating === 2 && "⭐⭐ Tệ"}
          {rating === 3 && "⭐⭐⭐ Bình thường"}
          {rating === 4 && "⭐⭐⭐⭐ Tốt"}
          {rating === 5 && "⭐⭐⭐⭐⭐ Rất tốt"}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhận xét của bạn *
        </label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về chất lượng hỗ trợ của TechShare..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
      >
        {loading ? "Đang gửi..." : "Gửi đánh giá"}
      </button>
    </form>
  );
}