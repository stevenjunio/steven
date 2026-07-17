import { PRIVATE_GUARDRAIL_LIMITS, PUBLIC_GUARDRAIL_LIMITS } from "./limits.ts";

export type InputValidationResult =
  | { ok: true; value: string; characterCount: number }
  | {
      ok: false;
      code: "invalid_type" | "empty" | "too_long" | "disallowed_control_character";
      maxCharacters?: number;
      characterCount?: number;
    };

function validateAgentMessage(value: unknown, maxCharacters: number): InputValidationResult {
  if (typeof value !== "string") return { ok: false, code: "invalid_type" };

  const normalized = value.normalize("NFC").trim();
  const characterCount = [...normalized].length;
  if (characterCount === 0) return { ok: false, code: "empty", characterCount };
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(normalized)) {
    return { ok: false, code: "disallowed_control_character", characterCount };
  }
  if (characterCount > maxCharacters) {
    return { ok: false, code: "too_long", maxCharacters, characterCount };
  }
  return { ok: true, value: normalized, characterCount };
}

export function validatePublicAgentMessage(value: unknown) {
  return validateAgentMessage(value, PUBLIC_GUARDRAIL_LIMITS.maxInputChars);
}

export function validatePrivateAgentMessage(value: unknown) {
  return validateAgentMessage(value, PRIVATE_GUARDRAIL_LIMITS.maxInputChars);
}
