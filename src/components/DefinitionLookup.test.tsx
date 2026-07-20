// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DefinitionLookup, { createVocabularyLookup, tokenizeDefinition } from "./DefinitionLookup";
import type { VocabularyWord } from "../types";

const testWords: VocabularyWord[] = [
  {
    id: "ngsl-0001",
    lemma: "be",
    rank: 1,
    sfi: 1,
    frequencyPerMillion: 1,
    definitionEn: "exist",
    ipa: "biː"
  },
  {
    id: "ngsl-0002",
    lemma: "alive",
    rank: 2,
    sfi: 1,
    frequencyPerMillion: 1,
    definitionEn: "living; not dead",
    ipa: "əˈlaɪv"
  }
];

describe("definition lookup", () => {
  it("preserves text tokens, punctuation, and spaces", () => {
    expect(tokenizeDefinition("to be alive, now.")).toEqual(["to", " ", "be", " ", "alive", ", ", "now", "."]);
  });

  it("creates an exact lowercase vocabulary lookup", () => {
    const lookup = createVocabularyLookup(testWords);

    expect(lookup.get("alive")?.ipa).toBe("əˈlaɪv");
    expect(lookup.get("lives")).toBeUndefined();
  });

  it("shows IPA and definition for clicked vocabulary words", async () => {
    const { container } = render(<DefinitionLookup definition="to be alive, now." currentWordId="ngsl-9999" />);

    fireEvent.click(screen.getByRole("button", { name: "alive" }));

    expect(await screen.findByRole("heading", { name: "alive" })).toBeTruthy();
    expect(screen.getByText("əˈlaɪv")).toBeTruthy();
    expect(screen.getByText("living; not dead")).toBeTruthy();
    expect(container.querySelector("p")?.textContent).toBe("to be alive, now.");
  });
});
