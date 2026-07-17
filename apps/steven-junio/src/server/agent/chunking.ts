export function chunkKnowledge(content: string, maxCharacters = 1_200) {
  const paragraphs = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((value) => value.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxCharacters) {
      if (current) chunks.push(current);
      current = "";
      for (let index = 0; index < paragraph.length; index += maxCharacters - 120) {
        chunks.push(paragraph.slice(index, index + maxCharacters));
      }
      continue;
    }
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxCharacters) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
