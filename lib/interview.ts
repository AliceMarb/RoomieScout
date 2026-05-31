// TODO: Replace SCOUT_INTRO and INTERVIEW_QUESTIONS with a Claude-driven flow.
// The full agent prompt (persona, methodology, topic areas) is in lib/scoutPrompt.ts.
// When wiring Claude in: pass SCOUT_SYSTEM_PROMPT as the system message and stream
// Scout's responses instead of serving hardcoded text from this file.

export const SCOUT_INTRO =
  "Hi there! I'm Scout — I'm so glad you're here. I'm a friendly interviewer helping you find your perfect roommate match through RoomieScout. This will only take a few minutes. I'll ask you some questions and all you have to do is speak your answers. There are no right or wrong answers — just be yourself! Let's get started.";

export const INTERVIEW_QUESTIONS = [
  "Tell me a bit about yourself — where are you from and what do you do?",
  "What's your typical daily schedule like?",
  "How would you describe your cleanliness and tidiness habits?",
  "Are you more of a homebody or do you tend to be out most of the time?",
  "Do you have any pets, or would you be okay living with someone who does?",
  "How do you feel about having guests over?",
  "What's your approach to shared expenses and splitting costs?",
  "Do you smoke, or are you okay living with someone who does?",
  "What are your deal-breakers in a roommate?",
  "Is there anything else you'd like a potential roommate to know about you?",
];
