// 온종일뉴스 · 글쓰기 템플릿 엔진 (블로그오토프로 이식)
// buildTemplateHtml(templateId, title, rawContent, thumbnail) → 완성 HTML
// 본문 문법: "## 소제목", "[팁]/[주의]/[중요]", 그리고
//   [FAQ시작] Q1:.. A1:.. [FAQ끝]
//   [참고자료시작] LINK1: 이름|설명|URL [참고자료끝]
//   [관련글시작] POST1: 제목|설명 [관련글끝]

// ── 추출 ────────────────────────────────────────────────
function extractFaq(text: string): { q: string; a: string }[] {
  const match = text.match(/\[FAQ시작\]([\s\S]*?)\[FAQ끝\]/);
  if (!match) return [];
  const faqs: { q: string; a: string }[] = [];
  const lines = match[1].split("\n").map((l) => l.trim()).filter(Boolean);
  let q = "", a = "";
  for (const line of lines) {
    if (/^Q\d+:/.test(line)) { if (q && a) faqs.push({ q, a }); q = line.replace(/^Q\d+:\s*/, ""); a = ""; }
    else if (/^A\d+:/.test(line)) { a = line.replace(/^A\d+:\s*/, ""); }
  }
  if (q && a) faqs.push({ q, a });
  return faqs;
}

function extractRefs(text: string): { name: string; desc: string; url: string }[] {
  const match = text.match(/\[참고자료시작\]([\s\S]*?)\[참고자료끝\]/);
  if (!match) return [];
  const refs: { name: string; desc: string; url: string }[] = [];
  const lines = match[1].split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("⚠️") || line.startsWith("//") || line.startsWith("#")) continue;
    if (/^LINK\d+:/.test(line)) {
      const parts = line.replace(/^LINK\d+:\s*/, "").split("|");
      if (parts.length >= 3) refs.push({ name: parts[0].trim(), desc: parts[1].trim(), url: parts[2].trim() });
      else if (parts.length === 2) refs.push({ name: parts[0].trim(), desc: parts[1].trim(), url: "" });
      continue;
    }
    if (line.includes("|")) {
      const parts = line.split("|");
      if (parts.length >= 3 && parts[2].trim().startsWith("http")) {
        refs.push({ name: parts[0].trim(), desc: parts[1].trim(), url: parts[2].trim() });
        continue;
      } else if (parts.length === 2) {
        refs.push({ name: parts[0].trim(), desc: parts[1].trim(), url: "" });
        continue;
      }
    }
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 20) {
      const label = line.slice(0, colonIdx).trim();
      const urlPart = line.slice(colonIdx + 1).trim();
      const urls = urlPart.split(",").map((u) => u.trim()).filter((u) => u.startsWith("http"));
      if (urls.length > 0) {
        const desc = urls.length > 1 ? urls.slice(1).join(", ") : "";
        refs.push({ name: label, desc, url: urls[0] });
      }
    }
  }
  return refs;
}

function extractRelated(text: string): { title: string; desc: string }[] {
  const match = text.match(/\[관련글시작\]([\s\S]*?)\[관련글끝\]/);
  if (!match) return [];
  const related: { title: string; desc: string }[] = [];
  const lines = match[1].split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/^POST\d+:/.test(line)) {
      const parts = line.replace(/^POST\d+:\s*/, "").split("|");
      if (parts.length >= 2) related.push({ title: parts[0].trim(), desc: parts[1].trim() });
      else if (parts.length === 1) related.push({ title: parts[0].trim(), desc: "" });
      continue;
    }
    if (line.includes("|")) {
      const parts = line.split("|");
      related.push({ title: parts[0].trim(), desc: parts[1]?.trim() || "" });
    }
  }
  return related;
}

function getBody(text: string): string {
  return text
    .replace(/\[FAQ시작\][\s\S]*?\[FAQ끝\]/g, "")
    .replace(/\[참고자료시작\][\s\S]*?\[참고자료끝\]/g, "")
    .replace(/\[관련글시작\][\s\S]*?\[관련글끝\]/g, "")
    .trim();
}

type Block = { type: "h2" | "p" | "box"; content: string; boxType?: string };

function parseBodyBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.split("\n");
  let pBuffer: string[] = [];
  const flushP = () => { const j = pBuffer.join(" ").trim(); if (j) blocks.push({ type: "p", content: j }); pBuffer = []; };
  for (const line of lines) {
    const t = line.trim();
    if (!t) { flushP(); continue; }
    if (t.startsWith("## ")) { flushP(); blocks.push({ type: "h2", content: t.slice(3) }); continue; }
    if (t.startsWith("[팁]")) { flushP(); blocks.push({ type: "box", content: t.slice(4).trim(), boxType: "tip" }); continue; }
    if (t.startsWith("[주의]")) { flushP(); blocks.push({ type: "box", content: t.slice(5).trim(), boxType: "warning" }); continue; }
    if (t.startsWith("[중요]")) { flushP(); blocks.push({ type: "box", content: t.slice(5).trim(), boxType: "important" }); continue; }
    pBuffer.push(t);
  }
  flushP();
  return blocks;
}

