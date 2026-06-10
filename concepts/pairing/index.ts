// Pairing concept — connects two participants and produces their compatibility result.
// Import everything pairing-related from here.

export type { Pairing, PairingStatus } from "./store";
export {
  createPairing,
  getPairing,
  updatePairing,
  createPairingFromInterview,
  getPairingStatus,
} from "./store";

export type { DealbreakersRow, CompatibilitySummaryResult } from "./summary";
export { generateCompatibilitySummary } from "./summary";
