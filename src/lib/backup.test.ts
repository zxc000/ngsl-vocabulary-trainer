import { describe, expect, it } from "vitest";
import { assertBackupPayload } from "./storage";
import type { BackupPayload } from "../types";

describe("backup payload validation", () => {
  it("accepts a versioned backup payload", () => {
    const payload: BackupPayload = {
      version: 1,
      exportedAt: "2026-07-17T00:00:00.000Z",
      progress: [
        {
          wordId: "ngsl-0001",
          status: "mastered",
          reviewCount: 0,
          lastReviewedAt: null,
          nextReviewDate: null,
          latestRating: null,
          createdAt: "2026-07-17T00:00:00.000Z",
          updatedAt: "2026-07-17T00:00:00.000Z"
        }
      ],
      reviewLogs: []
    };

    expect(() => assertBackupPayload(payload)).not.toThrow();
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it("rejects incompatible payloads", () => {
    expect(() => assertBackupPayload({ version: 2, progress: [], reviewLogs: [] })).toThrow();
  });
});
