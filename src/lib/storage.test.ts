import { describe, expect, it } from "vitest";
import {
  getWordStatus,
  normalizeProgress,
  selectDueWords,
  selectNextStudyWord
} from "./storage";
import type { VocabularyWord, WordProgress } from "../types";

const words: VocabularyWord[] = [
  {
    id: "ngsl-0001",
    lemma: "the",
    rank: 1,
    sfi: 87.85,
    frequencyPerMillion: 60910,
    definitionEn: "used to refer to something already mentioned",
    ipa: "ðə"
  },
  {
    id: "ngsl-0002",
    lemma: "be",
    rank: 2,
    sfi: 86.86,
    frequencyPerMillion: 48575,
    definitionEn: "to exist",
    ipa: "biː"
  },
  {
    id: "ngsl-0003",
    lemma: "and",
    rank: 3,
    sfi: 84.88,
    frequencyPerMillion: 30789,
    definitionEn: "used to connect words",
    ipa: "ænd"
  }
];

function progress(overrides: Partial<WordProgress>): WordProgress {
  return {
    wordId: "ngsl-0001",
    status: "learning",
    reviewCount: 1,
    lastReviewedAt: "2026-07-16T00:00:00.000Z",
    nextReviewDate: "2026-07-17",
    latestRating: "good",
    createdAt: "2026-07-16T00:00:00.000Z",
    updatedAt: "2026-07-16T00:00:00.000Z",
    ...overrides
  };
}

describe("study queue selection", () => {
  it("excludes mastered words from the next study word", () => {
    const progressMap = new Map([
      ["ngsl-0001", progress({ wordId: "ngsl-0001", status: "mastered", nextReviewDate: null })]
    ]);

    expect(selectNextStudyWord(words, progressMap, "2026-07-17")?.id).toBe("ngsl-0002");
  });

  it("returns due learning words before new words", () => {
    const progressMap = new Map([
      ["ngsl-0001", progress({ wordId: "ngsl-0001", status: "mastered", nextReviewDate: null })],
      ["ngsl-0003", progress({ wordId: "ngsl-0003", status: "learning", nextReviewDate: "2026-07-17" })]
    ]);

    expect(selectDueWords(words, progressMap, "2026-07-17").map((word) => word.id)).toEqual(["ngsl-0003"]);
    expect(selectNextStudyWord(words, progressMap, "2026-07-17")?.id).toBe("ngsl-0003");
  });

  it("treats legacy progress without status as learning", () => {
    const legacy = progress({ status: undefined as unknown as WordProgress["status"] });
    const normalized = normalizeProgress(legacy);
    const progressMap = new Map([["ngsl-0001", normalized]]);

    expect(normalized.status).toBe("learning");
    expect(getWordStatus("ngsl-0001", progressMap)).toBe("learning");
  });
});
