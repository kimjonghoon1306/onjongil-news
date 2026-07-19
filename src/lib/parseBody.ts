// 블로그오토프로 parseBodyBlocks 이식 (온종일뉴스용)
// 마크다운형 본문 → 블록 배열
//   "## 소제목"  → h2
//   "[팁] ..."   → box(tip)
//   "[주의] ..."  → box(warning)
//   "[중요] ..."  → box(important)
//   그 외 문단    → p

export type Block =
  | { type: "h2"; content: string }
  | { type: "p"; content: string }
  | { type: "box"; content: string; boxType: "tip" | "warning" | "important" };

export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.split("\n");
  let buf: string[] = [];
  const flush = () => {
    const j = buf.join(" ").trim();
    if (j) blocks.push({ type: "p", content: j });
    buf = [];
  };
  for (const line of lines) {
    const t = line.trim();
    if (!t) { flush(); continue; }
    if (t.startsWith("## ")) { flush(); blocks.push({ type: "h2", content: t.slice(3) }); continue; }
    if (t.startsWith("[팁]")) { flush(); blocks.push({ type: "box", content: t.slice(4).trim(), boxType: "tip" }); continue; }
    if (t.startsWith("[주의]")) { flush(); blocks.push({ type: "box", content: t.slice(5).trim(), boxType: "warning" }); continue; }
    if (t.startsWith("[중요]")) { flush(); blocks.push({ type: "box", content: t.slice(5).trim(), boxType: "important" }); continue; }
    buf.push(t);
  }
  flush();
  return blocks;
}

export const BOX_META: Record<"tip" | "warning" | "important", { label: string; color: string; bg: string }> = {
  tip:       { label: "💡 팁",   color: "#16a34a", bg: "#f0faf4" },
  warning:   { label: "⚠️ 주의", color: "#ea580c", bg: "#fff7ed" },
  important: { label: "🚨 중요", color: "#dc2626", bg: "#fef2f2" },
};
