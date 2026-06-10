/** Persona lookups and construction from HMTI axis choices. */

import { HMTI_AXES, PERSONAS } from "./data";
import type { Persona, PersonaAxis, PersonaMeta } from "./types";

/** Full metadata for a code (falls back to NPSD for unknown codes). */
export function getPersonaMeta(code: string): PersonaMeta {
  return PERSONAS[code.toUpperCase()] ?? PERSONAS.NPSD;
}

/** Back-compat alias — prefer {@link getPersonaMeta}. */
export const getHmtiAvatarMeta = getPersonaMeta;

/** Whether `code` is one of the 16 known HMTI codes. */
export function isValidHmtiCode(code: string): boolean {
  return code.toUpperCase() in PERSONAS;
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Build an HMTI Persona from axis choices (used by the AI classifier). */
export function buildPersonaFromAxes(
  choices: Array<{ chosen: "left" | "right"; strength: number }>,
): Persona {
  const axes: PersonaAxis[] = HMTI_AXES.map((axis, i) => ({
    name: axis.name,
    left: axis.a.trait,
    right: axis.b.trait,
    chosen: choices[i].chosen,
    strength: choices[i].strength,
  }));
  const code = HMTI_AXES.map((axis, i) =>
    choices[i].chosen === "left" ? axis.a.letter : axis.b.letter,
  ).join("");
  const { title, emoji, description } = PERSONAS[code];
  return { code, title, emoji, description, axes };
}

/**
 * Build a persona from a participant's free-text input.
 * Deterministic hash-based fallback — used when no AI classification is available.
 */
export function computePersona(input: string): Persona {
  const choices = HMTI_AXES.map((axis) => ({
    chosen: (hash(input + axis.salt) % 2 === 0 ? "left" : "right") as "left" | "right",
    strength: 55 + (hash(input + axis.salt + "s") % 41),
  }));
  return buildPersonaFromAxes(choices);
}
