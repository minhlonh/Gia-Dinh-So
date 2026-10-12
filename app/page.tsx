"use client";

import { useState } from "react";
import { AdaptiveWrapper } from "@/components/AdaptiveWrapper";
import { FamilySetup, MemberManager } from "@/components/FamilySetup";
import GenZDictionary from "@/components/GenZDictionary";
import ScamAlertsAndReminders from "@/components/ScamAlertsAndReminders";
import FamilyGames from "@/components/games/FamilyGames";
import StoryTree from "@/components/StoryTree";
import PayWallModal from "@/components/PayWallModal";
import { useFamily } from "@/context/FamilyContext";
import { CreditCard } from "lucide-react";

export default function HomePage() {
  const { family } = useFamily();
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <AdaptiveWrapper>
      <main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
        {/* Nút kiểm tra bảng giá & nâng cấp gói */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowPaywall(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 font-bold text-white shadow-md transition hover:scale-105"
          >
            <CreditCard className="h-5 w-5" />
            Nâng cấp gói / Bảng giá
          </button>
        </div>

        {!family ? (
          <FamilySetup />
        ) : (
          <>
            <MemberManager />
            <GenZDictionary />
            <ScamAlertsAndReminders />
            <StoryTree />
            <FamilyGames />
          </>
        )}
      </main>

      {/* Modal thanh toán */}
      <PayWallModal />
    </AdaptiveWrapper>
  );
}
