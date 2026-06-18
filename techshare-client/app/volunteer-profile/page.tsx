"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VolunteerProfile {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  university: string;
  major: string;
  skills: string[];
  experience: string;
  availableDays: string;
  supportType: string;
  otherSupportDesc: string;
  inPerson: boolean;
  online: boolean;
  bio: string;
  avatarUrl: string;
  status: string;
  totalSupported: number;
  rating: number;
  createdAt: string;
}

export default function VolunteerProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<VolunteerProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/volunteers/check/${user?.id}`);
      if (response.data.isRegistered) {
        setProfile(response.data.volunteer);
        setFormData(response.data.volunteer);
      } else {
        router.push("/volunteer-registration");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await api.patch(`/volunteers/${profile._id}`, formData);
      setProfile({ ...profile, ...formData });
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const getSupportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      smartphone: "Hỗ trợ Smartphone",
      computer: "Hỗ trợ Máy tính",
      security: "Bảo mật Online",
      office: "Microsoft Office",
      other: "Hỗ trợ khác",
    };
    return labels[type] || type;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-lg">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
        ))}
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa phải Tình nguyện viên</h2>
        <p className="text-gray-500 mb-6">Đăng ký để trở thành tình nguyện viên và hỗ trợ cộng đồng</p>
        <Link
          href="/volunteer-registration"
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all"
        >
          Đăng ký ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto h-[90vh] overflow-y-auto">
      <div className="grid gap-4 mb-2">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-5 text-white">
          <p className="text-sm opacity-80">Đánh giá trung bình</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold">{profile.rating?.toFixed(1) || "0"}</p>
            <div className="flex">{renderStars(profile.rating || 0)}</div>
          </div>
          <p className="text-xs opacity-70">từ người dùng</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Avatar & Header */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-800 p-6 text-white">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={profile.fullName}
                className="w-20 h-20 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                {profile.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-ellipsis line-clamp-1">{profile.fullName}</h2>
              <p className="text-blue-100 text-sm break-all text-ellipsis line-clamp-1">{profile.email}</p>
              <p className="text-blue-100 text-sm">{profile.phone}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName || ""}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                  />
                ) : (
                  <p className="text-gray-800">{profile.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800 break-all">{profile.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.address}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Học vấn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trường học</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.university || ""}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.university}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.major || ""}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.major}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Kỹ năng & Kinh nghiệm</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.skills?.join(", ") || ""}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(",").map(s => s.trim()) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="JavaScript, React, Node.js"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
                {isEditing ? (
                  <textarea
                    value={formData.experience || ""}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">{profile.experience}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Thông tin hỗ trợ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lĩnh vực hỗ trợ</label>
                {isEditing ? (
                  <>
                    <select
                      value={formData.supportType || ""}
                      onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="smartphone">Hỗ trợ Smartphone</option>
                      <option value="computer">Hỗ trợ Máy tính</option>
                      <option value="security">Bảo mật Online</option>
                      <option value="office">Microsoft Office</option>
                      <option value="other">Khác</option>
                    </select>
                    {formData.supportType === "other" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={formData.otherSupportDesc || ""}
                          onChange={(e) => setFormData({ ...formData, otherSupportDesc: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="Mô tả loại hỗ trợ..."
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="text-gray-800">{getSupportTypeLabel(profile.supportType)}</p>
                    {profile.supportType === "other" && profile.otherSupportDesc && (
                      <p className="text-sm text-gray-500 mt-1">Mô tả: {profile.otherSupportDesc}</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian rảnh</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.availableDays || ""}
                    onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <p className="text-gray-800">{profile.availableDays}</p>
                )}
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình thức hỗ trợ</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.online || false}
                    onChange={(e) => setFormData({ ...formData, online: e.target.checked })}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Online</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.inPerson || false}
                    onChange={(e) => setFormData({ ...formData, inPerson: e.target.checked })}
                    disabled={!isEditing}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Trực tiếp</span>
                </label>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu bản thân</label>
              {isEditing ? (
                <textarea
                  value={formData.bio || ""}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lgresize-none"
                  placeholder="Đôi lời giới thiệu về bản thân..."
                />
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{profile.bio || "Chưa cập nhật"}</p>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-400 pt-2">
            <p>Tham gia từ: {new Date(profile.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profile);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}