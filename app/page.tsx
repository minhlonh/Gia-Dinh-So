"use client";

import { AdaptiveWrapper } from "@/components/AdaptiveWrapper";
import { FamilySetup, MemberManager } from "@/components/FamilySetup";
import GenZDictionary from "@/components/GenZDictionary";
import ScamAlertsAndReminders from "@/components/ScamAlertsAndReminders";
import FamilyGames from "@/components/games/FamilyGames";
import StoryTree from "@/components/StoryTree";
import PayWallModal from "@/components/PayWallModal";
import { useFamily } from "@/context/FamilyContext";
import { incrementUsage } from "@/lib/usage";

export default function HomePage() {
  const { family } = useFamily();

  // Bắt sự kiện người dùng nhấp vào các tính năng để tính 1 lần dùng
  const handleFeatureClick = () => {
    incrementUsage();
  };

  return (
    <AdaptiveWrapper>
      <main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
        {!family ? (
          <FamilySetup />
        ) : (
          <div onClickCapture={handleFeatureClick}>
            <MemberManager />
            <GenZDictionary />
            <ScamAlertsAndReminders />
            <StoryTree />
            <FamilyGames />
          </div>
        )}
      </main>
      <PayWallModal />
    </AdaptiveWrapper>
  );
}
