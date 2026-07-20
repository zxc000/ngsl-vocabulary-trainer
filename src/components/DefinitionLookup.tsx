import { X } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { vocabulary } from "../lib/vocabulary";
import type { VocabularyWord } from "../types";

interface DefinitionLookupProps {
  definition: string;
  currentWordId: string;
}

const tokenPattern = /([A-Za-z]+(?:'[A-Za-z]+)?)/g;

export function tokenizeDefinition(definition: string) {
  return definition.split(tokenPattern).filter((token) => token.length > 0);
}

export function createVocabularyLookup(words: VocabularyWord[]) {
  return new Map(words.map((word) => [word.lemma.toLowerCase(), word]));
}

export default function DefinitionLookup({ definition, currentWordId }: DefinitionLookupProps) {
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const tokens = useMemo(() => tokenizeDefinition(definition), [definition]);
  const lookup = useMemo(() => createVocabularyLookup(vocabulary), []);

  useEffect(() => {
    setSelectedWord(null);
  }, [currentWordId, definition]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedWord(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="mt-2 text-lg leading-relaxed">
      <p>
        {tokens.map((token, index) => {
          const matchedWord = lookup.get(token.toLowerCase());

          if (!matchedWord || matchedWord.id === currentWordId) {
            return <Fragment key={`${token}-${index}`}>{token}</Fragment>;
          }

          return (
            <button
              key={`${token}-${index}`}
              type="button"
              onClick={() => setSelectedWord(matchedWord)}
              className="rounded-sm font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:bg-teal-50 hover:decoration-accent focus:focus-ring"
            >
              {token}
            </button>
          );
        })}
      </p>

      {selectedWord && (
        <div className="mt-3 rounded-md border border-line bg-white p-4 text-base shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">查詞</p>
              <h3 className="mt-1 text-xl font-semibold text-ink">{selectedWord.lemma}</h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedWord(null)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition hover:bg-slate-50 hover:text-ink focus:focus-ring"
              aria-label="關閉查詞"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-muted">IPA</dt>
              <dd className="mt-1 text-lg font-medium text-ink">{selectedWord.ipa ?? "音標資料待補"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-muted">SFI Rank</dt>
              <dd className="mt-1 text-ink">{selectedWord.rank}</dd>
            </div>
            <div>
              <dt className="font-semibold text-muted">英文解釋</dt>
              <dd className="mt-1 leading-relaxed text-ink">{selectedWord.definitionEn}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
