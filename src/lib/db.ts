import Dexie, { type Table } from "dexie";
import type { ReviewLog, WordProgress } from "../types";

export class TrainerDatabase extends Dexie {
  progress!: Table<WordProgress, string>;
  reviewLogs!: Table<ReviewLog, number>;

  constructor() {
    super("ngsl-vocabulary-trainer");

    this.version(1).stores({
      progress: "wordId, nextReviewDate, lastReviewedAt, latestRating",
      reviewLogs: "++id, wordId, rating, reviewedAt, nextReviewDate"
    });

    this.version(2).stores({
      progress: "wordId, status, nextReviewDate, lastReviewedAt, latestRating",
      reviewLogs: "++id, wordId, rating, reviewedAt, nextReviewDate"
    });
  }
}

export const db = new TrainerDatabase();
