"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/login");
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 3)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white font-semibold text-sm hover:bg-gray-700 transition-colors ring-2 ring-blue-100"
        aria-label="Menu người dùng"
      >
        {initials || "TS"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="font-medium text-gray-800 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Link
            href="/volunteer-profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <FaUserCircle className="text-base" />
            Hồ sơ của tôi
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <FaSignOutAlt className="text-base" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
