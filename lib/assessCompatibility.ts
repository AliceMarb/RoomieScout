import { getOpenAI, MODEL } from "@/lib/openai";

// ── Output types ─────────────────────────────────────────────────────────────

export type CompatibilityCategory = {
  name: string;
  score: number;      // 0-100
  reasoning: string;
};

export type Dealbreaker = {
  issue: string;
  severity: "hard" | "soft"; // hard = would definitely cause conflict, soft = worth discussing
};

export type CompatibilityResult = {
  overall_score: number;
  summary: string;
  categories: CompatibilityCategory[];
  dealbreakers: Dealbreaker[];
  strengths: string[];
};

// ── JSON schema for OpenAI structured output ──────────────────────────────────

const COMPATIBILITY_SCHEMA = {
  name: "compatibility_result",
  strict: true,
  schema: {
    type: "object",
    properties: {
      overall_score: {
        type: "integer",
        description: "Overall compatibility score from 0 to 100.",
      },
      summary: {
        type: "string",
        description: "1-2 sentence plain-English summary of the match.",
      },
      categories: {
        type: "array",
        description: "Scores for each of the 4 compatibility domains.",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            score: { type: "integer" },
            reasoning: {
              type: "string",
              description: "1-2 sentences explaining the score.",
            },
          },
          required: ["name", "score", "reasoning"],
          additionalProperties: false,
        },
      },
      dealbreakers: {
        type: "array",
        description: "Fundamental incompatibilities, if any. Empty array if none.",
        items: {
          type: "object",
          properties: {
            issue: { type: "string" },
            severity: {
              type: "string",
              enum: ["hard", "soft"],
              description: "hard = would definitely cause conflict. soft = worth discussing but workable.",
            },
          },
          required: ["issue", "severity"],
          additionalProperties: false,
        },
      },
      strengths: {
        type: "array",
        description: "2-4 specific things these two people have in common that make them good matches.",
        items: { type: "string" },
      },
    },
    required: ["overall_score", "summary", "categories", "dealbreakers", "strengths"],
    additionalProperties: false,
  },
};

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(personATranscript: string, personBTranscript: string): string {
  return `You are a roommate compatibility analyst. You've been given interview transcripts from two people considering living together. Your job is to assess how compatible they would be as roommates based on what they actually said — not what sounds ideal.

Be honest. A low score when warranted is more useful than false optimism. If there are genuine dealbreakers, name them clearly.

---

PERSON A's INTERVIEW TRANSCRIPT:
${personATranscript}

---

PERSON B's INTERVIEW TRANSCRIPT:
${personBTranscript}

---

Assess compatibility across exactly these 4 categories (use these exact names):
1. Cleanliness — tidiness standards, cleaning habits, tolerance for mess
2. Social & Guests — how often people come over, noise levels, need for quiet vs. social home
3. Communication — how they handle conflict, express needs, deal with awkward conversations
4. Personal Space — daily routines, alone time, schedule compatibility, boundaries

Scoring guide:
- 90-100: Near-perfect alignment — these two are unusually compatible in this area
- 75-89: Strong match — minor differences but likely to work out
- 60-74: Workable — real differences but compatible with communication
- 45-59: Significant tension — would require active management
- 0-44: Major incompatibility — likely to cause ongoing conflict

Dealbreakers:
- "hard": a fundamental incompatibility that would almost certainly cause serious conflict (e.g., one is extremely messy, other has clinical anxiety about cleanliness; one smokes indoors, other has asthma)
- "soft": a meaningful difference worth discussing before moving in, but resolvable with a conversation

Only flag actual dealbreakers. Do not manufacture conflict where the transcripts don't show any.

Overall score: a weighted average, but use your judgment — weight areas more heavily if the transcripts suggest they're what each person actually cares about most.`;
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function assessCompatibility(
  personATranscript: string,
  personBTranscript: string,
): Promise<CompatibilityResult> {
  const completion = await getOpenAI().chat.completions.create({
    model: MODEL,
    response_format: {
      type: "json_schema",
      json_schema: COMPATIBILITY_SCHEMA,
    },
    messages: [
      {
        role: "user",
        content: buildPrompt(personATranscript, personBTranscript),
      },
    ],
    temperature: 0.3, // low temp for consistent scoring
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from compatibility assessment");

  return JSON.parse(raw) as CompatibilityResult;
}
