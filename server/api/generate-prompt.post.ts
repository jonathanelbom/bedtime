import OpenAI from "openai";
import { buildMetaPrompt } from "../utils/metaPrompt";
import { validatePrompt } from "../utils/validatePrompt";
import {
  normalizeUserContext,
  type RawFormInput,
} from "../utils/normalizeUserContext";
import { RESPONSE_FORMAT } from "../utils/responseFormat";
const isDev = process.env.NODE_ENV === "development";

const MOCK_PROMPT = `You are a rhythm-section consultant for modern pop and electronic music.

Your role is to help the creator make confident, feel-driven decisions about the rhythm section of their track.

You speak in emotion and metaphor — never music theory jargon. You assume the person you're talking to has good taste and just needs direction.

## TEMPO — The Pace of Confidence

Tempo is not a number. It is a feeling of intention. Choose a tempo where the groove arrives before the melody — somewhere between 80 and 95 BPM for a late-night, body-sway feel. Lock it in before you build anything else.

## DRUMS — Body Language, Not Energy

The kick is certainty. The snare is a suggestion. Hi-hats are the thing that makes you tilt your head — slightly off, slightly swung, never mechanical. Don't program energy. Program posture.

## BASS — The Emotional Translator

Bass is presence, not movement. Let it sit under everything like a held breath. When it moves, it moves with purpose — one note sliding into the next, no hurry, no performance.

## CHORDS — Color, Not Complexity

Two chords are enough. Three is a conversation. Pick a center and let the harmony drift slightly. Keep it minor-adjacent — somewhere between longing and ease.

## KEYS & SCALES — Mood Presets

Stay in a minor-adjacent space that doesn't commit to sadness. Minor Pentatonic or Dorian. Lock your instrument to a scale and play by feel rather than by knowledge.

## GUITAR — Human Air in the Machine

One riff, played once, recorded twice. The second take should feel slightly more tired than the first. Don't fix the timing. The humanness is the point.

## WHAT TO AVOID

Busy transitions. More than one lead element at a time. Fills that announce themselves. Any element that wants to be the main character. Reverb that makes things feel far away when they should feel present.`;

interface GeneratePromptBody {
  preferences: RawFormInput;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody<GeneratePromptBody>(event);

  if (!body.preferences) {
    throw createError({
      statusCode: 400,
      statusMessage: "preferences is required",
    });
  }

  if (config.mockAi === "true") {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return { prompt: MOCK_PROMPT + RESPONSE_FORMAT };
  }

  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "OpenAI API key is not configured",
    });
  }

  const context = normalizeUserContext(body.preferences);
  const openai = new OpenAI({ apiKey: config.openaiApiKey });
  const metaPrompt = buildMetaPrompt(context);

  if (isDev)
    console.log(
      "[server: preferences received]",
      JSON.stringify(body.preferences, null, 2),
    );
  if (isDev) console.log("[server: meta-prompt]", metaPrompt);

  async function generate(): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: metaPrompt }],
      stream: false,
    });
    return completion.choices[0]?.message?.content ?? "";
  }

  let prompt: string;
  try {
    prompt = await generate();
  } catch (err: any) {
    const code = err?.error?.code ?? err?.code;
    const status = err?.status ?? err?.statusCode;
    console.error(`[generate-prompt] OpenAI error — status: ${status}, code: ${code}, message: ${err?.message}`);
    if (code === "insufficient_quota") {
      throw createError({ statusCode: 402, statusMessage: "OpenAI quota exhausted — add credits to your account." });
    }
    if (status === 429) {
      throw createError({ statusCode: 429, statusMessage: "Rate limit reached. Please try again in a moment." });
    }
    throw err;
  }

  if (!validatePrompt(prompt)) {
    prompt = await generate();
    if (!validatePrompt(prompt)) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Failed to generate a valid system prompt after two attempts",
      });
    }
  }

  prompt = prompt + RESPONSE_FORMAT;

  if (isDev) console.log("[server: generated-system-prompt]", prompt);
  return { prompt };
});
