import { describe, it, expect } from "vitest";
import { initials } from "@/lib/format";

describe("initials", () => {
  it("takes first + last initial of a full name", () => {
    expect(initials("Sarah Miller")).toBe("SM");
    expect(initials("James K.")).toBe("JK");
  });

  it("uses the first two letters of a single-word name", () => {
    expect(initials("Cher")).toBe("CH");
  });

  it("collapses extra whitespace", () => {
    expect(initials("  Mary   Jane  Watson ")).toBe("MW");
  });

  it("falls back to ? for an empty name", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });

  it("always returns uppercase", () => {
    expect(initials("john doe")).toBe("JD");
  });
});
