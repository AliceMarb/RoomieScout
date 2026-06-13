"use client";

import dynamic from "next/dynamic";

// ssr: false must live in a Client Component. The quiz shuffles with
// Math.random() on mount — skipping SSR prevents the hydration mismatch.
const PersonalityQuiz = dynamic(() => import("@/components/PersonalityQuiz"), { ssr: false });

export default function PersonalityQuizClient({ flowId, skipIntro }: { flowId?: string; skipIntro?: boolean }) {
  return <PersonalityQuiz flowId={flowId} skipIntro={skipIntro} />;
}
