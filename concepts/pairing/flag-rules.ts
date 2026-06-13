/**
 * Deterministic flag rules — no LLM.
 * Each rule inspects two PracticalProfiles + ApartmentSetup and returns a flag
 * when there is a likely friction point.
 */

import type { PracticalProfile, ApartmentSetup } from "./practical-profile";
import type { PracticalFlag } from "@/concepts/personas";

type Rule = (a: PracticalProfile, b: PracticalProfile, setup: ApartmentSetup) => PracticalFlag | null;

const bathroomCrunch: Rule = (a, b, setup) => {
  if (setup.bathrooms !== "one") return null;
  const earlyBoth =
    (a.bathroomTime === "before_7am" || a.bathroomTime === "7_to_9am") &&
    (b.bathroomTime === "before_7am" || b.bathroomTime === "7_to_9am");
  const longBoth =
    (a.routineLength === "30_to_45min" || a.routineLength === "45min_plus") &&
    (b.routineLength === "30_to_45min" || b.routineLength === "45min_plus");
  if (!earlyBoth && !longBoth) return null;
  return {
    id: "bathroom_crunch", severity: "high",
    title: "Bathroom bottleneck",
    detail: "One bathroom, both of you need it during the same window in the morning.",
    talkAbout: "Agree on a morning schedule — staggered start times or who showers the night before.",
  };
};

const wfhNoiseClash: Rule = (a, b, setup) => {
  if (setup.commonSpace !== "open_plan") return null;
  const oneLoudCalls = a.callsFromHome === "yes_regularly" || b.callsFromHome === "yes_regularly";
  const bothHome =
    (a.homeDuringDay === "most_days" || a.homeDuringDay === "some_days") &&
    (b.homeDuringDay === "most_days" || b.homeDuringDay === "some_days");
  if (!oneLoudCalls || !bothHome) return null;
  return {
    id: "wfh_noise", severity: "high",
    title: "WFH noise conflict",
    detail: "Open-plan layout + both home during the day + loud video calls = no escape from each other's work.",
    talkAbout: "Decide on call hours, a signal for 'in a meeting', or whether a co-working space makes sense.",
  };
};

const sleepScheduleClash: Rule = (a, b, setup) => {
  if (setup.walls !== "thin") return null;
  const clash =
    (a.sleepSchedule === "early_bird" && b.sleepSchedule === "night_owl") ||
    (a.sleepSchedule === "night_owl" && b.sleepSchedule === "early_bird");
  if (!clash) return null;
  return {
    id: "sleep_clash", severity: "high",
    title: "Night owl + early bird (thin walls)",
    detail: "One of you is up late, the other is up early — and the walls won't protect either person.",
    talkAbout: "Quiet hours: agree on a time after which headphones are on and kitchen noise stops.",
  };
};

const lightSleeperNightNoise: Rule = (a, b) => {
  const conflict =
    (a.sleepType === "light_sleeper" && b.nightNoise === "full_volume_fine") ||
    (b.sleepType === "light_sleeper" && a.nightNoise === "full_volume_fine");
  if (!conflict) return null;
  return {
    id: "light_sleeper_noise", severity: "medium",
    title: "Light sleeper vs. night noise",
    detail: "One person is a light sleeper while the other is fine with full-volume audio at night.",
    talkAbout: "Headphones after a set time — decide on the cut-off together.",
  };
};

const dishesTension: Rule = (a, b) => {
  const tension =
    (a.dishTolerance === "same_night" && b.dishTolerance === "few_days") ||
    (b.dishTolerance === "same_night" && a.dishTolerance === "few_days");
  if (!tension) return null;
  return {
    id: "dishes_tension", severity: "medium",
    title: "Dish timeline mismatch",
    detail: "One of you cleans up the same night; the other is fine leaving dishes for days.",
    talkAbout: "Set a house rule: dishes done within X hours of cooking — pick a number you both accept.",
  };
};

const foodSharingConflict: Rule = (a, b) => {
  const conflict =
    (a.foodSharing === "communal" && b.foodSharing === "separate") ||
    (a.foodSharing === "separate" && b.foodSharing === "communal");
  if (!conflict) return null;
  return {
    id: "food_sharing", severity: "medium",
    title: "Food-sharing mismatch",
    detail: "One person wants communal groceries; the other wants own-shelf separation.",
    talkAbout: "Decide upfront: separate shelves/sections, or communal with equal contribution tracking.",
  };
};

const guestFrequencyConflict: Rule = (a, b) => {
  const conflict =
    (a.guestFrequency === "rarely" && b.guestFrequency === "often") ||
    (a.guestFrequency === "often" && b.guestFrequency === "rarely");
  if (!conflict) return null;
  return {
    id: "guest_frequency", severity: "medium",
    title: "Guest expectations differ",
    detail: "One person rarely wants guests; the other sees the apartment as a social space.",
    talkAbout: "Agree on notice periods, frequency limits (if any), and quiet days.",
  };
};

const temperatureWar: Rule = (a, b) => {
  const war =
    (a.tempPreference === "cool" && b.tempPreference === "warm") ||
    (a.tempPreference === "warm" && b.tempPreference === "cool");
  if (!war) return null;
  return {
    id: "temperature", severity: "low",
    title: "Thermostat disagreement",
    detail: "One person runs hot, the other runs cold.",
    talkAbout: "Set a compromise temperature range, or alternate who controls it seasonally.",
  };
};

const conflictAvoidantPair: Rule = (a, b) => {
  if (!(a.conflictApproach === "avoid" && b.conflictApproach === "avoid")) return null;
  return {
    id: "both_avoid_conflict", severity: "medium",
    title: "Neither of you addresses problems directly",
    detail: "Two conflict-avoiders often end up with nothing discussed and resentment building silently.",
    talkAbout: "Agree to a low-stakes channel (group chat, shared note) so issues don't have to be 'a conversation'.",
  };
};

const livingInPartnerDealbreaker: Rule = (a, b) => {
  const conflict =
    (a.livingInPartner === "dealbreaker" && b.livingInPartner !== "dealbreaker") ||
    (b.livingInPartner === "dealbreaker" && a.livingInPartner !== "dealbreaker");
  if (!conflict) return null;
  return {
    id: "partner_dealbreaker", severity: "high",
    title: "Partner moving in: dealbreaker vs. fine",
    detail: "One person considers a partner effectively living in to be a dealbreaker; the other doesn't.",
    talkAbout: "Clarify what 'basically living here' means — nights per week, sharing costs, advance notice.",
  };
};

const ALL_RULES: Rule[] = [
  bathroomCrunch, wfhNoiseClash, sleepScheduleClash, lightSleeperNightNoise,
  dishesTension, foodSharingConflict, guestFrequencyConflict, temperatureWar,
  conflictAvoidantPair, livingInPartnerDealbreaker,
];

const ORDER = { high: 0, medium: 1, low: 2 } as const;

export function runFlagRules(
  profileA: PracticalProfile,
  profileB: PracticalProfile,
  setup: ApartmentSetup,
): PracticalFlag[] {
  const flags: PracticalFlag[] = [];
  for (const rule of ALL_RULES) {
    try { const f = rule(profileA, profileB, setup); if (f) flags.push(f); } catch { /* never crash */ }
  }
  return flags.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
}

export function buildConversationList(flags: PracticalFlag[]): string[] {
  return flags.map((f) => f.talkAbout);
}
