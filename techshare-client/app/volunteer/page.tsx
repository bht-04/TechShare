import type { Metadata } from "next";
import Link from "next/link";

import RegisterAsVolunteer from "@/components/RegisterAsVolunteer";

export const metadata: Metadata = {
  title: "Trở thành tình nguyện viên | TechShare",
  description:
    "Đăng ký trở thành tình nguyện viên hỗ trợ công nghệ cùng TechShare.",
};

export default function VolunteerRegistrationPage() {
  return (
    <main className="">
        <div className="form-narrow">
          <RegisterAsVolunteer />
        </div>
    </main>
  );
}
