"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex items-center gap-4">
      <Link 
        href="/RequestAssistance"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Tìm hỗ trợ
      </Link>
    </div>
  );
}