import { NextResponse } from "next/server";
import { generateAvatarImage } from "@/concepts/personas/generate";
import { isValidHmtiCode } from "@/concepts/personas";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      code?: string;
      style?: "classic" | "cool";
      preview?: boolean;
    };
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "code is required (e.g. NPSD)" }, { status: 400 });
    }
    if (!isValidHmtiCode(code)) {
      return NextResponse.json({ error: `Unknown HMTI code: ${code}` }, { status: 400 });
    }

    const style = body.style ?? "cool";
    const result = await generateAvatarImage(code, {
      style,
      outputSubpath: body.preview ? `previews/${code}` : undefined,
    });

    return NextResponse.json({
      ok: true,
      code: result.code,
      model: result.model,
      style: result.style,
      preview: Boolean(body.preview),
      imageUrl: result.publicPath,
      prompt: result.prompt,
    });
  } catch (err) {
    console.error("[/api/avatars/generate]", err);
    const message = (err as Error).message;
    const status = message.includes("OPENAI_API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
