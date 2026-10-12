"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Gamepad2, Infinity as InfinityIcon, Loader2, ShieldCheck } from "lucide-react";
import { useFamily } from "@/context/FamilyContext";
import { supabase } from "@/lib/supabase";
import { PLANS, YEAR_SAVING_PERCENT, type PlanId } from "@/lib/pricing";

type Order = { code: string; amount: number; qrUrl: string };

export default function PaywallModal() {
  const { paywallOpen, closePaywall, upgrade, activatePremium, hasBackend, lang, t } = useFamily();
  const [plan, setPlan] = useState<PlanId>("year");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const tokenRef = useRef("");

  const L = (vi: string, en: string) => (lang === "vi" ? vi : en);
  const money = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

  const perks = [
    { icon: InfinityIcon, text: t("paywallPerk1") },
    { icon: Gamepad2, text: t("paywallPerk2") },
    { icon: ShieldCheck, text: t("paywallPerk3") },
  ];

  const planCards: { id: PlanId; title: string; sub: string; badge?: string }[] = [
    { id: "month", title: L("Gói tháng", "Monthly"), sub: L("30 ngày", "30 days") },
    {
      id: "year",
      title: L("Gói năm", "Yearly"),
      sub: L("365 ngày", "365 days"),
      badge: YEAR_SAVING_PERCENT > 0 ? L(`Tiết kiệm ${YEAR_SAVING_PERCENT}%`, `Save ${YEAR_SAVING_PERCENT}%`) : undefined,
    },
  ];

  const close = useCallback(() => {
    setOrder(null);
    setError(false);
    closePaywall();
  }, [closePaywall]);

  async function startPayment() {
    // Không có backend: giữ chế độ demo cũ
    if (!hasBackend || !supabase) {
      upgrade();
      return;
    }

    setLoading(true);
    setError(false);
    try {
      let { data } = await supabase.auth.getSession();
      if (!data.session) {
        const res = await supabase.auth.signInAnonymously();
        data = { session: res.data.session };
      }
      const token = data.session?.access_token;
      if (!token) throw new Error("no session");
      tokenRef.current = token;

      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("create failed");
      setOrder((await res.json()) as Order);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Cứ 3 giây hỏi server xem đơn đã được thanh toán chưa
  useEffect(() => {
    if (!order || !paywallOpen) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/create?code=${order.code}`, {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        });
        const { status } = (await res.json()) as { status: string };
        if (status === "paid") {
          clearInterval(timer);
          setOrder(null);
          activatePremium();
        }
      } catch {
        /* thử lại ở lần sau */
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [order, paywallOpen, activatePremium]);

  return (
    <AnimatePresence>
      {paywallOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="paywall-title"
            className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white text-slate-900 shadow-2xl"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-6 text-center text-white">
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2.4 }}
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/25"
              >
                <Crown className="h-9 w-9" aria-hidden />
              </motion.div>
              <h2 id="paywall-title" className="text-2xl font-extrabold">{t("paywallTitle")}</h2>
            </div>

            <div className="space-y-4 p-6">
              {!order ? (
                <>
                  <p className="text-base text-slate-700">{t("paywallBody")}</p>
                  <ul className="space-y-3">
                    {perks.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-start gap-3 text-sm font-medium">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={L("Chọn gói", "Choose a plan")}>
                    {planCards.map((p) => {
                      const selected = plan === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setPlan(p.id)}
                          className={`relative rounded-2xl border-2 p-4 text-center transition ${
                            selected ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {p.badge && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                              {p.badge}
                            </span>
                          )}
                          <p className="font-bold">{p.title}</p>
                          <p className="text-2xl font-extrabold text-orange-600">{money(PLANS[p.id].price)}</p>
                          <p className="text-xs text-slate-500">{p.sub}</p>
                        </button>
                      );
                    })}
                  </div>

                  {error && (
                    <p className="text-sm font-semibold text-red-600">
                      {L("Không tạo được mã thanh toán, vui lòng thử lại.", "Could not create the payment code. Please try again.")}
                    </p>
                  )}
                  <button
                    onClick={() => void startPayment()}
                    disabled={loading}
                    className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-base font-extrabold text-white shadow-lg transition hover:brightness-110 disabled:opacity-70"
                  >
                    {loading && <Loader2 className="h-5 w-5 animate-spin" aria-hidden />}
                    {t("paywallCta")}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    {L("Quét mã QR bằng app ngân hàng để thanh toán", "Scan the QR code with your banking app")}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.qrUrl} alt="QR" className="mx-auto w-56 rounded-xl border" />
                  <p className="mt-3 text-sm">
                    {L("Số tiền", "Amount")}: <b>{money(order.amount)}</b>
                  </p>
                  <p className="text-sm">
                    {L("Nội dung chuyển khoản", "Transfer note")}: <b>{order.code}</b>
                  </p>
                  <p className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {L("Đang chờ thanh toán, tự động mở khóa khi nhận được tiền", "Waiting for payment, unlocks automatically once received")}
                  </p>
                </div>
              )}

              <button
                onClick={close}
                className="min-h-[44px] w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                {t("paywallLater")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
