import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, Search } from "lucide-react";
import {
  getProgressMap,
  getWordStatus,
  markWordLearning,
  markWordMastered
} from "../lib/storage";
import { vocabulary } from "../lib/vocabulary";
import { filterVocabularyWords, getStatusLabel, type StatusFilter } from "../lib/wordFilters";
import type { WordProgress } from "../types";

const pageSize = 200;

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "全部狀態" },
  { value: "new", label: "未開始" },
  { value: "learning", label: "學習中" },
  { value: "mastered", label: "已掌握" }
];

export default function WordList() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [rankFrom, setRankFrom] = useState("");
  const [rankTo, setRankTo] = useState("");
  const [page, setPage] = useState(1);
  const [progress, setProgress] = useState<Map<string, WordProgress>>(new Map());
  const filteredResults = useMemo(
    () =>
      filterVocabularyWords(vocabulary, progress, {
        query,
        status: statusFilter,
        rankFrom,
        rankTo
      }),
    [progress, query, rankFrom, rankTo, statusFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const results = filteredResults.slice(startIndex, startIndex + pageSize);
  const displayFrom = filteredResults.length === 0 ? 0 : startIndex + 1;
  const displayTo = startIndex + results.length;

  useEffect(() => {
    setPage(1);
  }, [query, rankFrom, rankTo, statusFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function refreshProgress() {
    setProgress(await getProgressMap());
  }

  useEffect(() => {
    void refreshProgress();
  }, []);

  async function toggleMastered(wordId: string) {
    const status = getWordStatus(wordId, progress);
    if (status === "mastered") {
      await markWordLearning(wordId);
    } else {
      await markWordMastered(wordId);
    }
    await refreshProgress();
  }

  return (
    <section className="rounded-md border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">詞表</h2>
          <p className="mt-1 text-sm text-muted">依 lemma 搜尋，或用狀態、Rank 篩選。</p>
        </div>
        <label className="relative block sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋 lemma"
            className="w-full rounded-md border border-line bg-white py-2 pl-10 pr-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium text-muted">
          狀態
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-md border border-line bg-white px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-muted">
          起始 Rank
          <input
            value={rankFrom}
            onChange={(event) => setRankFrom(event.target.value)}
            inputMode="numeric"
            placeholder="例如 500"
            className="rounded-md border border-line bg-white px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-muted">
          結束 Rank
          <input
            value={rankTo}
            onChange={(event) => setRankTo(event.target.value)}
            inputMode="numeric"
            placeholder="例如 1000"
            className="rounded-md border border-line bg-white px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-md border border-line bg-slate-50 p-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          符合條件 {filteredResults.length.toLocaleString()} 筆，顯示{" "}
          {displayFrom.toLocaleString()}-{displayTo.toLocaleString()} 筆，第{" "}
          {currentPage.toLocaleString()} / {totalPages.toLocaleString()} 頁。
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-2 font-semibold text-ink transition hover:bg-slate-100 focus:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            上一頁
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-2 font-semibold text-ink transition hover:bg-slate-100 focus:focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一頁
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-y border-line bg-slate-50 text-xs uppercase tracking-[0.12em] text-muted">
              <th className="px-3 py-3">Rank</th>
              <th className="px-3 py-3">Lemma</th>
              <th className="px-3 py-3">狀態</th>
              <th className="px-3 py-3">IPA</th>
              <th className="px-3 py-3">SFI</th>
              <th className="px-3 py-3">每百萬頻率</th>
              <th className="px-3 py-3">英文解釋</th>
              <th className="px-3 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {results.map((word) => {
              const status = getWordStatus(word.id, progress);
              return (
                <tr key={word.id} className="align-top">
                  <td className="px-3 py-3 font-medium">{word.rank}</td>
                  <td className="px-3 py-3 font-semibold">{word.lemma}</td>
                  <td className="px-3 py-3">
                    <span
                      className={[
                        "rounded-md px-2 py-1 text-xs font-semibold",
                        status === "mastered"
                          ? "bg-teal-50 text-accent"
                          : status === "learning"
                            ? "bg-orange-50 text-coral"
                            : "bg-slate-100 text-muted"
                      ].join(" ")}
                    >
                      {getStatusLabel(status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted">{word.ipa ?? "待補"}</td>
                  <td className="px-3 py-3">{word.sfi.toFixed(2)}</td>
                  <td className="px-3 py-3">{word.frequencyPerMillion.toLocaleString()}</td>
                  <td className="max-w-lg px-3 py-3 text-muted">{word.definitionEn}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleMastered(word.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-semibold transition hover:bg-slate-50"
                    >
                      {status === "mastered" ? (
                        <>
                          <RotateCcw size={14} aria-hidden="true" />
                          練習
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} aria-hidden="true" />
                          已掌握
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
