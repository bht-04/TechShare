"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { volunteerApi } from "@/app/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

type VolunteerFormState = {
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
};

const initialForm: VolunteerFormState = {
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
};

const SUPPORT_TYPES = [
  { value: "smartphone", label: "Hỗ trợ Smartphone" },
  { value: "computer", label: "Hỗ trợ Máy tính" },
  { value: "security", label: "Bảo mật online" },
  { value: "office", label: "Microsoft Office" },
  { value: "other", label: "Khác" },
] as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inputClass(hasError: boolean) {
  return `form-input form-input--icon${hasError ? " form-input--error" : ""}`;
}

function normalizePhoneDigits(v: string): string {
  return v.replace(/\D/g, "");
}

function validate(values: VolunteerFormState): Record<string, string> {
  const e: Record<string, string> = {};

  if (values.fullName.trim().length < 2) {
    e.fullName = "Vui lòng nhập họ và tên.";
  }

  if (!values.supportType) {
  e.supportType = "Vui lòng chọn loại hỗ trợ.";
}

if (values.supportType === "other" && values.otherSupportDesc.trim().length < 5) {
  e.otherSupportDesc = "Vui lòng mô tả loại hỗ trợ.";
}

  const phoneDigits = normalizePhoneDigits(values.phone);

  if (!phoneDigits) {
    e.phone = "Vui lòng nhập số điện thoại.";
  } else if (phoneDigits.length < 9 || phoneDigits.length > 12) {
    e.phone = "Số điện thoại không hợp lệ.";
  }

  if (!values.email.trim()) {
    e.email = "Vui lòng nhập email.";
  } else if (!emailRe.test(values.email.trim())) {
    e.email = "Email không đúng định dạng.";
  }

  if (values.address.trim().length < 5) {
    e.address = "Vui lòng nhập địa chỉ đầy đủ.";
  }

  if (values.university.trim().length < 2) {
    e.university = "Vui lòng nhập trường học";
  }

  if (values.major.trim().length < 2) {
    e.major = "Vui lòng nhập chuyên ngành.";
  }

  if (values.skills.trim().length < 5) {
    e.skills = "Vui lòng nhập kỹ năng.";
  }

  if (values.experience.trim().length < 10) {
    e.experience = "Mô tả kinh nghiệm ít nhất 10 ký tự.";
  }

  if (!values.availableDays.trim()) {
    e.availableDays = "Vui lòng nhập thời gian hỗ trợ.";
  }

  if (!values.supportType) {
    e.supportType = "Vui lòng chọn loại hỗ trợ.";
  }

  if (!values.inPerson && !values.online) {
    e.supportMode = "Vui lòng chọn ít nhất một hình thức hỗ trợ.";
  }

  return e;
}

