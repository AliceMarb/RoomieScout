export type ProcessSubmissionInput = {
  text: string;
};

export type ProcessSubmissionResult = {
  message: string;
};

/**
 * Placeholder for future business logic.
 * Wire real processing (DB writes, LLM calls, integrations, etc.) in here.
 */
export async function processSubmission(
  input: ProcessSubmissionInput,
): Promise<ProcessSubmissionResult> {
  return {
    message: "Hello World!",
  };
}
