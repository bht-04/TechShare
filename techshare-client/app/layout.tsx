import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechShare - Nền tảng kết nối gia sư công nghệ miễn phí",
  description:
    "Nền tảng hỗ trợ công nghệ miễn phí cho người lớn tuổi và cộng đồng",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} max-h-screen`}>
        <Providers>
          <AppShell>{children}</AppShell>
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