function FieldShell({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="form-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function RegisterAsVolunteer() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [values, setValues] = useState<VolunteerFormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập để truy cập tính năng này!");
      router.push("/");
      return;
    }

    const checkExistingVolunteer = async () => {
      try {
        const res = await volunteerApi.checkStatus(user.id);
        
        if (res.isRegistered) {

          toast.error("Bạn đã đăng ký tài khoản tình nguyện viên trên hệ thống rồi!", {
            id: "route-guard-toast",
          });
     
          router.push("/");
        } else {

          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra bảo mật tuyến đường:", error);
  
        setCheckingAuth(false);
      }
    };

    checkExistingVolunteer();
  }, [user, isLoading, router]);

  const setField = useCallback(
    <K extends keyof VolunteerFormState>(
      key: K,
      value: VolunteerFormState[K]
    ) => {
      setValues((prev) => ({
        ...prev,
        [key]: value,
      }));

      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        if (key === "inPerson" || key === "online") {
          delete next.supportMode;
        }
        return next;
      });
    },
    []
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại các trường thông tin điền thiếu!");
      return;
    }

    try {
      setLoading(true);
      const skillsArray = values.skills.split(",").map((s) => s.trim()).filter(Boolean);

      await volunteerApi.create({
        userId: user?.id || "", 
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
        university: values.university.trim(),
        major: values.major.trim(),
        skills: skillsArray,
        experience: values.experience.trim(),
        availableDays: values.availableDays.trim(),
        supportType: values.supportType,
        inPerson: values.inPerson,
        online: values.online,
        bio: "",
        avatarUrl: user?.avatar || "https://ui-avatars.com/api/?name=User&background=2563eb&color=fff",
       otherSupportDesc: values.otherSupportDesc.trim(),
      } as any);

      toast.success("Đăng ký thành công! Chào mừng bạn đến với TechShare");

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error: any) {
      console.error("Lỗi khi kết nối Backend:", error);
      
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message;
      const errorCode = error?.response?.data?.errorCode;

      if (errorCode === "ALREADY_REGISTERED" || status === 400) {
        toast.error(serverMessage || "Bạn đã đăng ký trước đó rồi!");
        setApiError(serverMessage || "Tài khoản đã đăng ký làm tình nguyện viên.");
      } else {
        toast.error("Hệ thống bận, vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };


  if (isLoading || checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p className="text-sm font-medium text-gray-500">Đang xác thực thông tin tài khoản...</p>
      </div>
    );
  }

  if (success) {
    return (
        <Link href={"/"}></Link>
    );
  }

return (
  <form
    onSubmit={handleSubmit}
    noValidate
  >

    <div className="grid grid-cols-2 gap-3 h-full">

      <section className="border rounded-xl bg-white p-3 sm:p-4 space-y-3">
        <h2 className="text-base font-semibold"> 
          1. Thông tin cá nhân
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <FieldShell label="Họ và tên" htmlFor="fullName" error={submitted ? errors.fullName : ""}>
            <input
              className="w-full border rounded-md px-2 py-1.5 text-sm"
              value={values.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
            />
          </FieldShell>

          <FieldShell label="Số điện thoại" htmlFor="phone" error={submitted ? errors.phone : ""}>
            <input
              className="w-full border rounded-md px-2 py-1.5 text-sm"
              value={values.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </FieldShell>

          <FieldShell label="Email" htmlFor="email" error={submitted ? errors.email : ""}>
            <input
              className="w-full border rounded-md px-2 py-1.5 text-sm"
              value={values.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </FieldShell>

          <FieldShell label="Địa chỉ" htmlFor="address" error={submitted ? errors.address : ""}>
            <input
              className="w-full border rounded-md px-2 py-1.5 text-sm"
              value={values.address}
              onChange={(e) => setField("address", e.target.value)}
            />
          </FieldShell>

        </div>
      </section>


      <section className="border rounded-xl bg-white p-3 sm:p-4 space-y-3">
        <h2 className="text-base font-semibold">
          2. Kỹ năng & kinh nghiệm
        </h2>

        <FieldShell label="Kỹ năng" htmlFor="skills" error={submitted ? errors.skills : ""}>
          <textarea
            rows={3}
            className="w-full border rounded-md px-2 py-1.5 text-sm"
            value={values.skills}
            onChange={(e) => setField("skills", e.target.value)}
          />
        </FieldShell>

        <FieldShell label="Kinh nghiệm" htmlFor="experience" error={submitted ? errors.experience : ""}>
          <textarea
            rows={4}
            className="w-full border rounded-md px-2 py-1.5 text-sm"
            value={values.experience}
            onChange={(e) => setField("experience", e.target.value)}
          />
        </FieldShell>
      </section>

    </div>


    <section className="border rounded-xl bg-white p-3 sm:p-4 space-y-3">

      <h2 className="text-base font-semibold">
        3. Thông tin hỗ trợ
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        <FieldShell label="Thời gian hỗ trợ" htmlFor="availableDays" error={submitted ? errors.availableDays : ""}>
          <input
            className="w-full border rounded-md px-2 py-1.5 text-sm"
            value={values.availableDays}
            onChange={(e) => setField("availableDays", e.target.value)}
          />
        </FieldShell>

<FieldShell label="Loại hỗ trợ" htmlFor="supportType">
  <select
    className="w-full border rounded-md px-2 py-1.5 text-sm"
    value={values.supportType}
    onChange={(e) => setField("supportType", e.target.value)}
  >
    <option value="">Chọn</option>
    {SUPPORT_TYPES.map((item) => (
      <option key={item.value} value={item.value}>
        {item.label}
      </option>
    ))}
  </select>

  {values.supportType === "other" && (
    <div className="mt-2">
      <label className="text-sm font-medium text-gray-700">
        Mô tả loại hỗ trợ
      </label>

      <input
        className="w-full border rounded-md px-2 py-1.5 text-sm mt-1"
        value={values.otherSupportDesc ?? ""}
        onChange={(e) =>
          setField("otherSupportDesc", e.target.value)
        }
      />
    </div>
  )}
</FieldShell>

      </div>


      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Hình thức hỗ trợ
        </p>

        <div className="flex gap-2 flex-wrap">

          <label className="flex items-center gap-2 border rounded-md px-2 py-1 text-sm">
            <input
              type="checkbox"
              checked={values.inPerson}
              onChange={(e) => setField("inPerson", e.target.checked)}
            />
            Trực tiếp
          </label>

          <label className="flex items-center gap-2 border rounded-md px-2 py-1 text-sm">
            <input
              type="checkbox"
              checked={values.online}
              onChange={(e) => setField("online", e.target.checked)}
            />
            Online
          </label>

        </div>

        {submitted && errors.supportMode && (
          <p className="text-sm text-red-500">
            {errors.supportMode}
          </p>
        )}
      </div>


      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">

        <button
          type="button"
          onClick={() => router.push("/")}
          disabled={loading}
          className="sm:w-32 border rounded-md py-1.5 text-sm hover:bg-gray-50"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-md py-1.5 text-sm"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

      </div>

    </section>

  </form>
);
}