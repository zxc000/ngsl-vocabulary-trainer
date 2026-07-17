import type { ProgressStatus, VocabularyWord, WordProgress } from "../types";
import { getWordStatus } from "./storage";

export type StatusFilter = "all" | ProgressStatus;
export type IpaFilter = "all" | "has-ipa" | "missing-ipa";

export interface WordListFilters {
  query: string;
  status: StatusFilter;
  ipa: IpaFilter;
  rankFrom: string;
  rankTo: string;
}

export function filterVocabularyWords(
  words: VocabularyWord[],
  progress: Map<string, WordProgress>,
  filters: WordListFilters
): VocabularyWord[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const rankFrom = Number.parseInt(filters.rankFrom, 10);
  const rankTo = Number.parseInt(filters.rankTo, 10);
  const hasRankFrom = Number.isFinite(rankFrom);
  const hasRankTo = Number.isFinite(rankTo);

  return words.filter((word) => {
    const status = getWordStatus(word.id, progress);
    const matchesQuery = !normalizedQuery || word.lemma.toLowerCase().includes(normalizedQuery);
    const matchesStatus = filters.status === "all" || status === filters.status;
    const matchesRankFrom = !hasRankFrom || word.rank >= rankFrom;
    const matchesRankTo = !hasRankTo || word.rank <= rankTo;
    const matchesIpa =
      filters.ipa === "all" ||
      (filters.ipa === "has-ipa" && Boolean(word.ipa)) ||
      (filters.ipa === "missing-ipa" && !word.ipa);

    return matchesQuery && matchesStatus && matchesRankFrom && matchesRankTo && matchesIpa;
  });
}

export function getStatusLabel(status: ProgressStatus): string {
  const labels: Record<ProgressStatus, string> = {
    new: "未開始",
    learning: "學習中",
    mastered: "已掌握"
  };

  return labels[status];
}
