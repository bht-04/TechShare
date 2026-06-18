"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
// import Link from "next/link";
import { toast } from "sonner";

interface Article {
  _id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  link: string;
  isHidden: boolean;
  reportCount: number;
  hiddenReason: string;
  authorId: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    content: "",
    link: "",
  });
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchArticle();
    }
  }, [params.id]);

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/resources/${params.id}`);
      const articleData = response.data;
      setArticle(articleData);
      setFormData({
        title: articleData.title,
        description: articleData.description,
        category: articleData.category,
        content: articleData.content,
        link: articleData.link || "",
      });
    } catch (error) {
      console.error("Error:", error);
      setError("Không thể tải bài viết");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }
    if (!formData.description.trim()) {
      setError("Vui lòng nhập mô tả");
      return;
    }
    if (!formData.content.trim()) {
      setError("Vui lòng nhập nội dung");
      return;
    }
    if (formData.content.length < 50) {
      setError("Nội dung quá ngắn (tối thiểu 50 ký tự)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.put(`/resources/${params.id}`, formData);
      
      if (response.data.wasReactivated) {
        toast.success("Cập nhật thành công! Bài viết đã được hiển thị lại và reset báo cáo.");
      } else {
        toast.success("Cập nhật thành công!");
      }
      
      router.push("/tinh-nguyen-vien/bai-viet");
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải bài viết...</div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto h-[90vh]">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-2 mt-2 bg-red-400 rounded-xl px-2 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          Quay lại
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Sửa bài viết
        </h1>
        <p className="text-gray-600">Cập nhật nội dung bài viết của bạn</p>
      </div>

      {article?.isHidden && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-red-700 font-semibold">Bài viết này đang bị ẩn</p>
              <p className="text-red-600 text-sm mt-1">
                {article.hiddenReason || `Bị báo cáo ${article.reportCount}/3 lần`}
              </p>
              <p className="text-red-500 text-xs mt-2">
                Sau khi lưu, bài viết sẽ được <strong>hiển thị lại</strong> và <strong>reset số lần báo cáo</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Nhập tiêu đề bài viết"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="smartphone">Hỗ trợ Smartphone</option>
            <option value="security">Bảo mật Online</option>
            <option value="general">Kiến thức chung</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả ngắn <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
            placeholder="Tóm tắt nội dung bài viết (hiển thị trong danh sách)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={12}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="Viết nội dung chi tiết tại đây (tối thiểu 50 ký tự)..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Độ dài: {formData.content.length} ký tự
          </p>
        </div>

        {/* Link tham khảo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link tham khảo (không bắt buộc)
          </label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="https://..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}