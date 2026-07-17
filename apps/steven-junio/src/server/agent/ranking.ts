export interface RankedKnowledge {
  score: number;
}

export function rankRetrievedKnowledge<T extends RankedKnowledge>(items: T[], limit: number) {
  return items
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
