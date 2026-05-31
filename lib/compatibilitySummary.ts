import { getOpenAI, MODEL } from "@/lib/openai";

export type DealbreakersRow = {
  topic: string;       // e.g. "Smoking", "Pets", "Guest frequency"
  personA: string;     // e.g. "Non-smoker", "Has a dog"
  personB: string;
  compatible: boolean; // true = aligned, false = conflict
};

export type CompatibilitySummaryResult = {
  aiSummary: string;
  dealbreakers: DealbreakersRow[];
};

const SCHEMA = {
  name: "compatibility_summary",
  strict: true,
  schema: {
    type: "object",
    properties: {
      aiSummary: {
        type: "string",
        description: "2-4 sentence friendly Scout summary, specific to what they actually said. Max 4 lines.",
      },
      dealbreakers: {
        type: "array",
        description: "Key compatibility points — 4 to 8 rows covering the most important topics found in the transcripts.",
        items: {
          type: "object",
          properties: {
            topic: { type: "string", description: "Short label, e.g. 'Smoking', 'Pets', 'Cleanliness'" },
            personA: { type: "string", description: "One short phrase describing Person A on this topic" },
            personB: { type: "string", description: "One short phrase describing Person B on this topic" },
            compatible: { type: "boolean", description: "True if they are aligned or compatible on this topic" },
          },
          required: ["topic", "personA", "personB", "compatible"],
          additionalProperties: false,
        },
      },
    },
    required: ["aiSummary", "dealbreakers"],
    additionalProperties: false,
  },
};

export async function generateCompatibilitySummary(
  personATranscript: string,
  personBTranscript: string,
  overallScore: number,
): Promise<CompatibilitySummaryResult> {
  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    response_format: { type: "json_schema", json_schema: SCHEMA },
    messages: [
      {
        role: "system",
        content: `You are Scout, a warm and perceptive roommate compatibility assistant.

For aiSummary: Write 2-4 sentences that are specific to what these two people actually said. Reference real details from their answers (habits, preferences, pet peeves). Use "You both..." or "Where you might bump heads..." to make it personal. Tone: friendly and honest, like a perceptive friend. If score is high (≥75) lead with what they share. If low (<55) be honest but kind. No em dashes. No mention of numbers or scores.

For dealbreakers: Extract 4-8 key compatibility topics from the transcripts. Only include topics that are actually mentioned or clearly implied. Each row should compare where Person A and Person B stand. Mark compatible=true if they align, false if they conflict.`,
      },
      {
        role: "user",
        content: `Overall compatibility: ${overallScore}/100

PERSON A:
${personATranscript}

PERSON B:
${personBTranscript}`,
      },
    ],
    temperature: 0.6,
    max_completion_tokens: 600,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from compatibility summary");
  return JSON.parse(raw) as CompatibilitySummaryResult;
}
