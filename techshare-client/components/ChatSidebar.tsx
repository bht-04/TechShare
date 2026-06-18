"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Conversation {
  requestId: string;
  otherUser: {
    id: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: string;
  supportType: string;
}

interface ChatSidebarProps {
  onClose?: () => void;
}

export default function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.supportType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await api.get("/chat/conversations", {
        params: { userId: user?.id }
      });
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "accepted": return "Đã tiếp nhận";
      case "in-progress": return "Đang hỗ trợ";
      case "pending_complete": return "Chờ xác nhận";
      case "completed": return "Đã hoàn thành";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-yellow-500";
      case "in-progress": return "bg-green-500";
      case "pending_complete": return "bg-blue-500";
      case "completed": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getSupportTypeIcon = (type: string) => {
    switch (type) {
      case "smartphone": return "";
      case "security": return "";
      case "computer": return "";
      case "office": return "";
      default: return "";
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

if (loading) {
  return (
    <div className="flex flex-col h-full bg-white">
      
      <div className="p-4 border-b border-gray-200">
        
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 rounded-lg bg-gray-200 animate-pulse" />

          {onClose && (
            <div className="w-6 h-6 rounded bg-gray-200 animate-pulse lg:hidden" />
          )}
        </div>

        <div className="h-11 w-full rounded-xl bg-gray-200 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-4 border-b border-gray-100"
          >

            {/* <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" /> */}

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
              </div>
              <div className="mt-2 h-3 w-full rounded bg-gray-200 animate-pulse" />
              <div className="mt-2 h-3 w-24 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            Tin nhắn
            {/* {totalUnread > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                {totalUnread}
              </span>
            )} */}
          </h3>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc chủ đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-9 border border-gray-200 rounded-lg text-sm"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">
              {searchTerm ? "Không tìm thấy cuộc trò chuyện nào" : "Chưa có cuộc trò chuyện nào"}
            </p>
            {!searchTerm && (
              <p className="text-xs mt-1">
                Khi bạn nhận hỗ trợ hoặc được nhận hỗ trợ, tin nhắn sẽ xuất hiện tại đây
              </p>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = pathname === `/chat/${conv.requestId}`;
            const isCompleted = conv.status === "completed";
            
            return (
              <Link
                key={conv.requestId}
                href={`/chat/${conv.requestId}`}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  isActive ? "bg-blue-50" : ""
                } ${isCompleted ? "opacity-60" : ""}`}
              >
{/* <div className="relative flex-shrink-0">
  {conv.otherUser.avatarUrl ? (
    <img 
      src={conv.otherUser.avatarUrl} 
      alt={conv.otherUser.name}
      className="w-10 h-10 rounded-full object-cover border border-gray-200"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
      {conv.otherUser.name.charAt(0).toUpperCase()}
    </div>
  )}
  {!isCompleted && (
    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor(conv.status)} border-2 border-white`} />
  )}
</div> */}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-gray-800 truncate text-sm">
                      {conv.otherUser.name}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {/* <span className="text-xs">{getSupportTypeIcon(conv.supportType)}</span> */}
                    <p className="text-xs text-black truncate flex-1">
                    {conv.lastMessage}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {getStatusText(conv.status)}
                  </p>
                </div>

                {conv.unreadCount > 0 && !isActive && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </div>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}