import { ChangeEvent, useEffect, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import Metric from "../components/Metric";
import {
  assertBackupPayload,
  clearLearningData,
  exportBackup,
  getStats,
  importBackup
} from "../lib/storage";
import type { StudyStats } from "../types";

export default function Stats() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [message, setMessage] = useState("");

  async function refreshStats() {
    setStats(await getStats());
  }

  useEffect(() => {
    void refreshStats();
  }, []);

  async function handleExport() {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ngsl-vocabulary-backup-${backup.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("備份已匯出。");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text()) as unknown;
      assertBackupPayload(payload);
      await importBackup(payload);
      await refreshStats();
      setMessage("備份已還原。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "無法匯入備份。");
    } finally {
      event.target.value = "";
    }
  }

  async function handleClear() {
    const confirmed = window.confirm("確定要清除所有本機學習進度與複習紀錄嗎？");
    if (!confirmed) {
      return;
    }

    await clearLearningData();
    await refreshStats();
    setMessage("本機學習資料已清除。");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-semibold">統計</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <Metric label="總單字" value={stats?.totalWords ?? "..."} />
          <Metric label="已開始" value={stats?.learnedWords ?? "..."} tone="violet" />
          <Metric label="學習中" value={stats?.learningWords ?? "..."} tone="teal" />
          <Metric label="已掌握" value={stats?.masteredWords ?? "..."} tone="violet" />
          <Metric label="今日待複習" value={stats?.dueToday ?? "..."} tone="coral" />
          <Metric label="今日已複習" value={stats?.reviewedToday ?? "..."} tone="teal" />
          <Metric label="複習紀錄" value={stats?.reviewHistoryCount ?? "..."} />
        </div>
      </section>

      <aside className="rounded-md border border-line bg-white p-5">
        <h2 className="text-lg font-semibold">本機資料</h2>
        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-semibold text-white transition hover:bg-slate-700 focus:focus-ring"
          >
            <Download size={18} aria-hidden="true" />
            匯出備份
          </button>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-line px-4 py-3 font-semibold transition hover:bg-slate-50">
            <Upload size={18} aria-hidden="true" />
            匯入備份
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(event) => void handleImport(event)}
            />
          </label>
          <button
            type="button"
            onClick={() => void handleClear()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-coral px-4 py-3 font-semibold text-coral transition hover:bg-orange-50 focus:focus-ring"
          >
            <Trash2 size={18} aria-hidden="true" />
            清除進度
          </button>
        </div>
        {message && <p className="mt-4 rounded-md bg-slate-100 p-3 text-sm text-muted">{message}</p>}
        <p className="mt-5 text-xs leading-relaxed text-muted">
          IPA 主要取自 Wiktionary/Kaikki；缺漏字由 CMU Pronouncing Dictionary 補齊。
        </p>
      </aside>
    </div>
  );
}
