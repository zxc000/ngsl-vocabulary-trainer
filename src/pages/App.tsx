import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarCheck, ClipboardCheck, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import Metric from "../components/Metric";
import { getNewWords, getStats } from "../lib/storage";
import type { StudyStats, VocabularyWord } from "../types";

export default function App() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [newWords, setNewWords] = useState<VocabularyWord[]>([]);

  useEffect(() => {
    void Promise.all([getStats(), getNewWords(8)]).then(([nextStats, nextWords]) => {
      setStats(nextStats);
      setNewWords(nextWords);
    });
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-md border border-line bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">今日</p>
            <h2 className="mt-2 text-3xl font-semibold">先複習，再學真正需要的字。</h2>
            <p className="mt-3 max-w-2xl text-muted">
              到期單字會優先出現；已經會的高頻字可以先做程度篩選，讓正式學習更有效率。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/screening"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-semibold text-white transition hover:bg-teal-800 focus:focus-ring"
            >
              程度篩選
              <ClipboardCheck size={18} aria-hidden="true" />
            </Link>
            <Link
              to="/study"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 font-semibold text-white transition hover:bg-slate-700 focus:focus-ring"
            >
              開始學習
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Metric label="待複習" value={stats?.dueToday ?? "..."} tone="coral" />
          <Metric label="今日已複習" value={stats?.reviewedToday ?? "..."} tone="teal" />
          <Metric label="已掌握" value={stats?.masteredWords ?? "..."} tone="violet" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-line p-4">
            <CalendarCheck className="text-coral" size={24} aria-hidden="true" />
            <h3 className="mt-3 font-semibold">漸進間隔</h3>
            <p className="mt-2 text-sm text-muted">記得與簡單會隨複習次數逐步拉長間隔。</p>
          </div>
          <div className="rounded-md border border-line p-4">
            <BookOpen className="text-accent" size={24} aria-hidden="true" />
            <h3 className="mt-3 font-semibold">依 Rank 學習，可先篩選</h3>
            <p className="mt-2 text-sm text-muted">已掌握的字會從正式學習佇列排除。</p>
          </div>
          <div className="rounded-md border border-line p-4">
            <RotateCcw className="text-violet" size={24} aria-hidden="true" />
            <h3 className="mt-3 font-semibold">本機備份</h3>
            <p className="mt-2 text-sm text-muted">學習資料保存在此瀏覽器，可匯出 JSON 備份。</p>
          </div>
        </div>
      </section>

      <aside className="rounded-md border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">接下來的新字</h2>
        <div className="mt-4 divide-y divide-line">
          {newWords.map((word) => (
            <div key={word.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium">{word.lemma}</p>
                <p className="text-sm text-muted">Rank {word.rank}</p>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-muted">
                SFI {word.sfi.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
