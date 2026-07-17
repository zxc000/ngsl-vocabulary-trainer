import { describe, expect, it } from "vitest";
import { vocabulary } from "./vocabulary";

describe("vocabulary data", () => {
  it("contains exactly 2809 records", () => {
    expect(vocabulary).toHaveLength(2809);
  });

  it("has continuous numeric ranks", () => {
    const ranks = vocabulary.map((word) => word.rank).sort((a, b) => a - b);
    expect(ranks).toEqual(Array.from({ length: 2809 }, (_, index) => index + 1));
  });

  it("has required fields and nullable IPA", () => {
    for (const word of vocabulary) {
      expect(word.id).toMatch(/^ngsl-\d{4}$/);
      expect(word.lemma.length).toBeGreaterThan(0);
      expect(word.definitionEn.length).toBeGreaterThan(0);
      expect(typeof word.rank).toBe("number");
      expect(typeof word.sfi).toBe("number");
      expect(typeof word.frequencyPerMillion).toBe("number");
      expect(word.ipa === null || typeof word.ipa === "string").toBe(true);
    }
  });
});
