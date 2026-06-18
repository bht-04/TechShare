"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import {
  FaHome,
  FaComments,
  FaUsers,
  FaBook,
  FaClipboardList,
  FaTachometerAlt,
  FaUserCircle,
  FaEdit,
} from "react-icons/fa";
import logo from "../app/logo_techshare.png";

interface HeaderProps {
  onClose?: () => void;
}

export default function Header({ onClose }: HeaderProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const displayName = user?.fullName || user?.email?.split("@")[0] || "bạn";

  const menuItems = [
    { name: "Trang chủ", href: "/", icon: FaHome },
    { name: "Yêu cầu hỗ trợ", href: "/RequestAssistance", icon: FaComments },
    { name: "Lịch sử yêu cầu hỗ trợ", href: "/my-requests", icon: FaClipboardList },
    { name: "Tất cả tình nguyện viên", href: "/danh-sach-tinh-nguyen-vien", icon: FaUsers },
    { name: "Tài liệu TechShare", href: "/tai-nguyen", icon: FaBook },
    { name: "Hỗ trợ người dùng", href: "/volunteer-dashboard", icon: FaTachometerAlt },
    { name: "Hồ sơ tình nguyện viên", href: "/volunteer-profile", icon: FaUserCircle },
    { name: "Quản lý bài viết", href: "/tinh-nguyen-vien/bai-viet", icon: FaEdit },
    { name: "Tin nhắn", href: "/messages", icon: FaComments },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Mở menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 lg:flex-none text-center lg:text-left">
            {isLoading ? (
              <div className="h-7 w-40 bg-gray-200 rounded-lg animate-pulse mx-auto lg:mx-0" />
            ) : (
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                {isAuthenticated ? (
                  <>
                    <span className="text-blue-600 text-ellipsis line-clamp-2 w-auto"></span>
                  </>
                ) : (
                  <span className="text-gray-500 text-sm"></span>
                )}
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isLoading ? (
              <>
                <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              </>
            ) : (
              <>
                {isAuthenticated && <NotificationBell />}

                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/login"
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Đăng ký
                    </Link>
                  </>
                ) : (
                  <UserMenu />
                )}
              </> 
            )}
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2">
                <img src={logo.src} alt="TechShare Logo" className="h-[48px] w-full object-cover" />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Đóng menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isAuthenticated && user && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border-b border-blue-100">
                <UserMenu />
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Icon className="text-xl shrink-0" />
                      <span className="text-base font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">Cần giúp đỡ?</p>
                <a href="tel:+84973112480" className="text-xs text-blue-600 hover:underline mt-1 block">
                  +84 973 112 480
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
