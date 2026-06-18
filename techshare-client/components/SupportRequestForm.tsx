"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supportRequestApi } from "@/app/services/api";

interface SupportRequestFormProps {
  onSuccess?: () => void;
  initialData?: { 
    supportType: string;
    otherSupportDesc?: string;
    description: string;
    urgency: string;
    supportDate: string;
    timeSlot: string;
    inPerson: boolean;
    online: boolean;
  };
}

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  supportType: string;
  description: string;
  urgency: "" | "low" | "medium" | "high";
  supportDate: string;
  timeSlot: string;
  inPerson: boolean;
  online: boolean;
  otherSupportDesc: string;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
  supportType: "",
  description: "",
  urgency: "",
  supportDate: "",
  timeSlot: "",
  inPerson: false,
  online: false,
  otherSupportDesc: "",
};

const SUPPORT_TYPES = [
  { value: "smartphone", label: "Smartphone" },
  { value: "computer", label: "Máy tính" },
  { value: "security", label: "Bảo mật online" },
  { value: "office", label: "Microsoft Office" },
  { value: "other", label: "Khác" },
] as const;

const TIME_SLOTS = [
  { value: "", label: "Chọn khung giờ" },
  { value: "08-10", label: "08:00 – 10:00" },
  { value: "10-12", label: "10:00 – 12:00" },
  { value: "14-16", label: "14:00 – 16:00" },
  { value: "16-18", label: "16:00 – 18:00" },
  { value: "flex", label: "Tùy chọn" },
] as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function todayISODate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

function validate(v: FormState) {
  const e: Record<string, string> = {};

  if (!v.fullName || v.fullName.length < 2) e.fullName = "Nhập họ tên";
  if (!v.phone || v.phone.length < 9) e.phone = "Số điện thoại không hợp lệ";
  if (!emailRe.test(v.email)) e.email = "Email không hợp lệ";
  if (!v.address) e.address = "Nhập địa chỉ";
  if (!v.supportType) e.supportType = "Chọn loại hỗ trợ";
  if (!v.description || v.description.length < 10)
    e.description = "Mô tả ít nhất 10 ký tự";
  if (!v.urgency) e.urgency = "Chọn mức độ";
  if (!v.supportDate) e.supportDate = "Chọn ngày";
  if (v.supportDate < todayISODate())
    e.supportDate = "Không được chọn ngày quá khứ";
  if (!v.timeSlot) e.timeSlot = "Chọn giờ";
  if (!v.inPerson && !v.online)
    e.supportMode = "Chọn online hoặc trực tiếp";

  return e;
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function SupportRequestForm({ onSuccess, initialData }: SupportRequestFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [values, setValues] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<{ id: string; name: string; supportType: string } | null>(null);

  useEffect(() => {
    const volunteerId = searchParams.get("volunteerId");
    const volunteerName = searchParams.get("volunteerName");
    const supportType = searchParams.get("supportType");
  
    
    if (volunteerId && volunteerName) {
      setSelectedVolunteer({
        id: volunteerId,
        name: decodeURIComponent(volunteerName),
        supportType: supportType || ""
      });
      
      if (supportType && supportType !== "all") {
        setValues(prev => ({
          ...prev,
          supportType: supportType
        }));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (initialData) {
      setValues(prev => ({
        ...prev,
        supportType: initialData.supportType || prev.supportType,
        otherSupportDesc: initialData.otherSupportDesc || prev.otherSupportDesc,
        description: initialData.description || prev.description,
        urgency: initialData.urgency === "low" || initialData.urgency === "medium" || initialData.urgency === "high" 
          ? initialData.urgency 
          : prev.urgency,
        supportDate: initialData.supportDate || prev.supportDate,
        timeSlot: initialData.timeSlot || prev.timeSlot,
        inPerson: initialData.inPerson || prev.inPerson,
        online: initialData.online || prev.online,
      }));
    }
  }, [initialData]);

  const setField = (k: keyof FormState, v: any) =>
    setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const err = validate(values);
    setErrors(err);

    if (Object.keys(err).length > 0) return;

    try {
      setLoading(true);


      await supportRequestApi.create({
        userId: user?.id || "",
        ...values,
        preferredVolunteerId: selectedVolunteer?.id || null,
        preferredVolunteerName: selectedVolunteer?.name || "",
      });

      setSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-10">
        <h2 className="text-xl font-semibold">Gửi thành công</h2>
        <p className="text-gray-500">Chúng tôi sẽ liên hệ sớm</p> 
      </div>
    );
  }

  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {selectedVolunteer && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-blue-700 font-medium">
                Đang liên hệ hỗ trợ với tình nguyện viên: <strong>{selectedVolunteer.name}</strong>
              </p>
              <p className="text-blue-500 text-xs mt-1">
                Yêu cầu của bạn sẽ được ưu tiên gửi đến tình nguyện viên này
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Họ tên" error={errors.fullName}>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
            value={values.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
          />
        </Field>

        <Field label="Số điện thoại" error={errors.phone}>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </Field>

        <Field label="Địa chỉ" error={errors.address}>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
            value={values.address}
            onChange={(e) => setField("address", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="space-y-4">
          <Field label="Loại hỗ trợ" error={errors.supportType}>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
              value={values.supportType}
              onChange={(e) => setField("supportType", e.target.value)}
            >
              <option value="">Chọn</option>
              {SUPPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {values.supportType === "other" && (
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-700">
                  Mô tả loại hỗ trợ
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                  value={values.otherSupportDesc}
                  onChange={(e) => setField("otherSupportDesc", e.target.value)}
                  placeholder="Nhập mô tả..."
                />
              </div>
            )}
          </Field>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Mức độ</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "low", label: "Thấp", color: "green" },
                { v: "medium", label: "Trung bình", color: "yellow" },
                { v: "high", label: "Cao", color: "red" },
              ].map((item) => (
                <button
                  type="button"
                  key={item.v}
                  onClick={() => setField("urgency", item.v as any)}
                  className={`py-2 text-sm rounded-lg border transition ${
                    values.urgency === item.v
                      ? item.v === "low"
                        ? "bg-green-600 text-white border-green-600"
                        : item.v === "medium"
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : "bg-red-600 text-white border-red-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {errors.urgency && <p className="text-xs text-red-500">{errors.urgency}</p>}
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Ngày" error={errors.supportDate}>
              <input
                type="date"
                min={todayISODate()}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={values.supportDate}
                onChange={(e) => setField("supportDate", e.target.value)}
              />
            </Field>

            <Field label="Giờ" error={errors.timeSlot}>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                value={values.timeSlot}
                onChange={(e) => setField("timeSlot", e.target.value)}
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Hình thức hỗ trợ</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setField("online", !values.online)}
                className={`px-3 py-2 text-sm rounded-lg border transition ${
                  values.online
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setField("inPerson", !values.inPerson)}
                className={`px-3 py-2 text-sm rounded-lg border transition ${
                  values.inPerson
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Trực tiếp
              </button>
            </div>
            {errors.supportMode && <p className="text-xs text-red-500">{errors.supportMode}</p>}
          </div>
        </div>

        <div>
          <Field label="Mô tả" error={errors.description}>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none min-h-[210px] outline-none"
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn cần hỗ trợ..."
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="sm:w-40 border rounded-lg py-2 text-sm hover:bg-gray-50 transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Đang gửi..." : "Gửi yêu cầu"}
        </button>
      </div>
    </form>
  );
}