// ── 템플릿 9종 정의 ──────────────────────────────────────
export const TEMPLATES = [
  { id: "magazine",   name: "잡지형",        desc: "굵은 구분선 · 고급 신문 느낌",       emoji: "📰", grad: "linear-gradient(135deg,#fef3c7,#fcd34d)", accent: "#c8102e",  tag: "고급" },
  { id: "newsletter", name: "뉴스레터형",    desc: "이메일 뉴스레터 · 정돈된 레이아웃",   emoji: "📬", grad: "linear-gradient(135deg,#d1fae5,#6ee7b7)", accent: "#059669",  tag: "뉴스" },
  { id: "minimal",    name: "미니멀 클린",   desc: "깔끔한 흰 배경 · 세련된 타이포",      emoji: "⬜", grad: "linear-gradient(135deg,#f8fafc,#e2e8f0)", accent: "#1a1a1a",  tag: "심플" },
  { id: "card",       name: "카드형",        desc: "소제목마다 그림자 카드 박스",        emoji: "🃏", grad: "linear-gradient(135deg,#dbeafe,#93c5fd)", accent: "#2563eb",  tag: "정돈" },
  { id: "infocard",   name: "정보카드형",    desc: "카드+설명 전문 · 참고링크 강조",     emoji: "📋", grad: "linear-gradient(135deg,#e0f2fe,#bae6fd)", accent: "#0369a1",  tag: "전문" },
  { id: "dark",       name: "다크 프리미엄", desc: "어두운 배경 · 세련된 프리미엄",       emoji: "🌙", grad: "linear-gradient(135deg,#1e1b4b,#4c1d95)", accent: "#e94560",  tag: "프리미엄" },
  { id: "warm",       name: "따뜻한 감성",   desc: "베이지/크림톤 · 포근한 느낌",        emoji: "🍞", grad: "linear-gradient(135deg,#fef3c7,#fde68a)", accent: "#d97706",  tag: "감성" },
  { id: "colorful",   name: "컬러 포인트",   desc: "소제목마다 색이 달라지는 스타일",     emoji: "🎨", grad: "linear-gradient(135deg,#ede9fe,#c4b5fd)", accent: "#7c3aed",  tag: "활기" },
  { id: "highlighter",name: "하이라이터형",  desc: "형광펜 마커 · 핵심어 강조 노트",     emoji: "🖊️", grad: "linear-gradient(135deg,#fefce8,#fef08a)", accent: "#854d0e",  tag: "강조" },
];

// ── 공통 렌더러 ──────────────────────────────────────────
function buildRefItem(r: { name: string; desc: string; url: string }, linkColor: string, extraStyle = ""): string {
  const descHtml = r.desc
    ? r.desc.split(",").map((part) => {
        const p = part.trim();
        return p.startsWith("http")
          ? `<a href="${p}" target="_blank" rel="noopener noreferrer" style="color:${linkColor};word-break:break-all;">${p}</a>`
          : p;
      }).join(", ")
    : "";
  const nameHtml = r.url
    ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" style="color:${linkColor};${extraStyle}">${r.name}</a>`
    : `<span>${r.name}</span>`;
  return `<div style="margin-bottom:8px;font-size:0.88rem;line-height:1.6;word-break:break-word;">${nameHtml}${descHtml ? " — " + descHtml : ""}</div>`;
}

function buildRelated(related: { title: string; desc: string }[], accentColor: string, bgColor: string): string {
  if (!related.length) return "";
  let h = `<div style="margin-top:2.5rem;padding-top:1.5rem;border-top:2px solid ${accentColor}33;">`;
  h += `<h3 style="font-size:0.95rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:${accentColor};margin-bottom:14px;">📌 관련 글</h3>`;
  h += `<div style="display:flex;flex-direction:column;gap:10px;">`;
  for (const r of related) {
    h += `<div style="background:${bgColor};border-left:3px solid ${accentColor};border-radius:0 8px 8px 0;padding:12px 16px;">`;
    h += `<p style="font-weight:700;font-size:0.93rem;margin-bottom:3px;">${r.title}</p>`;
    if (r.desc) h += `<p style="font-size:0.82rem;color:#6b7280;margin:0;">${r.desc}</p>`;
    h += `</div>`;
  }
  h += `</div></div>`;
  return h;
}

