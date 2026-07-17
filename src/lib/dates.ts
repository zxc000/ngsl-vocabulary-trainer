import type { Rating } from "../types";

export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() + days);
  return next;
}

export function getReviewIntervalDays(rating: Rating, reviewCount: number): number {
  if (rating === "forgot") {
    return 0;
  }

  if (rating === "hard") {
    return 1;
  }

  if (rating === "good") {
    const intervals = [3, 7, 14, 30];
    return intervals[Math.min(Math.max(reviewCount, 1), intervals.length) - 1];
  }

  const intervals = [7, 21, 60];
  return intervals[Math.min(Math.max(reviewCount, 1), intervals.length) - 1];
}

export function getNextReviewDate(rating: Rating, reviewCount: number, reviewedAt: Date = new Date()): string {
  const interval = getReviewIntervalDays(rating, reviewCount);

  return toDateKey(addDays(reviewedAt, interval));
}

export function isDue(nextReviewDate: string | null, today: string = toDateKey()): boolean {
  return nextReviewDate !== null && nextReviewDate <= today;
}
