"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";
import { FaEye, FaThumbsUp } from "react-icons/fa";

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  link?: string;
  author: string;
  authorId: {
    _id: string;
    fullName: string;
    rating: number;
    avatarUrl?: string;
  };
  helpfulCount: number;
  viewCount: number;
  createdAt: string;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulLoading, setHelpfulLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchResource();
    }
  }, [params.id]);

  const fetchResource = async () => {
    try {
      const response = await api.get(`/resources/${params.id}`);
      setResource(response.data);
    } catch (error) {
      console.error("Error fetching resource:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async () => {
    if (helpfulLoading || isHelpful) return;
    
    setHelpfulLoading(true);
    try {
      await api.patch(`/resources/${params.id}/helpful`);
      setResource(prev => prev ? {
        ...prev,
        helpfulCount: prev.helpfulCount + 1
      } : null);
      setIsHelpful(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setHelpfulLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { icon: string; name: string; color: string }> = {
      smartphone: { icon: "", name: "Hỗ trợ Smartphone", color: "bg-green-100 text-green-700" },
      security: { icon: "", name: "Bảo mật Online", color: "bg-red-100 text-red-700" },
      general: { icon: "", name: "Kiến thức chung", color: "bg-blue-100 text-blue-700" },
    };
    return categories[category] || categories.general;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải bài viết...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không tìm thấy bài viết</p>
        <Link href="/tai-nguyen" className="text-blue-600 mt-2 inline-block">
          Quay lại thư viện
        </Link>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(resource.category);

  return (
    <div className="max-w-full mx-auto h-[90vh]">
      <button
        onClick={() => router.back()}
        className="mb-2 flex items-center bg-red-400 rounded-xl px-2 text-gray-600 hover:text-gray-800 mt-2"
      >
        Quay lại
      </button>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${categoryInfo.color}`}>
                {categoryInfo.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ReportButton resourceId={resource._id} onReported={fetchResource} />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            {resource.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              {resource.authorId?.avatarUrl ? (
  <img 
    src={resource.authorId.avatarUrl} 
    alt={resource.author}
    className="w-8 h-8 rounded-full object-cover"
  />
) : (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold">
    {resource.author?.charAt(0) || "T"}
  </div>
)}
              <div>
                <p className="font-medium text-gray-800">{resource.author}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(resource.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <FaEye size={12}/> <span>{resource.viewCount || 0} lượt xem</span>
              <button
                onClick={handleHelpful}
                disabled={helpfulLoading || isHelpful}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg transition ${
                  isHelpful 
                    ? "text-green-600 bg-green-50" 
                    : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                <FaThumbsUp size={12} />Hữu ích ({resource.helpfulCount || 0})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
              {resource.content}
            </div>
          </div>

          {resource.link && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-2">Link tham khảo:</p>
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {resource.link}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Được viết bởi: </span>
              <span className="font-medium text-gray-700">{resource.author}</span>
              {resource.authorId?.rating > 0 && (
                <span className="text-sm text-yellow-500">
                  ⭐ {resource.authorId.rating.toFixed(1)}
                </span>
              )}
            </div>
            <Link
              href={`/danh-sach-tinh-nguyen-vien`}
              className="text-sm text-blue-600 hover:underline"
            >
              Xem các tình nguyện viên khác
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}