function buildThumb(thumbnail: string): string {
  if (!thumbnail) return "";
  return `<div style="width:100%;aspect-ratio:16/9;overflow:hidden;margin-bottom:0;"><img src="${thumbnail}" alt="대표 이미지" style="width:100%;height:100%;object-fit:cover;display:block;" /></div>`;
}

function buildToc(blocks: Block[], accentColor: string, bgColor: string, borderColor: string, textColor: string): string {
  const headings = blocks.filter((b) => b.type === "h2");
  if (headings.length < 2) return "";
  let toc = `<div style="background:${bgColor};border:1px solid ${borderColor};border-left:4px solid ${accentColor};border-radius:10px;padding:18px 22px;margin:24px 0 32px;">`;
  toc += `<p style="font-size:0.8rem;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${accentColor};margin-bottom:12px;">📋 목차</p>`;
  toc += `<ol style="margin:0;padding-left:20px;">`;
  headings.forEach((b, i) => {
    toc += `<li style="margin:6px 0;"><a href="#section-${i}" style="color:${textColor};text-decoration:none;font-size:0.95rem;font-weight:500;">${b.content}</a></li>`;
  });
  toc += `</ol></div>`;
  return toc;
}

type Faqs = ReturnType<typeof extractFaq>;
type Refs = ReturnType<typeof extractRefs>;
type Related = ReturnType<typeof extractRelated>;

function buildMinimal(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  const bx: Record<string, string> = { tip: "#f0faf4|#22c55e|💡 팁", warning: "#fff7ed|#f97316|⚠️ 주의", important: "#fef2f2|#ef4444|🚨 중요" };
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;max-width:720px;margin:0 auto;padding:0;background:#fff;color:#1a1a1a;line-height:1.85;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:32px 24px;">`;
  h += `<h1 style="font-size:2rem;font-weight:900;border-bottom:2px solid #1a1a1a;padding-bottom:16px;margin-bottom:20px;">${title}</h1>`;
  h += buildToc(blocks, "#1a1a1a", "#f5f5f5", "#d4d4d0", "#333333");
  let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") { h += `<h2 id="section-${secIdx++}" style="font-size:1.3rem;font-weight:700;margin:2rem 0 1rem;">${b.content}</h2>`; }
    else if (b.type === "p") h += `<p style="margin:1rem 0;font-size:1.05rem;">${b.content}</p>`;
    else if (b.type === "box") { const [bg, br, lb] = bx[b.boxType!].split("|"); h += `<div style="background:${bg};border-left:4px solid ${br};padding:14px 18px;margin:1.25rem 0;border-radius:4px;"><strong style="display:block;margin-bottom:6px;font-size:0.875rem;">${lb}</strong>${b.content}</div>`; }
  }
  if (faqs.length) { h += `<div style="margin-top:2.5rem;border-top:2px solid #1a1a1a;padding-top:1.5rem;"><h3 style="font-size:1.1rem;font-weight:800;margin-bottom:1rem;">자주 묻는 질문</h3>`; for (const f of faqs) h += `<div style="margin-bottom:1rem;"><p style="font-weight:700;margin-bottom:4px;">Q. ${f.q}</p><p style="color:#555;">A. ${f.a}</p></div>`; h += `</div>`; }
  if (refs.length) { h += `<div style="margin-top:2rem;border-top:1px solid #ddd;padding-top:1rem;"><h4 style="font-size:0.9rem;font-weight:700;color:#888;margin-bottom:0.75rem;">참고자료</h4>`; for (const r of refs) h += buildRefItem(r, "#2563eb"); h += `</div>`; }
  h += buildRelated(related, "#1a1a1a", "#f5f5f5");
  return h + `</div></div>`;
}

