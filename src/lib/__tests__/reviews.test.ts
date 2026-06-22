import { describe, it, expect } from "vitest";
import { BASE_REVIEW_COUNT, formatReviewTotal } from "@/lib/reviews";

describe("formatReviewTotal", () => {
  it("returns the baseline with a trailing + when no delta is given", () => {
    expect(formatReviewTotal()).toBe(`${BASE_REVIEW_COUNT.toLocaleString()}+`);
  });

  it("adds the live Google delta to the baseline", () => {
    expect(formatReviewTotal(308)).toBe(
      `${(BASE_REVIEW_COUNT + 308).toLocaleString()}+`,
    );
  });

  it("formats thousands with a separator", () => {
    expect(formatReviewTotal(1000)).toContain(",");
  });

  it("treats a zero delta the same as no delta", () => {
    expect(formatReviewTotal(0)).toBe(formatReviewTotal());
  });
});
