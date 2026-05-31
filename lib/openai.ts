import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const MODEL = "gpt-5.4-mini";

export const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