function buildCard(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;max-width:740px;margin:0 auto;padding:0;background:#f0f6ff;color:#1a1a1a;line-height:1.85;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:32px 20px;">`;
  h += `<h1 style="font-size:1.9rem;font-weight:900;color:#1e3a8a;text-align:center;margin-bottom:20px;padding:24px;background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(37,99,235,0.12);">${title}</h1>`;
  h += buildToc(blocks, "#2563eb", "#eff6ff", "#bfdbfe", "#1e3a8a");
  let card = ""; let inCard = false; let secIdx = 0;
  const flush = () => { if (inCard && card) { h += `<div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(37,99,235,0.1);padding:20px 24px;margin-bottom:20px;">${card}</div>`; card = ""; inCard = false; } };
  for (const b of blocks) {
    if (b.type === "h2") { flush(); inCard = true; card += `<h2 id="section-${secIdx++}" style="font-size:1.15rem;font-weight:800;color:#2563eb;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dbeafe;">${b.content}</h2>`; }
    else if (b.type === "p") card += `<p style="margin:0.75rem 0;font-size:1.02rem;">${b.content}</p>`;
    else if (b.type === "box") { const c: Record<string, string> = { tip: "#dcfce7|#16a34a|💡", warning: "#ffedd5|#ea580c|⚠️", important: "#fee2e2|#dc2626|🚨" }; const [bg, fg, ic] = c[b.boxType!].split("|"); card += `<div style="background:${bg};border-radius:8px;padding:12px 16px;margin:0.75rem 0;"><span style="color:${fg};font-weight:700;">${ic}</span> ${b.content}</div>`; }
  }
  flush();
  if (faqs.length) { h += `<div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(37,99,235,0.1);padding:20px 24px;margin-bottom:20px;"><h3 style="font-size:1.1rem;font-weight:800;color:#2563eb;margin-bottom:16px;">❓ 자주 묻는 질문</h3>`; for (const f of faqs) h += `<div style="margin-bottom:14px;background:#f0f6ff;border-radius:8px;padding:12px 16px;"><p style="font-weight:700;margin-bottom:4px;">Q. ${f.q}</p><p style="color:#475569;font-size:0.98rem;">A. ${f.a}</p></div>`; h += `</div>`; }
  if (refs.length) { h += `<div style="background:#fff;border-radius:14px;padding:16px 24px;margin-bottom:20px;"><h4 style="font-size:0.9rem;font-weight:700;color:#94a3b8;margin-bottom:10px;">📎 참고자료</h4>`; for (const r of refs) h += buildRefItem(r, "#2563eb", "font-weight:600;"); h += `</div>`; }
  h += buildRelated(related, "#2563eb", "#eff6ff");
  return h + `</div></div>`;
}

function buildMagazine(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  let h = `<div style="font-family:'Noto Serif KR','Georgia',serif;max-width:720px;margin:0 auto;padding:0;background:#faf8f5;color:#1a1a1a;line-height:1.9;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:40px 24px;">`;
  h += `<div style="border-top:4px solid #1a1a1a;border-bottom:1px solid #1a1a1a;padding:4px 0;margin-bottom:24px;"></div>`;
  h += `<h1 style="font-size:2.2rem;font-weight:900;line-height:1.25;margin-bottom:8px;">${title}</h1>`;
  h += `<div style="border-top:1px solid #1a1a1a;border-bottom:1px solid #c8102e;padding:4px 0;margin-bottom:20px;"></div>`;
  h += buildToc(blocks, "#c8102e", "#fff8f8", "#fecaca", "#1a1a1a");
  let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") h += `<h2 id="section-${secIdx++}" style="font-size:1.25rem;font-weight:800;font-family:'Noto Sans KR',sans-serif;border-left:4px solid #c8102e;padding-left:12px;margin:2rem 0 1rem;">${b.content}</h2>`;
    else if (b.type === "p") h += `<p style="margin:1.1rem 0;font-size:1.05rem;text-align:justify;">${b.content}</p>`;
    else if (b.type === "box") { const l: Record<string, string> = { tip: "💡 팁", warning: "⚠️ 주의", important: "🚨 중요" }; h += `<blockquote style="border-left:4px solid #c8102e;background:#fff;padding:14px 20px;margin:1.5rem 0;font-style:italic;color:#555;"><strong style="font-style:normal;color:#c8102e;">${l[b.boxType!]}</strong> ${b.content}</blockquote>`; }
  }
  if (faqs.length) { h += `<div style="margin-top:2.5rem;"><div style="border-top:3px solid #1a1a1a;border-bottom:1px solid #1a1a1a;padding:4px 0;margin-bottom:16px;"></div><h3 style="font-size:1rem;font-weight:800;font-family:'Noto Sans KR',sans-serif;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:1rem;">FAQ</h3>`; for (const f of faqs) h += `<div style="margin-bottom:1.25rem;padding-bottom:1.25rem;border-bottom:1px solid #e5e0d8;"><p style="font-weight:700;font-family:'Noto Sans KR',sans-serif;margin-bottom:6px;">Q. ${f.q}</p><p style="color:#666;">A. ${f.a}</p></div>`; h += `</div>`; }
  if (refs.length) { h += `<div style="margin-top:1.5rem;border-top:1px solid #ccc;padding-top:1rem;"><h4 style="font-size:0.8rem;font-weight:700;letter-spacing:0.15em;color:#888;font-family:'Noto Sans KR',sans-serif;margin-bottom:0.75rem;">REFERENCES</h4>`; for (const r of refs) h += buildRefItem(r, "#c8102e"); h += `</div>`; }
  h += buildRelated(related, "#c8102e", "#fff8f8");
  return h + `</div></div>`;
}

