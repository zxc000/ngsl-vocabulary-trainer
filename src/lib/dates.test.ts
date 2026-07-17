import { describe, expect, it } from "vitest";
import { getNextReviewDate } from "./dates";

describe("getNextReviewDate", () => {
  const reviewedAt = new Date("2026-07-17T12:00:00");

  it("keeps forgotten cards due today", () => {
    expect(getNextReviewDate("forgot", 4, reviewedAt)).toBe("2026-07-17");
  });

  it("schedules hard cards one day later", () => {
    expect(getNextReviewDate("hard", 4, reviewedAt)).toBe("2026-07-18");
  });

  it("progressively schedules good cards", () => {
    expect(getNextReviewDate("good", 1, reviewedAt)).toBe("2026-07-20");
    expect(getNextReviewDate("good", 2, reviewedAt)).toBe("2026-07-24");
    expect(getNextReviewDate("good", 3, reviewedAt)).toBe("2026-07-31");
    expect(getNextReviewDate("good", 4, reviewedAt)).toBe("2026-08-16");
    expect(getNextReviewDate("good", 9, reviewedAt)).toBe("2026-08-16");
  });

  it("progressively schedules easy cards", () => {
    expect(getNextReviewDate("easy", 1, reviewedAt)).toBe("2026-07-24");
    expect(getNextReviewDate("easy", 2, reviewedAt)).toBe("2026-08-07");
    expect(getNextReviewDate("easy", 3, reviewedAt)).toBe("2026-09-15");
    expect(getNextReviewDate("easy", 9, reviewedAt)).toBe("2026-09-15");
  });
});
