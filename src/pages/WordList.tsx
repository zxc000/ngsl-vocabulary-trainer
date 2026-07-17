import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Search } from "lucide-react";
import {
  getProgressMap,
  getWordStatus,
  markWordLearning,
  markWordMastered
} from "../lib/storage";
import { vocabulary } from "../lib/vocabulary";
import { filterVocabularyWords, getStatusLabel, type IpaFilter, type StatusFilter } from "../lib/wordFilters";
import type { WordProgress } from "../types";

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "全部狀態" },
  { value: "new", label: "未開始" },
  { value: "learning", label: "學習中" },
  { value: "mastered", label: "已掌握" }
];

const ipaOptions: Array<{ value: IpaFilter; label: string }> = [
  { value: "all", label: "全部音標" },
  { value: "has-ipa", label: "有音標" },
  { value: "missing-ipa", label: "缺音標" }
];

export default function WordList() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ipaFilter, setIpaFilter] = useState<IpaFilter>("all");
  const [rankFrom, setRankFrom] = useState("");
  const [rankTo, setRankTo] = useState("");
  const [progress, setProgress] = useState<Map<string, WordProgress>>(new Map());
  const filteredResults = useMemo(
    () =>
      filterVocabularyWords(vocabulary, progress, {
        query,
        status: statusFilter,
        ipa: ipaFilter,
        rankFrom,
        rankTo
      }),
    [ipaFilter, progress, query, rankFrom, rankTo, statusFilter]
  );
  const results = filteredResults.slice(0, 200);

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
          <p className="mt-1 text-sm text-muted">依 lemma 搜尋，或用狀態、Rank、音標篩選。</p>
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

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr]">
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
          音標
          <select
            value={ipaFilter}
            onChange={(event) => setIpaFilter(event.target.value as IpaFilter)}
            className="rounded-md border border-line bg-white px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {ipaOptions.map((option) => (
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

      <p className="mt-4 text-sm text-muted">
        符合條件 {filteredResults.length.toLocaleString()} 筆，目前顯示前 {results.length.toLocaleString()} 筆。
      </p>
    </section>
  );
}