function buildDark(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;max-width:720px;margin:0 auto;padding:0;background:#0f0f1a;color:#e8e8f0;line-height:1.85;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:36px 24px;">`;
  h += `<h1 style="font-size:1.9rem;font-weight:900;color:#ffffff;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #e94560;">${title}</h1>`;
  h += buildToc(blocks, "#e94560", "#1a1a2e", "#333366", "#c8c8d8");
  let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") h += `<h2 id="section-${secIdx++}" style="font-size:1.2rem;font-weight:700;color:#e94560;margin:2rem 0 1rem;padding-left:12px;border-left:3px solid #e94560;">${b.content}</h2>`;
    else if (b.type === "p") h += `<p style="margin:1rem 0;font-size:1.02rem;color:#c8c8d8;">${b.content}</p>`;
    else if (b.type === "box") { const c: Record<string, string> = { tip: "#0d2e1a|#22c55e|💡", warning: "#2e1a0d|#f97316|⚠️", important: "#2e0d0d|#ef4444|🚨" }; const [bg, br, ic] = c[b.boxType!].split("|"); h += `<div style="background:${bg};border:1px solid ${br};border-left:4px solid ${br};padding:14px 18px;margin:1.25rem 0;border-radius:6px;">${ic} ${b.content}</div>`; }
  }
  if (faqs.length) { h += `<div style="margin-top:2.5rem;border-top:1px solid #333;padding-top:1.5rem;"><h3 style="font-size:1rem;font-weight:700;color:#e94560;margin-bottom:1rem;">자주 묻는 질문</h3>`; for (const f of faqs) h += `<div style="margin-bottom:1rem;background:#1a1a2e;padding:14px 18px;border-radius:8px;"><p style="font-weight:700;color:#fff;margin-bottom:4px;">Q. ${f.q}</p><p style="color:#aaa;font-size:0.97rem;">A. ${f.a}</p></div>`; h += `</div>`; }
  if (refs.length) { h += `<div style="margin-top:1.5rem;border-top:1px solid #333;padding-top:1rem;"><h4 style="font-size:0.85rem;color:#666;margin-bottom:0.75rem;">참고자료</h4>`; for (const r of refs) h += buildRefItem(r, "#e94560"); h += `</div>`; }
  h += buildRelated(related, "#e94560", "#1a1a2e");
  return h + `</div></div>`;
}

function buildWarm(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  let h = `<div style="font-family:'Noto Serif KR','Georgia',serif;max-width:720px;margin:0 auto;padding:0;background:#fdf6ec;color:#3d2b1f;line-height:1.9;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:36px 24px;">`;
  h += `<h1 style="font-size:1.9rem;font-weight:900;color:#7c3e0e;margin-bottom:20px;padding-bottom:14px;border-bottom:2px dashed #e5c18e;">${title}</h1>`;
  h += buildToc(blocks, "#d97706", "#fffbeb", "#fde68a", "#7c3e0e");
  let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") h += `<h2 id="section-${secIdx++}" style="font-size:1.2rem;font-weight:800;color:#92400e;margin:2rem 0 1rem;background:#fef3c7;padding:10px 16px;border-radius:8px;border-left:4px solid #d97706;">${b.content}</h2>`;
    else if (b.type === "p") h += `<p style="margin:1rem 0;font-size:1.04rem;">${b.content}</p>`;
    else if (b.type === "box") { const l: Record<string, string> = { tip: "🌿 팁", warning: "🍂 주의", important: "🌟 중요" }; h += `<div style="background:#fff8e8;border:1px solid #e5c18e;border-radius:12px;padding:14px 18px;margin:1.25rem 0;font-size:0.97rem;"><strong>${l[b.boxType!]}</strong> ${b.content}</div>`; }
  }
  if (faqs.length) { h += `<div style="margin-top:2.5rem;background:#fff8e8;border-radius:16px;padding:20px 24px;"><h3 style="font-size:1.05rem;font-weight:800;color:#92400e;margin-bottom:1rem;">🙋 자주 묻는 질문</h3>`; for (const f of faqs) h += `<div style="margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px dashed #e5c18e;"><p style="font-weight:700;color:#7c3e0e;margin-bottom:4px;">Q. ${f.q}</p><p style="color:#5c3b1e;font-size:0.97rem;">A. ${f.a}</p></div>`; h += `</div>`; }
  if (refs.length) { h += `<div style="margin-top:1.5rem;padding-top:1rem;border-top:1px dashed #e5c18e;"><h4 style="font-size:0.85rem;color:#a16207;margin-bottom:0.75rem;">📚 참고자료</h4>`; for (const r of refs) h += buildRefItem(r, "#d97706"); h += `</div>`; }
  h += buildRelated(related, "#d97706", "#fffbeb");
  return h + `</div></div>`;
}

