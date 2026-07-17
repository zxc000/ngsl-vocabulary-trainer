import { useEffect, useState } from "react";
import { Check, Frown, Smile, Zap } from "lucide-react";
import FlashCard from "../components/FlashCard";
import { getNextStudyWord, rateWord } from "../lib/storage";
import type { Rating, VocabularyWord } from "../types";

const ratingButtons: Array<{ rating: Rating; label: string; icon: typeof Frown; className: string }> = [
  { rating: "forgot", label: "忘記", icon: Frown, className: "bg-coral hover:bg-orange-800" },
  { rating: "hard", label: "困難", icon: Zap, className: "bg-amber-600 hover:bg-amber-700" },
  { rating: "good", label: "記得", icon: Check, className: "bg-accent hover:bg-teal-800" },
  { rating: "easy", label: "簡單", icon: Smile, className: "bg-violet hover:bg-violet-800" }
];

export default function Study() {
  const [word, setWord] = useState<VocabularyWord | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadNextWord() {
    setLoading(true);
    const nextWord = await getNextStudyWord();
    setWord(nextWord);
    setRevealed(false);
    setLoading(false);
  }

  useEffect(() => {
    void loadNextWord();
  }, []);

  async function handleRate(rating: Rating) {
    if (!word) {
      return;
    }

    await rateWord(word.id, rating);
    await loadNextWord();
  }

  if (loading) {
    return <div className="rounded-md border border-line bg-white p-6">正在載入下一張卡片...</div>;
  }

  if (!word) {
    return (
      <section className="rounded-md border border-line bg-white p-8 text-center shadow-soft">
        <h2 className="text-2xl font-semibold">目前沒有需要學習的單字。</h2>
        <p className="mt-3 text-muted">現在沒有到期複習卡，也沒有尚未開始的新字。</p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <FlashCard word={word} revealed={revealed} onReveal={() => setRevealed(true)} />

      {revealed && (
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {ratingButtons.map((button) => {
            const Icon = button.icon;
            return (
              <button
                key={button.rating}
                type="button"
                onClick={() => void handleRate(button.rating)}
                className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold text-white transition focus:focus-ring ${button.className}`}
              >
                <Icon size={18} aria-hidden="true" />
                {button.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
