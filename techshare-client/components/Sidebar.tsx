"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import { useEffect, useState } from "react";
import logo from "../app/logo_techshare.png";

import {
  FaHome,
  FaUserCircle,
  FaComments,
  FaUsers,
  FaBook,
  FaTachometerAlt,
  FaClipboardList,
  FaEdit,
} from "react-icons/fa";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [totalUnread, setTotalUnread] = useState(0);
  const [isVolunteer, setIsVolunteer] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkVolunteerStatus();
    }
  }, [user]);

  const checkVolunteerStatus = async () => {
    try {
      const response = await api.get(`/volunteers/check/${user?.id}`);
      setIsVolunteer(response.data.isRegistered);
    } catch {
      setIsVolunteer(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/chat/conversations", {
        params: { userId: user?.id },
      });
      const total = response.data.reduce(
        (sum: number, conv: { unreadCount: number }) => sum + conv.unreadCount,
        0
      );
      setTotalUnread(total);
    } catch {
      /* ignore */
    }
  };

  type MenuItem = {
    name: string;
    href: string;
    icon: typeof FaHome;
    badge?: number;
  };

  const baseMenuItems: MenuItem[] = [
    { name: "Trang chủ", href: "/", icon: FaHome },
    { name: "Yêu cầu hỗ trợ", href: "/RequestAssistance", icon: FaComments },
    { name: "Lịch sử yêu cầu hỗ trợ", href: "/my-requests", icon: FaClipboardList },
    { name: "Tất cả tình nguyện viên", href: "/danh-sach-tinh-nguyen-vien", icon: FaUsers },
    { name: "Tài liệu TechShare", href: "/tai-nguyen", icon: FaBook },
  ];

  const volunteerMenuItems: MenuItem[] = [
    { name: "Hỗ trợ người dùng", href: "/volunteer-dashboard", icon: FaTachometerAlt },
    { name: "Hồ sơ tình nguyện viên", href: "/volunteer-profile", icon: FaUserCircle },
    { name: "Quản lý bài viết", href: "/tinh-nguyen-vien/bai-viet", icon: FaEdit },
  ];

  const messagesMenuItem: MenuItem = {
    name: "Tin nhắn",
    href: "/messages",
    icon: FaComments,
    badge: totalUnread,
  };

  const menuItems = isVolunteer
    ? [...baseMenuItems, ...volunteerMenuItems, messagesMenuItem]
    : [...baseMenuItems, messagesMenuItem];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  if (isLoading) {
    return (
      <aside className="max-h-full w-auto bg-white border-r border-gray-200 shadow-lg flex flex-col">
        <div className="py-3 border-b border-gray-200 px-4">
          <div className="h-10 w-full rounded-xl bg-gray-200 animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-11 w-full rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </aside>
    );
  }

  return (
<aside className="h-screen w-64 bg-white border-r border-gray-200 shadow-lg flex flex-col">
      <div className="py-2 border-b border-gray-200 px-2">
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2">
          <img src={logo.src} alt="TechShare Logo" className="h-[48px] w-full object-cover" />
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                  active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="text-lg shrink-0" />
                  <span className="text-sm truncate">{item.name}</span>
                </div>
                {"badge" in item && (item.badge ?? 0) > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                    {(item.badge ?? 0) > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3">
          <a href="tel:+84973112480" className="text-xs text-blue-600 hover:underline">
            Cần giúp đỡ? +84 973 112 480
          </a>
        </div>
      </div>
    </aside>
  );
}