function buildColorful(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  const palette = ["#7c3aed", "#2563eb", "#059669", "#dc2626", "#d97706", "#0891b2"];
  let ci = 0;
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;max-width:720px;margin:0 auto;padding:0;background:#f8f9ff;color:#1a1a1a;line-height:1.85;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:32px 20px;">`;
  h += `<h1 style="font-size:1.9rem;font-weight:900;text-align:center;margin-bottom:20px;background:linear-gradient(135deg,#7c3aed,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${title}</h1>`;
  h += buildToc(blocks, "#7c3aed", "#f5f3ff", "#ddd6fe", "#3730a3");
  let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") { const c = palette[ci++ % palette.length]; h += `<h2 id="section-${secIdx++}" style="font-size:1.2rem;font-weight:800;color:${c};margin:2rem 0 1rem;display:flex;align-items:center;gap:8px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0;"></span>${b.content}</h2>`; }
    else if (b.type === "p") h += `<p style="margin:1rem 0;font-size:1.02rem;">${b.content}</p>`;
    else if (b.type === "box") { const c: Record<string, string> = { tip: "#f0fdf4|#16a34a|💡", warning: "#fff7ed|#ea580c|⚠️", important: "#fef2f2|#dc2626|🚨" }; const [bg, fg, ic] = c[b.boxType!].split("|"); h += `<div style="background:${bg};border-radius:10px;padding:14px 18px;margin:1.25rem 0;border-left:4px solid ${fg};"><span style="color:${fg};font-weight:700;">${ic}</span> ${b.content}</div>`; }
  }
  if (faqs.length) { h += `<div style="margin-top:2.5rem;"><h3 style="font-size:1.1rem;font-weight:800;background:linear-gradient(135deg,#7c3aed,#2563eb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1rem;">자주 묻는 질문</h3>`; faqs.forEach((f, i) => { const c = palette[i % palette.length]; h += `<div style="margin-bottom:1rem;background:#fff;border-radius:10px;padding:14px 18px;border-left:4px solid ${c};box-shadow:0 2px 8px rgba(0,0,0,0.06);"><p style="font-weight:700;color:${c};margin-bottom:4px;">Q. ${f.q}</p><p style="color:#555;font-size:0.97rem;">A. ${f.a}</p></div>`; }); h += `</div>`; }
  if (refs.length) { h += `<div style="margin-top:1.5rem;padding-top:1rem;border-top:2px dashed #e5e7eb;"><h4 style="font-size:0.85rem;font-weight:700;color:#888;margin-bottom:0.75rem;">참고자료</h4>`; for (const r of refs) h += buildRefItem(r, "#7c3aed"); h += `</div>`; }
  h += buildRelated(related, "#7c3aed", "#f5f3ff");
  return h + `</div></div>`;
}

function buildNewsletter(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  let h = `<div style="font-family:'Noto Sans KR',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">`;
  h += buildThumb(thumbnail);
  h += `<div style="background:#059669;padding:24px 32px;"><h1 style="font-size:1.6rem;font-weight:900;color:#ffffff;margin:0;line-height:1.3;">${title}</h1></div>`;
  h += `<div style="padding:28px 32px;background:#f5f7fa;">`;
  h += buildToc(blocks, "#059669", "#fff", "#d1fae5", "#065f46");
  let sec = false; let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") { if (sec) h += `</div>`; h += `<div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:16px;border-top:3px solid #059669;"><h2 id="section-${secIdx++}" style="font-size:1.05rem;font-weight:800;color:#059669;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">${b.content}</h2>`; sec = true; }
    else if (b.type === "p") { if (!sec) { h += `<div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:16px;">`; sec = true; } h += `<p style="margin:0.75rem 0;font-size:0.97rem;color:#374151;line-height:1.75;">${b.content}</p>`; }
    else if (b.type === "box") { const c: Record<string, string> = { tip: "#ecfdf5|#059669|✅ 팁", warning: "#fff7ed|#d97706|⚠️ 주의", important: "#fef2f2|#dc2626|🔴 중요" }; const [bg, fg, lb] = c[b.boxType!].split("|"); h += `<div style="background:${bg};border-left:3px solid ${fg};padding:10px 14px;margin:10px 0;font-size:0.93rem;border-radius:4px;"><strong style="color:${fg};">${lb}</strong> ${b.content}</div>`; }
  }
  if (sec) h += `</div>`;
  if (faqs.length) { h += `<div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:16px;border-top:3px solid #059669;"><h3 style="font-size:1rem;font-weight:800;color:#059669;margin:0 0 14px;">FAQ</h3>`; for (const f of faqs) h += `<div style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;"><p style="font-weight:700;font-size:0.93rem;color:#111;margin-bottom:4px;">Q. ${f.q}</p><p style="color:#6b7280;font-size:0.91rem;">A. ${f.a}</p></div>`; h += `</div>`; }
  if (refs.length) { h += `<div style="background:#fff;border-radius:8px;padding:16px 24px;margin-bottom:16px;"><h4 style="font-size:0.8rem;font-weight:700;color:#9ca3af;margin-bottom:8px;">참고자료</h4>`; for (const r of refs) h += buildRefItem(r, "#059669"); h += `</div>`; }
  if (related.length) { h += `<div style="padding:0 32px 20px;background:#f5f7fa;">${buildRelated(related, "#059669", "#ecfdf5")}</div>`; }
  h += `</div><div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;font-size:0.78rem;color:#9ca3af;">온종일뉴스</div>`;
  return h + `</div>`;
}

