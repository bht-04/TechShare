"use client";

import { useAuth } from "@/context/AuthContext";
import ChatSidebar from "@/components/ChatSidebar";

export default function MessagesPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Vui lòng đăng nhập để xem tin nhắn</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white overflow-hidden">
        <ChatSidebar />
      </div>
      <div className="hidden md:flex md:flex-1 items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p>Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
      </div>
    </div>
  );
}