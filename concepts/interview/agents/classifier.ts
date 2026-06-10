import { getOpenAIAsync, MODEL } from "@/infrastructure/openai";
import { formatTranscript } from "./format";
import { buildPersonaFromAxes } from "@/concepts/personas";
import type { Persona } from "@/concepts/personas";
import type { Message } from "../session";
import { weave } from "@/infrastructure/weave";

type HmtiClassification = {
  cleanliness: { pole: "N" | "C"; strength: number };
  social: { pole: "P" | "O"; strength: number };
  rhythm: { pole: "S" | "F"; strength: number };
  rules: { pole: "D" | "L"; strength: number };
};

const CLASSIFIER_PROMPT = `You are the HMTI (Housemate Type Indicator) classifier for Homi. Based on a full interview transcript, classify this person on four roommate compatibility axes.

THE FOUR AXES:

1. CLEANLINESS (N vs C)
   N = Neat: Prefers shared spaces consistently clean. Dishes done quickly, trash out regularly, minimal clutter. Stressed by mess.
   C = Casual: Relaxed about mess. Tolerates dishes left for later, occasional clutter, flexible cleaning. Uncomfortable with strict cleaning rules.
   Look for: What they notice about mess, how quickly they clean up, their reaction to others' mess, cleaning frequency, pet peeves about shared spaces.

2. HOME SOCIAL STYLE (P vs O)
   P = Private: Values personal space, quiet, independence at home. Limited roommate interaction. Few unexpected guests. Peaceful environment.
   O = Open: Enjoys communal home. Talking with roommates, shared meals, friends visiting, warm atmosphere. Feels isolated when everyone avoids interaction.
   Look for: Guest frequency, how they feel about roommate interaction, whether home is sanctuary vs social space, alone time needs.

3. LIFESTYLE RHYTHM (S vs F)
   S = Stable: Consistent schedule. Predictable sleep times, regular work hours, consistent quiet hours. Bothered by unpredictable noise or schedule changes.
   F = Fluid: Flexible schedule. Changing sleep times, spontaneous routines, variable cooking/bathroom times. Feels restricted by rigid schedules.
   Look for: Sleep schedule consistency, work patterns, how they describe their daily routine, reaction to unpredictability.

4. AGREEMENT STYLE (D vs L)
   D = Defined: Prefers clear agreements and explicit expectations about chores, guests, noise, expenses, and conflict resolution. Anxious when expectations are vague.
   L = Laid-back: Prefers informal understanding. Fewer formal agreements, solving issues as they come, trusting common sense. Feels controlled by too many rules.
   Look for: How they handle conflict, whether they want written rules, how they've resolved past roommate issues, preference for structure vs flexibility.

CLASSIFICATION RULES:
- Analyze what the user ACTUALLY revealed through their answers, not aspirational statements
- Strength ranges from 55 (slight lean) to 95 (very strong lean)
- Use specific things they said as evidence
- The transcript is tagged with which interview agent asked each question (e.g., "Scout [cleanliness]: ...")

Respond ONLY with this JSON (no markdown, no extra text):
{
  "cleanliness": { "pole": "N" or "C", "strength": 55-95 },
  "social": { "pole": "P" or "O", "strength": 55-95 },
  "rhythm": { "pole": "S" or "F", "strength": 55-95 },
  "rules": { "pole": "D" or "L", "strength": 55-95 }
}`;

const AXIS_LEFT_POLES = ["N", "P", "S", "D"];

export const classifyPersona = weave.op(async function classifyPersona(
  transcript: Message[],
): Promise<Persona> {
  try {
    const completion = await (await getOpenAIAsync()).chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CLASSIFIER_PROMPT },
        { role: "user", content: `INTERVIEW TRANSCRIPT:\n${formatTranscript(transcript)}` },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from HMTI classifier");

    const parsed = JSON.parse(raw) as HmtiClassification;

    const keys: Array<keyof HmtiClassification> = ["cleanliness", "social", "rhythm", "rules"];

    const choices = keys.map((key, i) => {
      const axis = parsed[key];
      return {
        chosen: (axis.pole === AXIS_LEFT_POLES[i] ? "left" : "right") as "left" | "right",
        strength: Math.max(55, Math.min(95, axis.strength)),
      };
    });

    return buildPersonaFromAxes(choices);
  } catch (err) {
    console.error("[hmti-classifier]", err);
    return buildPersonaFromAxes([
      { chosen: "left", strength: 65 },
      { chosen: "left", strength: 65 },
      { chosen: "left", strength: 65 },
      { chosen: "right", strength: 65 },
    ]);
  }
});