function buildInfocard(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  const ac = "#0369a1";
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;max-width:740px;margin:0 auto;padding:0;background:#f8fafc;color:#1e293b;line-height:1.85;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:36px 24px;">`;
  h += `<h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin-bottom:6px;line-height:1.3;">${title}</h1>`;
  h += `<div style="width:48px;height:4px;background:${ac};border-radius:4px;margin-bottom:24px;"></div>`;
  h += buildToc(blocks, ac, "#f0f9ff", "#bae6fd", "#0c4a6e");
  let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") {
      h += `<h2 id="section-${secIdx++}" style="font-size:1.15rem;font-weight:800;color:#0f172a;margin:2.2rem 0 1rem;padding:10px 16px;background:#fff;border-left:4px solid ${ac};border-radius:0 8px 8px 0;box-shadow:0 1px 4px rgba(3,105,161,0.08);">${b.content}</h2>`;
    } else if (b.type === "p") {
      h += `<p style="margin:1rem 0;font-size:1.02rem;color:#334155;line-height:1.9;">${b.content}</p>`;
    } else if (b.type === "box") {
      const c: Record<string, string> = { tip: "#f0f9ff|#0369a1|💡 팁", warning: "#fff7ed|#ea580c|⚠️ 주의", important: "#fef2f2|#dc2626|🚨 중요" };
      const [bg, fg, lb] = c[b.boxType!].split("|");
      h += `<div style="background:${bg};border:1.5px solid ${fg}33;border-radius:10px;padding:14px 18px;margin:1.25rem 0;"><strong style="color:${fg};font-size:0.85rem;display:block;margin-bottom:5px;">${lb}</strong><span style="font-size:0.98rem;color:#334155;">${b.content}</span></div>`;
    }
  }
  if (faqs.length) {
    h += `<div style="margin-top:2.5rem;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:4px;height:20px;background:${ac};border-radius:4px;"></div><h3 style="font-size:1.05rem;font-weight:800;color:#0f172a;margin:0;">자주 묻는 질문</h3></div>`;
    for (const f of faqs) { h += `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><p style="font-weight:700;color:#0369a1;margin-bottom:8px;font-size:0.97rem;">Q. ${f.q}</p><p style="color:#475569;font-size:0.95rem;line-height:1.75;margin:0;">A. ${f.a}</p></div>`; }
    h += `</div>`;
  }
  if (refs.length) {
    h += `<div style="margin-top:2.5rem;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:4px;height:20px;background:${ac};border-radius:4px;"></div><h3 style="font-size:1.05rem;font-weight:800;color:#0f172a;margin:0;">참고자료 및 링크</h3></div>`;
    for (const r of refs) {
      h += `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">`;
      if (r.url) h += `<a href="${r.url}" target="_blank" rel="noopener noreferrer" style="font-size:1rem;font-weight:700;color:${ac};text-decoration:none;display:block;margin-bottom:5px;">${r.name}</a>`;
      else h += `<p style="font-size:1rem;font-weight:700;color:#0f172a;margin-bottom:5px;">${r.name}</p>`;
      if (r.desc) {
        const descHtml = r.desc.split(",").map((p) => { const t = p.trim(); return t.startsWith("http") ? `<a href="${t}" target="_blank" rel="noopener noreferrer" style="color:${ac};word-break:break-all;">${t}</a>` : t; }).join(", ");
        h += `<p style="font-size:0.88rem;color:#64748b;margin:0;line-height:1.6;">${descHtml}</p>`;
      }
      h += `</div>`;
    }
    h += `</div>`;
  }
  h += buildRelated(related, ac, "#f0f9ff");
  return h + `</div></div>`;
}

