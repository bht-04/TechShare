"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/services/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Volunteer {
  _id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  university: string;
  major: string;
  skills: string[];
  supportType: string;
  otherSupportDesc?: string;
  inPerson: boolean;
  online: boolean;
  avatarUrl: string;
  status: string;
  rating?: number;
  totalSupported?: number;
}

interface Review {
  _id: string;
  userId?: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  ratingComment: string;
  createdAt: string;
}

interface VolunteerCardProps {
  volunteer: Volunteer;
}

export default function VolunteerCard({ volunteer }: VolunteerCardProps) {
  const router = useRouter();
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const { user } = useAuth();

  const getSupportTypeLabel = (vol: Volunteer) => {
    if (vol.supportType === "other") {
      return vol.otherSupportDesc || "Hỗ trợ khác";
    }
    const labels: Record<string, string> = {
      smartphone: "Hỗ trợ Smartphone",
      computer: "Hỗ trợ Máy tính",
      security: "Bảo mật Online",
      office: "Microsoft Office",
    };
    return labels[vol.supportType] || vol.supportType;
  };

  const handleContact = () => {
    if (volunteer.userId === user?.id) {
      toast.error("Bạn không thể liên hệ hỗ trợ chính mình!");
      return;
    }

    const params = new URLSearchParams({
      volunteerId: volunteer._id,
      volunteerName: volunteer.fullName,
      supportType: volunteer.supportType,
    });

    window.location.href = `/RequestAssistance?${params.toString()}`;
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await api.get(`/volunteers/${volunteer._id}/reviews`);
      console.log("Reviews response:", response.data);
      setReviews(response.data);
      setShowReviews(true);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Không thể tải đánh giá");
    } finally {
      setLoadingReviews(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "text-yellow-400" : "text-gray-300"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const averageRating = volunteer.rating || 0;

  return (
    <>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            {volunteer.avatarUrl ? (
              <img 
                src={volunteer.avatarUrl} 
                alt={volunteer.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                {volunteer.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800">{volunteer.fullName}</h3>
              <p className="text-xs text-gray-500">{volunteer.university}</p>
            </div>
          </div>


          <button 
            onClick={fetchReviews}
            className="w-full flex items-center justify-between mb-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm font-medium text-gray-700">
                {averageRating > 0 ? averageRating.toFixed(1) : "Chưa có đánh giá"}
              </span>
            </div>
            <div className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
              Xem đánh giá
            </div>
          </button>

          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Kỹ năng:</p>
            <div className="flex flex-wrap gap-1">
              {volunteer.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                  {skill}
                </span>
              ))}
              {volunteer.skills.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{volunteer.skills.length - 3}
                </span>
              )}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Lĩnh vực hỗ trợ:</p>
            <p className="text-sm text-gray-700">{getSupportTypeLabel(volunteer)}</p>
          </div>

          <div className="flex gap-2 mb-4">
            {volunteer.online && (
              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">Online</span>
            )}
            {volunteer.inPerson && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full">Trực tiếp</span>
            )}
          </div>

          <button
            onClick={handleContact}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Liên hệ hỗ trợ
          </button>
        </div>
      </div>

{showReviews && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div>
          <h3 className="text-lg font-semibold">Đánh giá về {volunteer.fullName}</h3>
          <div className="flex items-center gap-2 mt-1">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm">
              ({reviews.length} đánh giá)
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowReviews(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto max-h-[500px] p-5 space-y-4">
        {loadingReviews ? (
          <div className="text-center py-10 text-gray-500">Đang tải đánh giá...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Chưa có đánh giá nào cho tình nguyện viên này</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {review.avatarUrl ? (
                    <img 
                      src={review.avatarUrl} 
                      alt={review.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br border border-black flex items-center justify-center text-black text-sm font-bold">
                      {review.fullName?.charAt(0) || "?"}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{review.fullName || "Người dùng"}</p>
                    <p className="text-xs text-gray-400">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : "Chưa có ngày"}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.ratingComment && (
                <p className="text-gray-600 text-sm mt-2 ml-10 italic">
                  "{review.ratingComment}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}
    </>
  );
}