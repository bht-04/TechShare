"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

useEffect(() => {
  if (!isLoading && isAuthenticated) {
    router.replace("/");
  }
}, [isLoading, isAuthenticated, router]);

if (isAuthenticated) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      toast.success("Đăng nhập thành công");
      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel--brand">
        <div className="auth-brand-content">
          <h1>Chào mừng đến với TechShare</h1>
          <p>
            Kết nối cộng đồng với công nghệ thông qua mạng lưới sinh viên CNTT tình nguyện
            trên toàn quốc.
          </p>
          <ul className="">
            <li>Hỗ trợ công nghệ miễn phí</li>
            <li>Kết nối tình nguyện viên uy tín</li>
            <li>Chat trực tiếp & theo dõi yêu cầu</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel--form">
        <div className="auth-box">
          <div className="auth-box-header">
            <h1>Đăng nhập</h1>
            <p className="auth-subtitle">Đăng nhập để tiếp tục sử dụng TechShare</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="form-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input form-input--with-icon"
                  required
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

            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Đang xử lý…" : "Đăng nhập"}
            </button>
          </form>

          <p className="auth-footer">
            Chưa có tài khoản? <Link href="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