function buildHighlighter(title: string, blocks: Block[], faqs: Faqs, refs: Refs, related: Related, thumbnail = ""): string {
  const colors = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];
  let ci = 0;
  let h = `<div style="font-family:'Noto Sans KR',sans-serif;max-width:720px;margin:0 auto;padding:0;background:#fffdf7;color:#1c1917;line-height:1.9;">`;
  h += buildThumb(thumbnail);
  h += `<div style="padding:36px 24px;">`;
  h += `<div style="border-bottom:2.5px solid #1c1917;padding-bottom:16px;margin-bottom:24px;">`;
  h += `<h1 style="font-size:1.95rem;font-weight:900;color:#1c1917;line-height:1.3;display:inline;background:linear-gradient(transparent 55%, #fef08a 55%);padding:0 4px;">${title}</h1>`;
  h += `</div>`;
  h += buildToc(blocks, "#854d0e", "#fefce8", "#fde68a", "#431407");
  let secIdx = 0;
  for (const b of blocks) {
    if (b.type === "h2") {
      const hl = colors[ci++ % colors.length];
      h += `<h2 id="section-${secIdx++}" style="font-size:1.15rem;font-weight:800;color:#1c1917;margin:2.2rem 0 1rem;display:inline-block;background:linear-gradient(transparent 40%, ${hl} 40%);padding:0 6px 2px;">${b.content}</h2><br>`;
    } else if (b.type === "p") {
      h += `<p style="margin:1rem 0;font-size:1.02rem;color:#292524;">${b.content}</p>`;
    } else if (b.type === "box") {
      const styles: Record<string, string> = {
        tip: `background:#fefce8;border:2px solid #facc15;border-radius:3px 12px 12px 3px;`,
        warning: `background:#fff7ed;border:2px solid #fb923c;border-radius:3px 12px 12px 3px;`,
        important: `background:#fef2f2;border:2px solid #f87171;border-radius:3px 12px 12px 3px;`,
      };
      const icons: Record<string, string> = { tip: "✏️ 핵심 포인트", warning: "⚠️ 주의", important: "🔴 중요" };
      h += `<div style="${styles[b.boxType!]}padding:14px 18px;margin:1.25rem 0;position:relative;"><strong style="font-size:0.82rem;display:block;margin-bottom:6px;color:#78350f;">${icons[b.boxType!]}</strong><span style="font-size:0.98rem;">${b.content}</span></div>`;
    }
  }
  if (faqs.length) {
    h += `<div style="margin-top:2.5rem;background:#fff;border:2px solid #fde68a;border-radius:14px;padding:20px 24px;"><h3 style="font-size:1rem;font-weight:800;color:#854d0e;margin-bottom:16px;display:inline-block;background:linear-gradient(transparent 40%,#fef08a 40%);padding:0 4px;">자주 묻는 질문</h3>`;
    for (const f of faqs) h += `<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1.5px dashed #fde68a;"><p style="font-weight:800;color:#1c1917;margin-bottom:5px;font-size:0.97rem;">Q. ${f.q}</p><p style="color:#57534e;font-size:0.95rem;line-height:1.75;margin:0;">A. ${f.a}</p></div>`;
    h += `</div>`;
  }
  if (refs.length) {
    h += `<div style="margin-top:2rem;padding-top:1.5rem;border-top:2px dashed #fde68a;"><h4 style="font-size:0.9rem;font-weight:800;color:#854d0e;margin-bottom:12px;">📎 참고자료</h4>`;
    for (const r of refs) {
      const bg = colors[ci++ % colors.length];
      h += `<div style="display:inline-block;margin:0 6px 8px 0;">`;
      if (r.url) h += `<a href="${r.url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:5px 14px;background:${bg};border-radius:20px;font-size:0.88rem;font-weight:700;color:#1c1917;text-decoration:none;">${r.name}</a>`;
      else h += `<span style="display:inline-block;padding:5px 14px;background:${bg};border-radius:20px;font-size:0.88rem;font-weight:700;color:#1c1917;">${r.name}</span>`;
      h += `</div>`;
    }
    h += `</div>`;
  }
  h += buildRelated(related, "#854d0e", "#fefce8");
  return h + `</div></div>`;
}

export function buildTemplateHtml(templateId: string, title: string, rawContent: string, thumbnail = ""): string {
  const body = getBody(rawContent);
  const faqs = extractFaq(rawContent);
  const refs = extractRefs(rawContent);
  const related = extractRelated(rawContent);
  const blocks = parseBodyBlocks(body);
  switch (templateId) {
    case "minimal":    return buildMinimal(title, blocks, faqs, refs, related, thumbnail);
    case "card":       return buildCard(title, blocks, faqs, refs, related, thumbnail);
    case "magazine":   return buildMagazine(title, blocks, faqs, refs, related, thumbnail);
    case "dark":       return buildDark(title, blocks, faqs, refs, related, thumbnail);
    case "warm":       return buildWarm(title, blocks, faqs, refs, related, thumbnail);
    case "colorful":   return buildColorful(title, blocks, faqs, refs, related, thumbnail);
    case "newsletter": return buildNewsletter(title, blocks, faqs, refs, related, thumbnail);
    case "infocard":   return buildInfocard(title, blocks, faqs, refs, related, thumbnail);
    case "highlighter":return buildHighlighter(title, blocks, faqs, refs, related, thumbnail);
    default:           return buildMagazine(title, blocks, faqs, refs, related, thumbnail);
  }
}
