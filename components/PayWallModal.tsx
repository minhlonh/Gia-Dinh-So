"use client";

import { useState, useEffect } from "react";
import { Crown, Infinity as InfinityIcon, Gamepad2, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import { getRemainingUsage } from "@/lib/pricing";

export default function PayWallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");

  const checkUsage = () => {
    if (typeof window === "undefined") return;
    const remaining = getRemainingUsage();
    if (remaining <= 0) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    checkUsage();
    window.addEventListener("usage-updated", checkUsage);
    window.addEventListener("storage", checkUsage);
    return () => {
      window.removeEventListener("usage-updated", checkUsage);
      window.removeEventListener("storage", checkUsage);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden border-4 border-amber-300 my-8">
        
        {/* Banner Gradient Cam - Đỏ rực rỡ */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 text-center text-white relative">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur shadow-inner">
            <Crown className="h-10 w-10 text-yellow-200" />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Nâng cấp Gia đình Premium</h2>
          <p className="mt-2 text-amber-100 font-medium text-sm">
            Bảo vệ và kết nối trọn vẹn gia đình ba thế hệ
          </p>
        </div>

        {/* Nội dung chi tiết */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-center font-bold text-stone-800 text-lg">
            Bạn đã dùng hết 5 lượt miễn phí. Nâng cấp để cả nhà tiếp tục sử dụng không giới hạn.
          </p>

          {/* Danh sách quyền lợi */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-4 rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/80">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white shrink-0">
                <InfinityIcon className="h-6 w-6" />
              </div>
              <span className="font-bold text-stone-800 text-sm sm:text-base">
                Dùng không giới hạn mọi tính năng
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/80">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500 text-white shrink-0">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <span className="font-bold text-stone-800 text-sm sm:text-base">
                Chơi game, tra từ điển và tạo nhắc nhở thoải mái
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-amber-50/80 p-3.5 border border-amber-200/80">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500 text-white shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="font-bold text-stone-800 text-sm sm:text-base">
                Bảo vệ ông bà với cảnh báo lừa đảo mới nhất
              </span>
            </div>
          </div>

          {/* Chọn gói thanh toán */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedPlan("monthly")}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition ${
                selectedPlan === "monthly"
                  ? "border-orange-500 bg-orange-50/50 text-stone-900 font-bold"
                  : "border-stone-200 text-stone-600 font-medium"
              }`}
            >
              <span className="text-sm">Gói Hàng Tháng</span>
              <span className="text-xl font-extrabold text-orange-600 mt-1">49.000đ</span>
              <span className="text-xs text-stone-500">/ tháng</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan("yearly")}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition ${
                selectedPlan === "yearly"
                  ? "border-orange-500 bg-orange-50/50 text-stone-900 font-bold"
                  : "border-stone-200 text-stone-600 font-medium"
              }`}
            >
              <span className="absolute -top-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Tiết kiệm 30%
              </span>
              <span className="text-sm">Gói Hàng Năm</span>
              <span className="text-xl font-extrabold text-red-600 mt-1">399.000đ</span>
              <span className="text-xs text-stone-500">/ năm</span>
            </button>
          </div>

          {/* Nút hành động chính */}
          <button
            type="button"
            onClick={() => alert("Đang chuyển hướng sang cổng thanh toán VNPAY/Momo...")}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-4 text-lg sm:text-xl font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-6 w-6" />
            Nâng cấp Premium (không giới hạn)
          </button>
        </div>
      </div>
    </div>
  );
}
