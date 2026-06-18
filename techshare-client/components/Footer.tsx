"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-blue-600">
              TechShare
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Kết nối công nghệ cho cộng đồng, hỗ trợ người lớn tuổi tiếp cận công nghệ dễ dàng hơn.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Nền tảng
            </h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block text-gray-600 hover:text-blue-600">
                Trang chủ
              </Link>
              <Link href="/RequestAssistance" className="block text-gray-600 hover:text-blue-600">
                Hỗ trợ
              </Link>
              <Link href="/services/volunteer" className="block text-gray-600 hover:text-blue-600">
                Tình nguyện viên
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Hỗ trợ
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>0123 456 789</p>
              <p>techshare@gmail.com</p>
              <p>24/7 Online</p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Cộng đồng
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p className="hover:text-blue-600 cursor-pointer">Facebook</p>
              <p className="hover:text-blue-600 cursor-pointer">Discord</p>
              <p className="hover:text-blue-600 cursor-pointer">GitHub</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TechShare. All rights reserved.
        </div>
      </div>
    </footer>
  );
}