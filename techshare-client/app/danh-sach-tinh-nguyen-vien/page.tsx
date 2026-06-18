"use client";

import { useEffect, useState } from "react";
import { volunteerApi } from "@/app/services/api";
import VolunteerCard from "@/components/VolunteerCard";

interface Volunteer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  university: string;
  major: string;
  skills: string[];
  supportType: string;
   otherSupportDesc?: string;
  inPerson: boolean;
  online: boolean;
  avatarUrl: string;
  status: string;
}

export default function VolunteersListPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 6;

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const data = await volunteerApi.getAll();
      setVolunteers(data);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    const matchesSearch =
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || v.supportType === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredVolunteers.length / itemsPerPage);
const paginatedVolunteers = filteredVolunteers.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, filterType]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-500">Đang tải danh sách tình nguyện viên...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-[90vh]">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Đội ngũ tình nguyện viên
        </h1>
        <p className="text-gray-600">
          Chúng tôi luôn hỗ trợ các bạn!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc kỹ năng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl"
        >
          <option value="all">Tất cả</option>
          <option value="smartphone">Hỗ trợ Smartphone</option>
          <option value="computer">Hỗ trợ Máy tính</option>
          <option value="security">Bảo mật Online</option>
          <option value="office">Microsoft Office</option>
          <option value="other">Khác</option>
        </select>
      </div>

      {filteredVolunteers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">Không tìm thấy tình nguyện viên nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedVolunteers.map((volunteer) => (
            <VolunteerCard key={volunteer._id} volunteer={volunteer} />
          ))}
        </div>
      )}
            {totalPages > 1 && (
  <div className="flex items-center justify-center gap-3 mt-8">
    <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1}>Trang trước</button>
    <span>Trang {currentPage} / {totalPages}</span>
    <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>Trang sau</button>
  </div>
)}
    </div>
  );
}