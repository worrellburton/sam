import { describe, it, expect } from "vitest";
import { seoMeta } from "@/seo";
import { SITE_URL } from "@/lib/env";

type MetaTag = Record<string, string>;

function tags(opts: Parameters<typeof seoMeta>[0]): MetaTag[] {
  return seoMeta(opts) as unknown as MetaTag[];
}

describe("seoMeta", () => {
  const meta = tags({
    title: "Test Page",
    description: "A test description.",
    path: "/test",
  });

  const find = (pred: (m: MetaTag) => boolean) => meta.find(pred);

  it("builds an absolute canonical URL from SITE_URL + path", () => {
    expect(find((m) => m.rel === "canonical")?.href).toBe(`${SITE_URL}/test`);
  });

  it("sets the title and description", () => {
    expect(find((m) => "title" in m)?.title).toBe("Test Page");
    expect(find((m) => m.name === "description")?.content).toBe(
      "A test description.",
    );
  });

  it("mirrors the canonical URL into og:url", () => {
    expect(find((m) => m.property === "og:url")?.content).toBe(
      `${SITE_URL}/test`,
    );
  });

  it("defaults og:type to website and falls back to a default image", () => {
    expect(find((m) => m.property === "og:type")?.content).toBe("website");
    expect(find((m) => m.property === "og:image")?.content).toBeTruthy();
  });

  it("uses a provided image when given", () => {
    const withImg = tags({
      title: "T",
      description: "D",
      path: "/x",
      image: "https://example.com/pic.jpg",
    });
    expect(
      withImg.find((m) => m.property === "og:image")?.content,
    ).toBe("https://example.com/pic.jpg");
  });
});
