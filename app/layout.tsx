"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import { FamilyProvider, useFamily } from "@/context/FamilyContext";
import { Heart, Globe } from "lucide-react";
import PayWallModal from "@/components/PayWallModal";
import { LANGS } from "@/lib/i18n";

function HeaderBar() {
  const [email, setEmail] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [remainingUsage, setRemainingUsage] = useState(5); // Số lượt dùng thử còn lại
  const { lang, setLang } = useFamily();

  // Đọc số lượt dùng còn lại từ localStorage
  useEffect(() => {
    const used = parseInt(localStorage.getItem("gia_dinh_so_usage") || "0", 10);
    setRemainingUsage(Math.max(0, 5 - used));
  }, []);

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    alert(`Đã gửi liên kết truy cập đến email: ${email}`);
    setEmail("");
  };

  return (
    <>
      <header className="w-full border-b border-stone-200 bg-amber-50/80 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500 text-white shadow-md">
              <Heart className="h-7 w-7 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">Gia Đình Số</h1>
              <p className="text-xs font-medium text-stone-600">
                Kết nối ba thế hệ · Giữ gìn kỷ niệm · Bảo vệ người thân
              </p>
            </div>
          </div>

          {/* Ô Email + Nút Lượt dùng thử + Đổi Ngôn ngữ */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Form nhập Email */}
            <form onSubmit={handleSendLink} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-full border-2 border-stone-800 bg-white px-4 text-sm font-medium text-stone-900 outline-none placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="h-11 rounded-full border-2 border-stone-800 bg-white px-5 text-sm font-bold text-stone-900 transition hover:bg-stone-100"
              >
                Gửi liên kết
              </button>
            </form>

            {/* Nút Còn X lượt dùng thử (Bấm vào mở Modal Bảng Giá) */}
            <button
              type="button"
              onClick={() => setShowPaywall(true)}
              className="h-11 rounded-full bg-red-600 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-red-700 hover:scale-105"
            >
              Còn {remainingUsage} lượt dùng thử
            </button>

            {/* Selector Đổi Ngôn ngữ */}
            <div className="relative flex items-center">
              <Globe className="absolute left-3.5 h-4 w-4 text-stone-700 pointer-events-none" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="h-11 rounded-full border-2 border-stone-800 bg-white pl-9 pr-8 text-sm font-bold text-stone-900 outline-none appearance-none cursor-pointer"
              >
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Bảng Giá / Thanh Toán */}
      {showPaywall && <PayWallModal onClose={() => setShowPaywall(false)} />}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <FamilyProvider>
          <HeaderBar />
          {children}
        </FamilyProvider>
      </body>
    </html>
  );
}
