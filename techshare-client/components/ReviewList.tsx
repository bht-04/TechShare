"use client";

import { useEffect, useState } from "react";
import api from "@/app/services/api";

interface Review {
  _id: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewListProps {
  limit?: number;
}

export default function ReviewList({ limit }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews");
      const data = response.data;
      
      const reviewList = limit ? data.slice(0, limit) : data;
      setReviews(reviewList);
      setTotalReviews(data.length);
      
      if (data.length > 0) {
        const sum = data.reduce((acc: number, review: Review) => acc + review.rating, 0);
        setAverageRating(sum / data.length);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Đang tải đánh giá...</div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-400 text-lg mb-2">Chưa có đánh giá nào</p>
        <p className="text-gray-400 text-sm">Hãy là người đầu tiên đánh giá!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-800">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mt-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {totalReviews} đánh giá
            </div>
          </div>
          <div className="flex-1">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-12">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-10">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{review.userName}</p>
                  <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-gray-600 text-sm pl-13 ml-13">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}