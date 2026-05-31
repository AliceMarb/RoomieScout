import { getOpenAI, MODEL } from "@/lib/openai";
import type { Message } from "@/lib/transcriptStore";
import type { PersonaResult } from "./types";

const CLASSIFIER_PROMPT = `You are a personality classifier for RoomieScout. Based on a full interview transcript between Scout (the interviewer) and a user, classify the user into their top 3 roommate persona types.

Choose from these persona types:
- The Neat Freak: obsessively tidy, high cleanliness standards, notices messes immediately
- The Social Butterfly: loves hosting, always has people over, thrives on social energy at home
- The Homebody: prefers staying in, values a cozy and quiet home environment
- The Night Owl: stays up late, most productive/active in the evening and night
- The Early Bird: up at dawn, morning routines are sacred, early to bed
- The Peacekeeper: avoids conflict, accommodating, prioritizes harmony above personal preferences
- The Independent: values autonomy, prefers minimal interaction with roommates, self-sufficient
- The Collaborator: loves shared activities, communal cooking, bonding with roommates
- The Minimalist: few possessions, values empty space, dislikes clutter from others
- The Free Spirit: spontaneous, flexible with routines, relaxed about rules and structure

Analyze what the user actually revealed through their answers — not what they aspire to be. Look at specific behaviors, habits, and reactions they described.

Assign percentage weights to the top 3 that sum to 100. Provide a one-line rationale for each based on specific things the user said.

Respond ONLY with this JSON (no markdown, no extra text):
{
  "personas": [
    { "type": "The Neat Freak", "weight": 45, "rationale": "..." },
    { "type": "The Homebody", "weight": 35, "rationale": "..." },
    { "type": "The Early Bird", "weight": 20, "rationale": "..." }
  ]
}`;

function formatTranscript(transcript: Message[]): string {
  return transcript
    .map((m) => `${m.speaker === "ai" ? "Scout" : "User"}: ${m.text}`)
    .join("\n");
}

export async function classifyPersona(transcript: Message[]): Promise<PersonaResult> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CLASSIFIER_PROMPT },
        { role: "user", content: `INTERVIEW TRANSCRIPT:\n${formatTranscript(transcript)}` },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from classifier");

    const parsed = JSON.parse(raw) as PersonaResult;

    if (!Array.isArray(parsed.personas) || parsed.personas.length === 0) {
      throw new Error("Invalid personas array");
    }

    return {
      personas: parsed.personas.slice(0, 3).map((p) => ({
        type: p.type,
        weight: p.weight,
        rationale: p.rationale,
      })),
    };
  } catch (err) {
    console.error("[classifier]", err);
    return {
      personas: [
        { type: "The Free Spirit", weight: 40, rationale: "Could not classify — defaulting" },
        { type: "The Independent", weight: 35, rationale: "Could not classify — defaulting" },
        { type: "The Peacekeeper", weight: 25, rationale: "Could not classify — defaulting" },
      ],
    };
  }
}
