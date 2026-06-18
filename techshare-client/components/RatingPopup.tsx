"use client";

import { useState } from "react";
import api from "@/app/services/api";
import { toast } from "sonner";

interface RequestNeedRating {
  _id: string;
  supportType: string;
  volunteerId: {
    fullName: string;
    phone: string;
    avatarUrl: string;
  };
  createdAt: string;
}

interface RatingPopupProps {
  requests: RequestNeedRating[];
  onClose: () => void;
  onRated: () => void;
}

export default function RatingPopup({ requests, onClose, onRated }: RatingPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentRequest = requests[currentIndex];

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.patch(`/requests/${currentRequest._id}/rate`, {
        rating,
        comment: comment.trim() || "Cảm ơn bạn đã hỗ trợ!",
      });

      if (currentIndex + 1 < requests.length) {
        // Đánh giá tiếp
        setCurrentIndex(currentIndex + 1);
        setRating(0);
        setComment("");
        setError("");
      } else {
        toast.success("Cảm ơn bạn đã đánh giá! Bạn có thể tiếp tục tạo yêu cầu hỗ trợ mới.");
        onRated();
        onClose();
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Đánh giá {currentIndex + 1}/{requests.length}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all"
              style={{ width: `${((currentIndex + 1) / requests.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl mb-3">
            {currentRequest.supportType === "smartphone" ? "" : 
             currentRequest.supportType === "security" ? "" : ""}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Đánh giá hỗ trợ
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Yêu cầu: {currentRequest.supportType}
          </p>
          <p className="text-sm text-gray-500">
            Tình nguyện viên: {currentRequest.volunteerId?.fullName || "Đã hỗ trợ"}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Chất lượng hỗ trợ
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
          <p className="text-center text-sm text-gray-500 mt-2">
            {rating === 1 && "⭐ Rất tệ"}
            {rating === 2 && "⭐⭐ Tệ"}
            {rating === 3 && "⭐⭐⭐ Tạm được"}
            {rating === 4 && "⭐⭐⭐⭐ Tốt"}
            {rating === 5 && "⭐⭐⭐⭐⭐ Rất tốt"}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhận xét (không bắt buộc)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về tình nguyện viên..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
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