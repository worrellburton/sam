// Extremely lightweight markdown → HTML converter used as a fallback
// when a blog post ships without pre-rendered HTML. Handles:
//   - H2 / H3 headings
//   - bold (**...**)
//   - unordered list items (- …) and numbered items grouped into <ul>
//   - paragraphs for any remaining lines
//
// Intentionally minimal — real authors ship pre-rendered `contentHtml`.

export function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^(?!<[hul])((?!<).+)$/gm, (match) => {
      const trimmed = match.trim();
      if (!trimmed || trimmed.startsWith("<")) return match;
      return `<p>${trimmed}</p>`;
    })
    .replace(/<p><\/p>/g, "")
    .replace(/\n{2,}/g, "\n");
}
