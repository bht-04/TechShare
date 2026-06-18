"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { volunteerApi } from "@/app/services/api";
import Link from "next/link";
import { toast } from "sonner";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  university: string;
  major: string;
  skills: string;
  experience: string;
  availableDays: string;
  supportType: string;
  inPerson: boolean;
  online: boolean;
  otherSupportDesc: string;
  bio: string;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  university: "",
  major: "",
  skills: "",
  experience: "",
  availableDays: "",
  supportType: "",
  inPerson: false,
  online: false,
  otherSupportDesc: "",
  bio: "",
};

const SUPPORT_TYPES = [
  { value: "smartphone", label: "Hỗ trợ Smartphone", icon: "" },
  { value: "computer", label: "Hỗ trợ Máy tính", icon: "" },
  { value: "security", label: "Bảo mật Online", icon: "" },
  { value: "office", label: "Microsoft Office", icon: "" },
  { value: "other", label: "Khác", icon: "" },
];

export default function VolunteerRegistrationPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkStatus();
    }
  }, [user]);

  const checkStatus = async () => {
    try {
      const res = await volunteerApi.checkStatus(user?.id as string); 
      if (res.isRegistered) {
        setAlreadyRegistered(true);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setChecking(false);
    }
  };

  const setField = (key: keyof FormState, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};

    if (!formData.fullName.trim()) e.fullName = "Vui lòng nhập họ tên";
    if (!formData.phone.trim()) e.phone = "Vui lòng nhập số điện thoại";
    if (formData.phone.length < 9) e.phone = "Số điện thoại không hợp lệ";
    if (!formData.email.trim()) e.email = "Vui lòng nhập email";
    if (!formData.address.trim()) e.address = "Vui lòng nhập địa chỉ";
    if (!formData.university.trim()) e.university = "Vui lòng nhập trường học";
    if (!formData.major.trim()) e.major = "Vui lòng nhập chuyên ngành";
    if (!formData.skills.trim()) e.skills = "Vui lòng nhập kỹ năng";
    if (!formData.experience.trim()) e.experience = "Vui lòng nhập kinh nghiệm";
    if (formData.experience.length < 10) e.experience = "Kinh nghiệm ít nhất 10 ký tự";
    if (!formData.availableDays.trim()) e.availableDays = "Vui lòng nhập thời gian rảnh";
    if (!formData.supportType) e.supportType = "Vui lòng chọn loại hỗ trợ";
    if (!formData.inPerson && !formData.online) e.supportMode = "Chọn ít nhất 1 hình thức hỗ trợ";

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const skillsArray = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);

      const userId = user?.id as string;
      
      await volunteerApi.create({
        userId: userId,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        university: formData.university.trim(),
        major: formData.major.trim(),
        skills: skillsArray,
        experience: formData.experience.trim(),
        availableDays: formData.availableDays.trim(),
        supportType: formData.supportType,
        inPerson: formData.inPerson,
        online: formData.online,
        otherSupportDesc: formData.otherSupportDesc,
        bio: formData.bio,
        avatarUrl: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=2563eb&color=fff`,
      });

      toast.success("Đăng ký thành công! Bạn đã trở thành tình nguyện viên của TechShare.");
      window.location.href = "/volunteer-dashboard";
    } catch (error: any) {
      console.error("Error:", error);
      if (error.response?.data?.errorCode === "ALREADY_REGISTERED") {
        toast.error("Bạn đã đăng ký làm tình nguyện viên trước đó rồi!");
        router.push("/volunteer-dashboard");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || checking) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang kiểm tra...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Vui lòng đăng nhập để đăng ký tình nguyện viên</p>
        <Link href="/" className="text-blue-600 mt-2 inline-block">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (alreadyRegistered) {
    return (
      <div className="text-center py-20 bg-white rounded-xl p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bạn đã là tình nguyện viên!</h2>
        <p className="text-gray-500 mb-6">Cảm ơn bạn đã đồng hành cùng TechShare</p>
        <Link
          href="/volunteer-dashboard"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
        >
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto h-[90vh]">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Đăng ký Tình nguyện viên
        </h1>
        <p className="text-gray-600">
          Cùng chung tay mang công nghệ đến gần hơn với cộng đồng
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nguyễn Văn A"
              />
              {submitted && errors.fullName && (
                <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0123456789"
              />
              {submitted && errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="example@gmail.com"
              />
              {submitted && errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setField("address", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Hà Nội, Việt Nam"
              />
              {submitted && errors.address && (
                <p className="text-sm text-red-500 mt-1">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
           Học vấn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trường học*
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setField("university", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.university ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Đại học Bách Khoa Hà Nội"
              />
              {submitted && errors.university && (
                <p className="text-sm text-red-500 mt-1">{errors.university}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chuyên ngành *
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setField("major", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.major ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Công nghệ thông tin"
              />
              {submitted && errors.major && (
                <p className="text-sm text-red-500 mt-1">{errors.major}</p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            Kỹ năng & Kinh nghiệm
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kỹ năng (cách nhau bằng dấu phẩy) *
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setField("skills", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.skills ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="JavaScript, React, Node.js, Python"
              />
              {submitted && errors.skills && (
                <p className="text-sm text-red-500 mt-1">{errors.skills}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Ví dụ: Lập trình web, Sửa chữa máy tính, Tin học văn phòng
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kinh nghiệm *
              </label>
              <textarea
                rows={4}
                value={formData.experience}
                onChange={(e) => setField("experience", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                  submitted && errors.experience ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Mô tả kinh nghiệm của bạn trong lĩnh vực công nghệ, tin học..."
              />
              {submitted && errors.experience && (
                <p className="text-sm text-red-500 mt-1">{errors.experience}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian rảnh hỗ trợ *
              </label>
              <input
                type="text"
                value={formData.availableDays}
                onChange={(e) => setField("availableDays", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  submitted && errors.availableDays ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Tối thứ 3,5,7 | Cuối tuần"
              />
              {submitted && errors.availableDays && (
                <p className="text-sm text-red-500 mt-1">{errors.availableDays}</p>
              )}
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
           Thông tin hỗ trợ
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lĩnh vực hỗ trợ *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setField("supportType", type.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.supportType === type.value
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
              {submitted && errors.supportType && (
                <p className="text-sm text-red-500 mt-1">{errors.supportType}</p>
              )}
            </div>

            {formData.supportType === "other" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả loại hỗ trợ
                </label>
                <input
                  type="text"
                  value={formData.otherSupportDesc}
                  onChange={(e) => setField("otherSupportDesc", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mô tả chi tiết lĩnh vực bạn có thể hỗ trợ..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình thức hỗ trợ *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.online}
                    onChange={(e) => setField("online", e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Online</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.inPerson}
                    onChange={(e) => setField("inPerson", e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Trực tiếp</span>
                </label>
              </div>
              {submitted && errors.supportMode && (
                <p className="text-sm text-red-500 mt-1">{errors.supportMode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới thiệu bản thân (không bắt buộc)
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setField("bio", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Đôi lời giới thiệu về bản thân..."
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mb-6 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="mb-6 flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký ngay"}
          </button>
        </div>
      </form>
    </div>
  );
}