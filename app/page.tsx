"use client";

import { AdaptiveWrapper } from "@/components/AdaptiveWrapper";
import { FamilySetup, MemberManager } from "@/components/FamilySetup";
import GenZDictionary from "@/components/GenZDictionary";
import ScamAlertsAndReminders from "@/components/ScamAlertsAndReminders";
import FamilyGames from "@/components/games/FamilyGames";
import StoryTree from "@/components/StoryTree";
import PaywallModal from "@/components/PayWallModal"; // Chú ý chữ W viết hoa ở PayWallModal
import { useFamily } from "@/context/FamilyContext";

export default function HomePage() {
  const { family } = useFamily();

  return (
    <AdaptiveWrapper>
      <main className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
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
      <PaywallModal />
    </AdaptiveWrapper>
  );
}
