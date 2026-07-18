export type OwnerMemoryScope = "PUBLIC" | "NEVER_PUBLISH";

const PRIVATE_LANGUAGE =
  /\b(?:private|privately|only for me|just for me|do not publish|don't publish|never publish|keep this between us)\b/i;

const MEMORY_INTENT =
  /^\s*(?:hey[,!]?\s*)?(?:please\s+)?(?:(?:can|could|would)\s+you\s+)?remember\b|\b(?:save|store|keep|add)\b[\s\S]{0,48}\b(?:memory|knowledge(?:\s+base)?)\b/i;

function cleanMemoryContent(message: string) {
  const trimmed = message.trim();
  const colon = trimmed.match(/\b(?:memory|knowledge(?:\s+base)?)\s*:\s*([\s\S]+)/i);
  if (colon?.[1]) return colon[1].trim();

  const remember = trimmed.match(/^\s*(?:hey[,!]?\s*)?(?:please\s+)?(?:(?:can|could|would)\s+you\s+)?remember(?:\s+(?:that|this))?[,;:]?\s+([\s\S]+)/i);
  if (remember?.[1]) return remember[1].trim();

  const saveBefore = trimmed.match(
    /^\s*(?:hey[,!]?\s*)?(?:please\s+)?(?:save|store|keep|add)\s+([\s\S]+?)\s+(?:to|in|as)\s+(?:my\s+|the\s+|your\s+)?(?:memory|knowledge(?:\s+base)?)(?:\.|!|\s)*$/i,
  );
  if (saveBefore?.[1] && !/^(?:this|that|it)$/i.test(saveBefore[1].trim())) {
    return saveBefore[1].trim();
  }

  return trimmed;
}

export function ownerMemoryScope(message: string): OwnerMemoryScope {
  return PRIVATE_LANGUAGE.test(message) ? "NEVER_PUBLISH" : "PUBLIC";
}

export function parseOwnerMemoryCommand(message: string) {
  if (/^(?:what|how much|do you|does (?:he|it))\b[\s\S]*\bremember\s+(?:about|from|of)\b/i.test(message.trim())) {
    return null;
  }
  if (!MEMORY_INTENT.test(message)) return null;
  const content = cleanMemoryContent(message);
  if (!content) return null;
  return { content, scope: ownerMemoryScope(message) };
}
