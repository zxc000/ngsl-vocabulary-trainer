import vocabularyData from "../data/vocabulary.json";
import type { VocabularyWord } from "../types";

export const vocabulary = vocabularyData as VocabularyWord[];

export const vocabularyById = new Map(vocabulary.map((word) => [word.id, word]));

export function findVocabularyWord(wordId: string): VocabularyWord | undefined {
  return vocabularyById.get(wordId);
}

export function searchVocabulary(query: string): VocabularyWord[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return vocabulary;
  }

  return vocabulary.filter((word) => word.lemma.toLowerCase().includes(normalized));
}
