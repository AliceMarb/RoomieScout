/**
 * Personality-interaction analysis: axis-combo → predicted dynamic → advice.
 * Programmatic lookup over the fixed HMTI v2 trait set — no LLM needed.
 */

import type { Persona, PersonalityInteraction } from "./types";

type PairingKey = `${string}×${string}`;

const PAIRINGS: Partial<Record<PairingKey, Omit<PersonalityInteraction, "axisName" | "traitA" | "traitB">>> = {
  "Casual×Neat": {
    dynamic: "The Neat person gets quietly frustrated while the Casual person has no idea anything is wrong — because the Neat person won't raise it and the Casual person won't notice. Resentment builds on one side; total obliviousness on the other.",
    advice: [
      "Set the cleanliness standard upfront as a neutral house rule — that way Neat never has to 'confront', they just point to the agreement.",
      "Make expectations concrete and visible (dishes done same night, a light chore rota) so Casual has a clear bar without needing to 'just notice'.",
      "Give Neat a low-stakes channel — a shared note or quick text — so speaking up doesn't feel like confrontation.",
      "Casual: treat a single mention as a real signal. Neat won't repeat it.",
    ],
  },
  "Neat×Neat": {
    dynamic: "You're aligned on cleanliness — one of the most common friction points removed. The risk is competing perfectionism.",
    advice: [
      "Agree on a shared standard early (what does 'clean' mean specifically) rather than each enforcing your own mental model.",
      "Divide areas by preference — whoever cares most about a specific space takes ownership.",
    ],
  },
  "Casual×Casual": {
    dynamic: "Neither of you is bothered by mess so cleaning will happen infrequently. Low-friction unless one person turns out to be 'more casual' than the other.",
    advice: [
      "Decide on a minimum bar — even just 'no dishes for more than 48 hours' — so the default isn't total chaos.",
      "Consider a cleaning service if it becomes an issue; it removes the 'whose turn is it' dynamic.",
    ],
  },
  "Open×Private": {
    dynamic: "The Open person feels the apartment is a bit cold — they want connection and the door is always figuratively closed. The Private person feels mildly invaded whenever the Open person wants to hang. Neither is doing anything wrong; the friction is structural.",
    advice: [
      "Agree on the apartment's social default: is the living room communal or each person's territory when in use?",
      "An explicit signal for 'up for chat' vs 'in my own space' removes the guesswork.",
      "Open: plan social time outside the apartment so the need is met elsewhere.",
      "Private: a brief check-in a few times a week goes a long way for the other person.",
    ],
  },
  "Open×Open": {
    dynamic: "You both want connection and a social home — naturally compatible. Watch for the case where one is significantly more extroverted and the other ends up feeling obligated.",
    advice: ["Have a low-pressure way to opt out — 'I'm doing my own thing tonight' should need no explanation."],
  },
  "Private×Private": {
    dynamic: "You both value solo time and won't intrude. The risk is the apartment never feels warm and you never actually know each other.",
    advice: ["Optional shared moments (dinner once a week, coffee in the morning) build enough connection without requiring energy."],
  },
  "Direct×Harmonious": {
    dynamic: "Direct raises issues promptly; Harmonious absorbs them and hopes they pass. Direct reads Harmonious's silence as passive aggression; Harmonious finds Direct's directness jarring. Over time, Direct keeps raising things Harmonious has already 'moved on from' — creating a loop of tension.",
    advice: [
      "Direct: soften delivery when raising issues — Harmonious is more likely to engage if it doesn't feel like confrontation.",
      "Harmonious: a brief 'I'm fine, just processing' prevents Direct from assuming silence means something's wrong.",
      "Agree on a low-stakes channel for small things (a text, not a conversation).",
      "Direct: raise one thing at a time and give it space to land.",
    ],
  },
  "Direct×Direct": {
    dynamic: "Both of you say what you mean — issues get resolved quickly. The risk is two Direct people clashing sharply and both feeling the other is being unnecessarily aggressive.",
    advice: [
      "Agree that directness is a shared value, not a competition.",
      "Give each other 24 hours before raising something if either person is heated.",
    ],
  },
  "Harmonious×Harmonious": {
    dynamic: "Neither of you will raise a problem directly. Nothing gets confrontational — but nothing gets resolved. Small irritants quietly accumulate until one person has had enough and the conversation is suddenly much bigger than it needed to be.",
    advice: [
      "Agree to a low-stakes channel for small things — a shared note, a text, a weekly 5-minute check-in.",
      "When something starts to bother you, say it early.",
      "Normalise 'I just want to flag this' as a phrase — it signals you're not attacking, just communicating.",
    ],
  },
  "Flexible×Structured": {
    dynamic: "Structured wants agreements upfront; Flexible resists committing before they're needed. Structured interprets Flexible's resistance as not caring; Flexible interprets Structured's need for rules as micromanaging.",
    advice: [
      "Reframe for Flexible: it's not rules — it's a one-time conversation that prevents many awkward future ones.",
      "Structured: keep the list short and high-impact. Three agreements you both honour beats twelve that feel like a contract.",
      "Build in a review: 'we can always adjust' makes Flexible more willing to commit.",
      "Flexible: honour the few agreements you do make — that gives Structured enough security to stop needing more.",
    ],
  },
  "Structured×Structured": {
    dynamic: "Both of you want clarity and upfront agreements — strong alignment. The risk is getting into a standoff when your specific preferences conflict.",
    advice: ["Work through key areas before move-in so each of your lists is visible and can be negotiated early."],
  },
  "Flexible×Flexible": {
    dynamic: "Nothing feels like a big deal — both adaptable, no formal agreements needed. Low-friction until one person needs something and neither has the conversational muscles to ask for it.",
    advice: [
      "When something starts to bother you, say it early.",
      "Establish one simple logistical baseline (how shared costs get split) so the relaxed approach doesn't create financial fuzziness.",
    ],
  },
};

function canonicalKey(a: string, b: string): PairingKey {
  const [x, y] = [a, b].sort();
  return `${x}×${y}` as PairingKey;
}

export function getPersonalityInteractions(
  personaA: Persona,
  personaB: Persona,
): PersonalityInteraction[] {
  return personaA.axes.map((axisA, i) => {
    const axisB = personaB.axes[i];
    const traitA = axisA.chosen === "left" ? axisA.left : axisA.right;
    const traitB = axisB.chosen === "left" ? axisB.left : axisB.right;
    const pairing = PAIRINGS[canonicalKey(traitA, traitB)];
    if (pairing) return { axisName: axisA.name, traitA, traitB, ...pairing };
    return {
      axisName: axisA.name, traitA, traitB,
      dynamic: `Both of you are ${traitA === traitB ? traitA : `${traitA} and ${traitB}`} on ${axisA.name}. You're aligned here.`,
      advice: ["Alignment on this axis means fewer conversations needed — use the energy elsewhere."],
    };
  });
}
