"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import { FaEye, FaThumbsUp, FaCalendarAlt } from "react-icons/fa";
import { FaUserPen } from "react-icons/fa6";

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: string;
  link?: string;
  author: string;
  helpfulCount: number;
  viewCount: number;
  createdAt: string;
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [checking, setChecking] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6;

  useEffect(() => {
    checkVolunteerStatus();
  }, [user]);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory]);

  const checkVolunteerStatus = async () => {
    if (!user) {
      setChecking(false);
      return;
    }
    
    try {
      const response = await api.get(`/volunteers/check/${user.id}`);
      setIsVolunteer(response.data.isRegistered);
    } catch (error) {
      console.error("Error checking volunteer status:", error);
    } finally {
      setChecking(false);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== "all" ? { category: selectedCategory } : {};
      const response = await api.get("/resources", { params });
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(resources.length / itemsPerPage);
const paginatedResources = resources.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

useEffect(() => {
  setCurrentPage(1);
}, [selectedCategory]);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      smartphone: "",
      security: "",
      general: "",
    };
    return icons[category] || "";
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      smartphone: "Hỗ trợ Smartphone",
      security: "Bảo mật Online",
      general: "Kiến thức chung",
    };
    return names[category] || category;
  };

  if (loading || checking) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải tài liệu...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-[90vh]">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Thư viện tài liệu học tập
        </h1>
        <p className="text-gray-600">
          Tổng hợp kiến thức công nghệ từ cộng đồng tình nguyện viên
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { value: "all", label: "Tất cả", icon: "" },
          { value: "smartphone", label: "Smartphone", icon: "" },
          { value: "security", label: "Bảo mật", icon: "" },
          { value: "general", label: "Kiến thức chung", icon: "" },
        ].map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-5 py-2 rounded-full font-medium transition-all ${
              selectedCategory === category.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Chưa có tài liệu nào trong danh mục này.</p>
          {user && !isVolunteer && (
            <Link href="/volunteer-registration" className="text-blue-600 mt-2 inline-block">
              Đăng ký làm tình nguyện viên để đóng góp
            </Link>
          )}
          {!user && (
            <p className="text-sm text-gray-400 mt-2">
              Đăng nhập để đăng ký làm tình nguyện viên và đóng góp kiến thức
            </p>
          )}
          {user && isVolunteer && (
            <p className="text-sm text-gray-400 mt-2">
              Bạn đã là tình nguyện viên, hãy <Link href="/tinh-nguyen-vien/bai-viet/tao-moi" className="text-blue-600">đăng bài</Link> để chia sẻ kiến thức!
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResources.map((resource) => (
              <Link
                key={resource._id}
                href={`/tai-nguyen/${resource._id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 block"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getCategoryIcon(resource.category)}</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {getCategoryName(resource.category)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-400">
  <span className="flex items-center gap-1"><FaUserPen size={12} /> {resource.author}</span>
  <div className="flex items-center gap-3">
    <span className="flex items-center gap-1"><FaThumbsUp size={12} /> {resource.helpfulCount || 0}</span>
    <span className="flex items-center gap-1"><FaEye size={12} /> {resource.viewCount || 0}</span>
    <span className="flex items-center gap-1"><FaCalendarAlt size={12} /> {new Date(resource.createdAt).toLocaleDateString("vi-VN")}</span>
  </div>
</div>
                </div>
              </Link>
            ))}
          </div>
          
          {user && isVolunteer && (
            <div className="mt-8 text-center">
              <Link
                href="/tinh-nguyen-vien/bai-viet/tao-moi"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span></span> Đăng bài viết mới
              </Link>
            </div>
          )}

          {totalPages > 1 && (
  <div className="flex items-center justify-center gap-3 mt-8">
    <button
      onClick={() => setCurrentPage(p => Math.max(p-1, 1))}
      disabled={currentPage === 1}
      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
    >
      Trang trước
    </button>
    <span className="text-sm text-gray-600">
      Trang {currentPage} / {totalPages}
    </span>
    <button
      onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))}
      disabled={currentPage === totalPages}
      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
    >
      Trang sau
    </button>
  </div>
)}
        </>
      )}
    </div>
  );
}