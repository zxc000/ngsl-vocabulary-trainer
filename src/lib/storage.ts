import { db } from "./db";
import { getNextReviewDate, isDue, toDateKey } from "./dates";
import { vocabulary } from "./vocabulary";
import type { BackupPayload, ProgressStatus, Rating, ReviewLog, StudyStats, VocabularyWord, WordProgress } from "../types";

export async function getAllProgress(): Promise<WordProgress[]> {
  const progress = await db.progress.toArray();
  return progress.map(normalizeProgress);
}

export async function getReviewLogs(): Promise<ReviewLog[]> {
  return db.reviewLogs.orderBy("reviewedAt").toArray();
}

export async function getProgressMap(): Promise<Map<string, WordProgress>> {
  const progress = await getAllProgress();
  return new Map(progress.map((entry) => [entry.wordId, entry]));
}

export function normalizeProgress(progress: WordProgress): WordProgress {
  return {
    ...progress,
    status: progress.status ?? "learning"
  };
}

export function getWordStatus(wordId: string, progress: Map<string, WordProgress>): ProgressStatus {
  return progress.get(wordId)?.status ?? "new";
}

export function selectDueWords(
  words: VocabularyWord[],
  progress: Map<string, WordProgress>,
  today: string = toDateKey()
): VocabularyWord[] {
  return words.filter((word) => {
    const entry = progress.get(word.id);
    return entry?.status === "learning" && isDue(entry.nextReviewDate, today);
  });
}

export function selectNewWords(
  words: VocabularyWord[],
  progress: Map<string, WordProgress>,
  limit = 20
): VocabularyWord[] {
  return words.filter((word) => getWordStatus(word.id, progress) === "new").slice(0, limit);
}

export function selectNextStudyWord(words: VocabularyWord[], progress: Map<string, WordProgress>, today: string = toDateKey()) {
  const due = selectDueWords(words, progress, today);
  if (due.length > 0) {
    return due[0];
  }

  return selectNewWords(words, progress, 1)[0] ?? null;
}

export async function rateWord(wordId: string, rating: Rating): Promise<WordProgress> {
  const now = new Date();
  const reviewedAt = now.toISOString();
  const existing = await db.progress.get(wordId);
  const reviewCount = (existing?.reviewCount ?? 0) + 1;
  const nextReviewDate = getNextReviewDate(rating, reviewCount, now);

  const progress: WordProgress = {
    wordId,
    status: "learning",
    reviewCount,
    lastReviewedAt: reviewedAt,
    nextReviewDate,
    latestRating: rating,
    createdAt: existing?.createdAt ?? reviewedAt,
    updatedAt: reviewedAt
  };

  await db.transaction("rw", db.progress, db.reviewLogs, async () => {
    await db.progress.put(progress);
    await db.reviewLogs.add({
      wordId,
      rating,
      reviewedAt,
      nextReviewDate
    });
  });

  return progress;
}

export async function getDueWords() {
  const today = toDateKey();
  const progress = await getProgressMap();

  return selectDueWords(vocabulary, progress, today);
}

export async function getNewWords(limit = 20) {
  const progress = await getProgressMap();
  return selectNewWords(vocabulary, progress, limit);
}

export async function getNextStudyWord() {
  const progress = await getProgressMap();
  return selectNextStudyWord(vocabulary, progress);
}

export async function markWordMastered(wordId: string): Promise<WordProgress> {
  const now = new Date().toISOString();
  const existing = await db.progress.get(wordId);
  const progress: WordProgress = {
    wordId,
    status: "mastered",
    reviewCount: existing?.reviewCount ?? 0,
    lastReviewedAt: existing?.lastReviewedAt ?? null,
    nextReviewDate: null,
    latestRating: existing?.latestRating ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  await db.progress.put(progress);
  return progress;
}

export async function markWordLearning(wordId: string): Promise<WordProgress> {
  const now = new Date().toISOString();
  const existing = await db.progress.get(wordId);
  const progress: WordProgress = {
    wordId,
    status: "learning",
    reviewCount: existing?.reviewCount ?? 0,
    lastReviewedAt: existing?.lastReviewedAt ?? null,
    nextReviewDate: existing?.nextReviewDate ?? toDateKey(),
    latestRating: existing?.latestRating ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  await db.progress.put(progress);
  return progress;
}

export async function getStats(): Promise<StudyStats> {
  const today = toDateKey();
  const [progress, reviewLogs] = await Promise.all([getAllProgress(), getReviewLogs()]);
  const learningWords = progress.filter((entry) => entry.status === "learning").length;
  const masteredWords = progress.filter((entry) => entry.status === "mastered").length;

  return {
    totalWords: vocabulary.length,
    learnedWords: progress.length,
    learningWords,
    masteredWords,
    dueToday: progress.filter((entry) => entry.status === "learning" && isDue(entry.nextReviewDate, today)).length,
    reviewedToday: reviewLogs.filter((entry) => entry.reviewedAt.slice(0, 10) === today).length,
    reviewHistoryCount: reviewLogs.length
  };
}

export async function exportBackup(): Promise<BackupPayload> {
  const [progress, reviewLogs] = await Promise.all([getAllProgress(), getReviewLogs()]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    progress,
    reviewLogs
  };
}

export function assertBackupPayload(value: unknown): asserts value is BackupPayload {
  if (!value || typeof value !== "object") {
    throw new Error("備份檔不是有效的 JSON 資料。");
  }

  const candidate = value as Partial<BackupPayload>;
  if (candidate.version !== 1 || !Array.isArray(candidate.progress) || !Array.isArray(candidate.reviewLogs)) {
    throw new Error("備份檔與目前 App 不相容。");
  }
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  assertBackupPayload(payload);

  await db.transaction("rw", db.progress, db.reviewLogs, async () => {
    await db.progress.clear();
    await db.reviewLogs.clear();
    await db.progress.bulkPut(payload.progress.map(normalizeProgress));
    await db.reviewLogs.bulkAdd(payload.reviewLogs.map(({ id: _id, ...log }) => log));
  });
}

export async function clearLearningData(): Promise<void> {
  await db.transaction("rw", db.progress, db.reviewLogs, async () => {
    await db.progress.clear();
    await db.reviewLogs.clear();
  });
}
