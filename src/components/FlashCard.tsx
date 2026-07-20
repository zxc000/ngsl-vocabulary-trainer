import { RotateCcw } from "lucide-react";
import DefinitionLookup from "./DefinitionLookup";
import type { VocabularyWord } from "../types";

interface FlashCardProps {
  word: VocabularyWord;
  revealed: boolean;
  onReveal: () => void;
}

export default function FlashCard({ word, revealed, onReveal }: FlashCardProps) {
  return (
    <section className="rounded-md border border-line bg-white p-6 shadow-soft">
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted">
          {revealed ? "卡片背面" : "卡片正面"}
        </p>
        <h2 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">{word.lemma}</h2>

        {revealed ? (
          <div className="mt-6 grid w-full gap-4 text-left sm:grid-cols-2">
            <div className="rounded-md border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">IPA</p>
              <p className="mt-2 text-xl font-medium">{word.ipa ?? "音標資料待補"}</p>
            </div>
            <div className="rounded-md border border-line bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">SFI Rank</p>
              <p className="mt-2 text-xl font-medium">{word.rank}</p>
            </div>
            <div className="rounded-md border border-line bg-slate-50 p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">英文解釋</p>
              <DefinitionLookup definition={word.definitionEn} currentWordId={word.id} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onReveal}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-semibold text-white transition hover:bg-teal-800 focus:focus-ring"
          >
            <RotateCcw size={18} aria-hidden="true" />
            顯示答案
          </button>
        )}
      </div>
    </section>
  );
}
