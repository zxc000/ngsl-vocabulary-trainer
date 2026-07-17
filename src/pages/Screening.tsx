import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Target } from "lucide-react";
import { Link } from "react-router-dom";
import FlashCard from "../components/FlashCard";
import { isInteractiveTarget } from "../lib/keyboard";
import { getNewWords, markWordLearning, markWordMastered } from "../lib/storage";
import type { VocabularyWord } from "../types";

export default function Screening() {
  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadNextWord() {
    setLoading(true);
    const [nextWord] = await getNewWords(1);
    setWord(nextWord ?? null);
    setRevealed(false);
    setLoading(false);
  }

  useEffect(() => {
    void loadNextWord();
  }, []);

  async function handleKnowIt() {
    if (!word || loading || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await markWordMastered(word.id);
      await loadNextWord();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNeedPractice() {
    if (!word || loading || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await markWordLearning(word.id);
      await loadNextWord();
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isInteractiveTarget(event.target) || loading || submitting || !word) {
        return;
      }

      if (!revealed && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        setRevealed(true);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        void handleKnowIt();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        void handleNeedPractice();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, revealed, submitting, word]);

  if (loading) {
    return <div className="rounded-md border border-line bg-white p-6">正在載入篩選卡片...</div>;
  }

  if (!word) {
    return (
      <section className="rounded-md border border-line bg-white p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto text-accent" size={36} aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold">篩選完成。</h2>
        <p className="mt-3 text-muted">所有未篩選單字都已標成已掌握，或移入學習中。</p>
        <Link
          to="/study"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-slate-700 focus:focus-ring"
        >
          前往學習
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 rounded-md border border-line bg-white p-4">
        <div className="flex items-center gap-3">
          <Target className="text-accent" size={22} aria-hidden="true" />
          <div>
            <h2 className="font-semibold">單字程度篩選</h2>
            <p className="text-sm text-muted">把明顯已經會的字標成已掌握，讓正式學習更集中。</p>
          </div>
        </div>
      </div>

      <FlashCard word={word} revealed={revealed} onReveal={() => setRevealed(true)} />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleKnowIt()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 font-semibold text-white transition hover:bg-teal-800 focus:focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 size={18} aria-hidden="true" />
          我會
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void handleNeedPractice()}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-coral px-4 py-3 font-semibold text-white transition hover:bg-orange-800 focus:focus-ring disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight size={18} aria-hidden="true" />
          需要練習
        </button>
      </div>
    </div>
  );
}
