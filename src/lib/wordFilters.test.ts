import { describe, expect, it } from "vitest";
import { filterVocabularyWords } from "./wordFilters";
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
    id: "ngsl-0500",
    lemma: "garden",
    rank: 500,
    sfi: 65.1,
    frequencyPerMillion: 220,
    definitionEn: "an area for growing plants",
    ipa: null
  },
  {
    id: "ngsl-1200",
    lemma: "listen",
    rank: 1200,
    sfi: 59.5,
    frequencyPerMillion: 80,
    definitionEn: "to use your ears",
    ipa: "ˈlɪs.ən"
  }
];

function progress(status: WordProgress["status"]): WordProgress {
  return {
    wordId: "ngsl-0001",
    status,
    reviewCount: 1,
    lastReviewedAt: null,
    nextReviewDate: null,
    latestRating: null,
    createdAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z"
  };
}

describe("filterVocabularyWords", () => {
  it("filters by status", () => {
    const progressMap = new Map([["ngsl-0001", progress("mastered")]]);

    const result = filterVocabularyWords(words, progressMap, {
      query: "",
      status: "mastered",
      ipa: "all",
      rankFrom: "",
      rankTo: ""
    });

    expect(result.map((word) => word.id)).toEqual(["ngsl-0001"]);
  });

  it("filters by rank range", () => {
    const result = filterVocabularyWords(words, new Map(), {
      query: "",
      status: "all",
      ipa: "all",
      rankFrom: "400",
      rankTo: "1300"
    });

    expect(result.map((word) => word.id)).toEqual(["ngsl-0500", "ngsl-1200"]);
  });

  it("filters by IPA availability", () => {
    const result = filterVocabularyWords(words, new Map(), {
      query: "",
      status: "all",
      ipa: "missing-ipa",
      rankFrom: "",
      rankTo: ""
    });

    expect(result.map((word) => word.id)).toEqual(["ngsl-0500"]);
  });

  it("combines query and filters", () => {
    const result = filterVocabularyWords(words, new Map(), {
      query: "listen",
      status: "new",
      ipa: "has-ipa",
      rankFrom: "1000",
      rankTo: ""
    });

    expect(result.map((word) => word.id)).toEqual(["ngsl-1200"]);
  });
});
