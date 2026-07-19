"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, REPORTERS, catOf, type CategoryId } from "@/data";
import { TEMPLATES, buildTemplateHtml } from "@/lib/templates";

const STORE_KEY = "on_news_drafts";

interface Draft {
  id: string;
  title: string;
  category: CategoryId;
  reporter: string;
  excerpt: string;
  body: string;
  source: string;
  aiAssisted: boolean;
  image: string;       // 대문 카드 배경(색상)
  imageUrl: string;    // 대표 이미지(사진 주소)
  template: string;    // 글 템플릿
  savedAt: number;
}

const grad = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;
const SWATCHES = [
  grad("#059669", "#065f46"), grad("#7c3aed", "#4c1d95"),
  grad("#0369a1", "#075985"), grad("#d97706", "#b45309"),
  grad("#c8102e", "#991b1b"), grad("#2563eb", "#1d4ed8"),
  grad("#334155", "#0f172a"),
];

const blank = (): Omit<Draft, "id" | "savedAt"> => ({
  title: "", category: "fund", reporter: "desk", excerpt: "",
  body: "", source: "", aiAssisted: false,
  image: SWATCHES[0], imageUrl: "", template: "magazine",
});

export default function AdminEditor() {
  const [d, setD] = useState(blank());
  const [editId, setEditId] = useState<string | null>(null);
  const [list, setList] = useState<Draft[]>([]);
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // AI 키 (관리자가 직접 교체 · 브라우저에 저장)
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [showKeys, setShowKeys] = useState(false);
  const [keyMsg, setKeyMsg] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setList(JSON.parse(raw));
      setGeminiKey(localStorage.getItem("on_ai_gemini") || "");
      setGroqKey(localStorage.getItem("on_ai_groq") || "");
    } catch { /* noop */ }
  }, []);

  const saveKeys = () => {
    localStorage.setItem("on_ai_gemini", geminiKey.trim());
    localStorage.setItem("on_ai_groq", groqKey.trim());
    setKeyMsg("✓ 저장되었습니다");
    setTimeout(() => setKeyMsg(""), 3000);
  };

  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  const flash = (t: string, ok = true) => {
    setMsg({ t, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  const persist = (next: Draft[]) => {
    setList(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  const cat = catOf(d.category);
  const previewHtml = useMemo(
    () => buildTemplateHtml(d.template, d.title || "제목을 입력하세요", d.body || d.excerpt || "", d.imageUrl),
    [d.template, d.title, d.body, d.excerpt, d.imageUrl]
  );

  const save = () => {
    if (!d.title.trim()) return flash("제목을 입력해 주세요.", false);
    if (editId) {
      persist(list.map((x) => (x.id === editId ? { ...x, ...d, savedAt: Date.now() } : x)));
      flash("수정 내용을 저장했어요.");
    } else {
      const item: Draft = { ...d, id: "d" + Date.now(), savedAt: Date.now() };
      persist([item, ...list]);
      setEditId(item.id);
      flash("기사를 저장했어요. (임시저장 · 브라우저)");
    }
  };

  const newDraft = () => { setD(blank()); setEditId(null); flash("새 기사를 시작했어요."); };
  const edit = (x: Draft) => { setD({ ...blank(), ...x }); setEditId(x.id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = (id: string) => {
    persist(list.filter((x) => x.id !== id));
    if (editId === id) newDraft();
  };

  const logout = async () => {
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.href = "/";
  };

  const genAI = async () => {
    if (!d.title.trim()) return flash("먼저 제목을 입력하면 AI가 초안을 써드려요.", false);
    setAiLoading(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: d.title, category: cat.name,
          geminiKey: geminiKey.trim(), groqKey: groqKey.trim(),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "생성 실패");
      setD((p) => ({ ...p, excerpt: j.excerpt || p.excerpt, body: j.body || p.body, aiAssisted: true }));
      flash("AI 초안을 불러왔어요. 사실 확인 후 발행하세요.");
    } catch (e) {
      flash(e instanceof Error ? e.message : "AI 생성에 실패했어요.", false);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="wrap admin">
      <div className="admin-top">
        <h1><span className="admin-badge">관리자</span> 기사 작성</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="btn btn-ghost" href="/">← 대문 보기</Link>
          <button className="btn btn-ghost" onClick={logout}>로그아웃</button>
        </div>
      </div>

      {/* AI 키 설정 */}
      <details className="ai-keys">
        <summary>
          <span>⚙ AI 키 설정</span>
          <span className="ai-keys-hint">무료 사용량이 끝나면 여기서 새 키로 교체하세요</span>
          <span className={"ai-keys-state " + (geminiKey || groqKey ? "on" : "off")}>
            {geminiKey || groqKey ? "키 등록됨" : "키 없음"}
          </span>
        </summary>
        <div className="ai-keys-body">
          <div className="field">
            <label>제미나이(Gemini) API 키 <span className="hint">· aistudio.google.com</span></label>
            <input type={showKeys ? "text" : "password"} value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIza..." autoComplete="off" spellCheck={false} />
          </div>
          <div className="field">
            <label>Groq API 키 <span className="hint">· console.groq.com (보조)</span></label>
            <input type={showKeys ? "text" : "password"} value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..." autoComplete="off" spellCheck={false} />
          </div>
          <div className="ai-keys-actions">
            <label className="show-keys">
              <input type="checkbox" checked={showKeys} onChange={(e) => setShowKeys(e.target.checked)} /> 키 보기
            </label>
            <div className="ai-keys-save">
              {keyMsg && <span className="ai-keys-msg">{keyMsg}</span>}
              <button className="btn btn-primary" onClick={saveKeys}>키 저장</button>
            </div>
          </div>
        </div>
      </details>

      <div className="admin-grid">
        {/* ===== 폼 ===== */}
        <div className="admin-col-form">
          <div className="admin-form">
            <div className="field">
              <label>제목</label>
              <input value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="독자가 클릭하고 싶은 제목" />
            </div>

            <div className="field-row">
              <div className="field">
                <label>카테고리</label>
                <select value={d.category} onChange={(e) => set("category", e.target.value as CategoryId)}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>기자 (바이라인)</label>
                <select value={d.reporter} onChange={(e) => set("reporter", e.target.value)}>
                  {Object.values(REPORTERS).map((r) => <option key={r.id} value={r.id}>{r.name} · {r.role}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>요약 (한 줄 소개)</label>
              <input value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="목록·검색·공유에 쓰이는 짧은 소개" />
            </div>

            {/* 글 템플릿 선택 (9종) */}
            <div className="field">
              <label>글 템플릿 <span className="hint">· 레이아웃·색상이 달라져요</span></label>
              <div className="tpl-grid">
                {TEMPLATES.map((t) => (
                  <button key={t.id} type="button"
                    className={"tpl-card" + (d.template === t.id ? " on" : "")}
                    onClick={() => set("template", t.id)}
                    style={d.template === t.id ? { borderColor: t.accent } : undefined}>
                    <span className="tpl-emoji" style={{ background: t.grad }}>{t.emoji}</span>
                    <span className="tpl-name">{t.name}</span>
                    <span className="tpl-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 대표 이미지 */}
            <div className="field">
              <label>대표 이미지 (사진 주소)</label>
              <span className="hint">사진 URL을 넣으면 기사 맨 위에 표시돼요. 비우면 아래 색상 배너가 쓰여요.</span>
              <input value={d.imageUrl} onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://...jpg" autoComplete="off" spellCheck={false} />
            </div>

            <div className="field">
              <label>대문 카드 배경색 <span className="hint">· 대표 이미지가 없을 때</span></label>
              <div className="swatches">
                {SWATCHES.map((s) => (
                  <button key={s} type="button" className={"swatch" + (d.image === s ? " on" : "")}
                    style={{ background: s }} onClick={() => set("image", s)} aria-label="색상 선택" />
                ))}
              </div>
            </div>

            <div className="field">
              <label>본문</label>
              <span className="hint">
                소제목 <b>## 제목</b> · 강조 <b>[팁] [주의] [중요]</b> · 목차는 자동 생성돼요.<br />
                참고링크·FAQ·관련글은 아래 문법으로 추가할 수 있어요(선택):
              </span>
              <textarea value={d.body} onChange={(e) => set("body", e.target.value)}
                placeholder={"본문을 입력하세요.\n\n## 소제목 예시\n[팁] 도움 되는 팁을 여기에\n\n[참고자료시작]\nLINK1: 중소벤처기업부|공식 공고|https://www.mss.go.kr\n[참고자료끝]\n\n[FAQ시작]\nQ1: 궁금한 점은?\nA1: 이렇게 답해요.\n[FAQ끝]\n\n[관련글시작]\nPOST1: 관련 글 제목|한 줄 설명\n[관련글끝]"} />
            </div>

            <div className="field">
              <label>자료 출처 (선택)</label>
              <input value={d.source} onChange={(e) => set("source", e.target.value)} placeholder="예: 중소벤처기업부 공고 / 인터뷰" />
            </div>

            {msg && <div className={"admin-msg " + (msg.ok ? "ok" : "err")}>{msg.t}</div>}

            <div className="admin-actions">
              <button className="btn btn-ai" onClick={genAI} disabled={aiLoading}>
                {aiLoading ? "AI가 작성 중…" : "✦ AI 초안 생성"}
              </button>
              <button className="btn btn-primary" onClick={save}>{editId ? "수정 저장" : "기사 저장"}</button>
              <button className="btn btn-ghost" onClick={newDraft}>새 기사</button>
            </div>
          </div>

          {/* 저장 목록 */}
          <div className="admin-saved">
            <h2>임시저장한 기사 ({list.length})</h2>
            {list.length === 0
              ? <p className="hint">아직 저장한 기사가 없어요.</p>
              : (
                <div className="saved-list">
                  {list.map((x) => {
                    const c = catOf(x.category);
                    return (
                      <div className="saved-item" key={x.id}>
                        <span className="si-cat" style={{ background: c.color }}>{c.name}</span>
                        <span className="si-title">{x.title || "(제목 없음)"}</span>
                        <span className="si-date">{new Date(x.savedAt).toLocaleDateString("ko-KR")}</span>
                        <button onClick={() => edit(x)}>수정</button>
                        <button onClick={() => remove(x.id)}>삭제</button>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        {/* ===== 미리보기 (선택 템플릿) ===== */}
        <div className="admin-col-preview">
          <div className="preview-label">실시간 미리보기 · {TEMPLATES.find((t) => t.id === d.template)?.name}</div>
          <div className="preview-box">
            {!d.title && !d.body ? (
              <div className="preview-empty">제목과 본문을 입력하면<br />선택한 템플릿으로 보여요.</div>
            ) : (
              <div className="tpl-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
