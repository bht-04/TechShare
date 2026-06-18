"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  if (!isLoading && isAuthenticated) {
    router.replace("/");
  }
}, [isLoading, isAuthenticated, router]);

if (isAuthenticated) return null;

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setSubmitting(true);
    try {
      await register(fullName.trim(), email.trim(), password);
      toast.success("Đăng ký thành công! Chào mừng bạn đến với TechShare");
      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel--brand">
        <div className="auth-brand-content">
          <h1>Trở thành thành viên TechShare</h1>
          <p>
            Chung tay hỗ trợ cộng đồng tiếp cận công nghệ an toàn và hiện đại hơn mỗi
            ngày.
          </p>
          <ul className="">
            <li>Tạo yêu cầu hỗ trợ công nghệ</li>
            <li>Đăng ký làm tình nguyện viên</li>
            <li>Truy cập tài liệu & cộng đồng</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel--form">
        <div className="auth-box">
          <div className="auth-box-header">
            <h1>Đăng ký</h1>
            <p className="auth-subtitle">Tạo tài khoản TechShare miễn phí</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-field">
              <label htmlFor="register-name">Họ và tên</label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                required
                minLength={2}
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-password">Mật khẩu</label>
              <div className="form-input-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input form-input--with-icon"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="form-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="register-confirm">Xác nhận mật khẩu</label>
              <input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Đang xử lý…" : "Tạo tài khoản"}
            </button>
          </form>

          <p className="auth-footer">
            Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
