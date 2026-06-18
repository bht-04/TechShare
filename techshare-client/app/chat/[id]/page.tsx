"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/app/services/api";
import ChatBox from "@/components/ChatBox";
import Link from "next/link"; 
import { toast } from "sonner";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<{ name: string; id: string } | null>(null);
  const [userType, setUserType] = useState<"user" | "volunteer">("user");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (params.id && user?.id) {
      api.patch(`/chat/${params.id}/read`, { userId: user?.id }).catch(console.error);
    }
  }, [params.id, user?.id]);

  useEffect(() => {
    if (user?.id && params.id) {
      fetchRequestData();
    }
  }, [user, params.id]);

  const fetchRequestData = async () => {
    setLoading(true);
    try {
      const requestId = params.id as string;
      
      let isRegisteredVolunteer = false;
      let volunteerData: { _id?: string } | null = null;
      try {
        const volunteerCheck = await api.get(`/volunteers/check/${user?.id}`);
        const checkData = volunteerCheck.data as { isRegistered: boolean; volunteer: { _id?: string } | null };
        isRegisteredVolunteer = checkData.isRegistered;
        volunteerData = checkData.volunteer;
      } catch (error) {
        isRegisteredVolunteer = false;
      }

      let requestData: any = null;

      if (isRegisteredVolunteer) {
        try {
          const directResponse = await api.get(`/requests/${requestId}`);
          if (directResponse.data) {
            requestData = directResponse.data;
          }
        } catch (e) {}

        if (!requestData) {
          const pendingResponse = await api.get(`/requests/pending?volunteerId=${volunteerData?._id || ''}&userId=${user?.id}`);
          requestData = (pendingResponse.data as any[]).find((r) => r._id === requestId);
        }

        if (!requestData) {
          const userRequestsResponse = await api.get(`/requests/user/${user?.id}`);
          requestData = (userRequestsResponse.data as any[]).find((r) => r._id === requestId);
        }

        if (!requestData) {
          const allPendingResponse = await api.get("/requests/pending");
          requestData = (allPendingResponse.data as any[]).find((r) => r._id === requestId);
        }
      } else {
        const response = await api.get(`/requests/user/${user?.id}`);
        requestData = (response.data as any[]).find((r) => r._id === requestId);
      }

      if (requestData) {
        setRequest(requestData);
        
        const isCreator = requestData.userId === user?.id;
        const isAssignedVolunteer = requestData.volunteerId?._id === volunteerData?._id || 
                                      requestData.volunteerId?.toString() === volunteerData?._id?.toString();
        
        if (isCreator) {
          setUserType("user");
        } else if (isAssignedVolunteer) {
          setUserType("volunteer");
        } else {
          setUserType(isRegisteredVolunteer ? "volunteer" : "user");
        }
        
        if (isCreator) {
          setOtherUser({
            name: requestData.volunteerName || requestData.volunteerId?.fullName || "Tình nguyện viên",
            id: requestData.volunteerId?._id || requestData.volunteerName || ""
          });
        } else {
          setOtherUser({
            name: requestData.fullName,
            id: requestData.userId
          });
        }
      
        if (requestData.status === "completed" && !requestData.rating && isCreator && !redirecting) {
          setRedirecting(true);
          router.push(`/rate-request/${requestId}`);
          return;
        }
      } else {
        console.error("Không tìm thấy request với id:", requestId);
      }
    } catch (error) {
      console.error("Error fetching request:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Vui lòng đăng nhập</p>
        <Link href="/" className="text-blue-600 mt-2 inline-block">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không tìm thấy cuộc trò chuyện</p>
        <p className="text-sm text-gray-400 mt-2">Mã yêu cầu: {params.id}</p>
        <Link 
          href={userType === "volunteer" ? "/volunteer-dashboard" : "/my-requests"} 
          className="text-blue-600 mt-4 inline-block"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang chuyển hướng...</div>
      </div>
    );
  }

  const canChat = (request.status === "accepted" || request.status === "in-progress" || request.status === "pending_complete");

  if (!canChat) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Chưa thể chat vào lúc này</p>
        <p className="text-sm text-gray-400 mt-2">Trạng thái hiện tại: {request.status}</p>
        <Link 
          href={userType === "volunteer" ? "/volunteer-dashboard" : "/my-requests"} 
          className="text-blue-600 mt-4 inline-block"
        >
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-full mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600">
            Quay lạis
          </button>
        </div>
      </div> */}

      <div className="max-w-full">
        <ChatBox
          requestId={params.id as string}
          otherUserName={otherUser?.name || "Đối tác"}
          otherUserId={otherUser?.id || ""}
          currentUserType={userType}
          currentStatus={request?.status}
          currentUserId={user?.id}
          requestCreatorId={request?.userId}
          onComplete={() => {
            toast.success("Đã gửi yêu cầu xác nhận!");
            router.push("/volunteer-dashboard");
          }}
        />
      </div>
    </div>
  );
}