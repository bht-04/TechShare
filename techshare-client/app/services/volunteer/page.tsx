"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { volunteerApi } from "@/app/services/api";

const FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Smartphone", value: "smartphone" },
  { label: "Máy tính", value: "computer" },
  { label: "Bảo mật Online", value: "security" },
] as const;

interface IVolunteer {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  address: string;
  university: string;
  major: string;
  skills: string[];
  experience: string;
  availableDays: string;
  supportType: string;
  inPerson: boolean;
  online: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export default function VolunteerPage() {
  const [volunteers, setVolunteers] = useState<IVolunteer[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // pagination
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await volunteerApi.getAll({
        search: searchQuery,
        supportType: activeFilter,
      });
      setVolunteers(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [activeFilter, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const maxPage = Math.ceil(volunteers.length / itemsPerPage);

  const paginated = volunteers.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const getSpecialtyLabel = (type: string) => {
    const found = FILTERS.find((f) => f.value === type);
    return found ? `Hỗ trợ ${found.label}` : "Tình nguyện viên CNTT";
  };

  const renderRatingStars = (avgRating: number = 5) => {
    const rounded = Math.round(avgRating);
    return (
      <span className="flex items-center gap-0.5 text-yellow-400 text-sm">
        {"★".repeat(rounded)}
        <span className="text-gray-300">
          {"☆".repeat(5 - rounded)}
        </span>
      </span>
    );
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 flex flex-col">

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="space-y-4">

          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
            Kết nối tình nguyện viên công nghệ
          </h1>

          <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
            Nhận hỗ trợ từ cộng đồng sinh viên CNTT trên toàn quốc
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 flex-col sm:flex-row"
          >
            <input
              className="flex-1 px-4 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo tên..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Tìm kiếm
            </button>
          </form>
        </header>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setActiveFilter(item.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                activeFilter === item.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Trang {page + 1} / {maxPage || 1}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm bg-white border rounded-lg disabled:opacity-40"
            >
              Back
            </button>

            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, maxPage - 1))
              }
              disabled={page >= maxPage - 1}
              className="px-3 py-1.5 text-sm bg-white border rounded-lg disabled:opacity-40"
            >
              Next 
            </button>
          </div>
        </div>

        {/* LIST */}
        {loading ? (
          <div className="text-center text-gray-500 py-10">
            Đang tải dữ liệu...
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Không có dữ liệu
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {paginated.map((v, i) => (
              <article
                key={v._id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition p-5 flex flex-col"
              >
                <div className="flex gap-3">
                  <img
                    src={
                      v.avatarUrl ||
                      `https://i.pravatar.cc/150?img=${i + 1}`
                    }
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {v.fullName}
                    </h2>
                    <p className="text-xs text-blue-600">
                      {getSpecialtyLabel(v.supportType)}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      {renderRatingStars(v.averageRating)}
                      <span className="text-xs text-gray-400">
                        {v.averageRating?.toFixed(1) || "5.0"} ({v.totalReviews || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* skills */}
                <div className="mt-4 flex flex-wrap gap-1">
                  {v.skills?.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-1 bg-gray-100 rounded-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* meta */}
                <p className="text-xs text-gray-500 mt-3">
                  Địa chỉ: {v.address}
                </p>

                <Link
                  href="/RequestAssistance"
                  className="mt-4 block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg text-sm"
                >
                  Liên hệ
                </Link>
              </article>
            ))}

          </section>
        )}

        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="px-4 py-2 border rounded-lg bg-white disabled:opacity-40"
          >
            ← Back
          </button>

          <button
            onClick={() =>
              setPage((p) => Math.min(p + 1, maxPage - 1))
            }
            disabled={page >= maxPage - 1}
            className="px-4 py-2 border rounded-lg bg-white disabled:opacity-40"
          >
            Next →
          </button>
        </div>

      </div>
    </main>
  );
}