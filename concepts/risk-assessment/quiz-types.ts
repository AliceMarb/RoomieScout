export type AxisId = "cleanliness" | "social" | "conflict" | "structure";
export type Pole = "N" | "C" | "P" | "O" | "D" | "H" | "S" | "F";

export interface PoleDef {
  letter: Pole;
  word: string;
}

export interface AxisDef {
  id: AxisId;
  label: string;
  poles: [PoleDef, PoleDef]; // [primary, secondary]
}

export interface QuizQuestion {
  id: string;
  text: string;
  kind: "dealbreaker" | "axis";
  topic?: string; // dealbreakers only
  axis?: AxisId; // axis questions only
  pole?: Pole; // YES adds to this pole
}

export interface AxisResult {
  axis: AxisId;
  axisLabel: string;
  score: number; // 0–100; 100 = fully primary pole, 0 = fully secondary
  primaryPole: Pole;
  primaryPoleLabel: string;
  secondaryPole: Pole;
  secondaryPoleLabel: string;
}
