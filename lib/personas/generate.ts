/** Server-side avatar image generation via OpenAI image models. */

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type OpenAI from "openai";
import { getOpenAIAsync } from "@/lib/openai";
import { buildAvatarImagePrompt } from "./image-prompt";
import { isValidHmtiCode } from "./persona";
import type { AvatarPromptStyle } from "./types";

/** Absolute filesystem dir where avatar PNGs are written (server-only). */
export const AVATAR_IMAGE_DIR = path.join(process.cwd(), "public", "avatars");
export const DEFAULT_IMAGE_MODEL = "gpt-image-1";

export type GenerateAvatarOptions = {
  /** Prompt tone — default cool for new generations */
  style?: AvatarPromptStyle;
  /** e.g. "previews/NOFD" writes public/avatars/previews/NOFD.png (won't overwrite production) */
  outputSubpath?: string;
};

export type GenerateAvatarResult = {
  code: string;
  model: string;
  publicPath: string;
  filePath: string;
  prompt: string;
  style: AvatarPromptStyle;
};

function isGptImageModel(model: string): boolean {
  return model.startsWith("gpt-image");
}

async function generateImageB64(
  openai: OpenAI,
  model: string,
  prompt: string,
): Promise<{ b64: string; model: string }> {
  const run = async (m: string) => {
    if (isGptImageModel(m)) {
      return openai.images.generate({
        model: m,
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "high",
        output_format: "png",
      });
    }
    return openai.images.generate({
      model: m,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json",
    });
  };

  try {
    const response = await run(model);
    const b64 = response.data?.[0]?.b64_json;
    if (b64) return { b64, model };
    throw new Error("No image data in response");
  } catch (primaryErr) {
    if (model === "dall-e-3") throw primaryErr;
    console.warn(`[generateAvatarImage] ${model} failed, trying dall-e-3:`, primaryErr);
    const fallback = await run("dall-e-3");
    const b64 = fallback.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image generation returned no image data");
    return { b64, model: "dall-e-3" };
  }
}

export async function generateAvatarImage(
  code: string,
  options: GenerateAvatarOptions = {},
): Promise<GenerateAvatarResult> {
  const normalized = code.toUpperCase();
  if (!isValidHmtiCode(normalized)) {
    throw new Error(`Unknown HMTI code: ${code}`);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const style = options.style ?? "cool";
  const prompt = buildAvatarImagePrompt(normalized, style);
  const openai = await getOpenAIAsync();
  const primaryModel = process.env.OPENAI_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL;

  const { b64, model } = await generateImageB64(openai, primaryModel, prompt);

  const relPath = options.outputSubpath
    ? `${options.outputSubpath.replace(/\.png$/i, "")}.png`
    : `${normalized}.png`;
  const filePath = path.join(AVATAR_IMAGE_DIR, relPath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from(b64, "base64"));

  const publicPath = `/avatars/${relPath.split(path.sep).join("/")}`;

  return {
    code: normalized,
    model,
    publicPath,
    filePath,
    prompt,
    style,
  };
}
