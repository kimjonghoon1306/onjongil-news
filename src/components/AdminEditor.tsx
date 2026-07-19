"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { CATEGORIES, REPORTERS, catOf, type CategoryId } from "@/data";
import { TEMPLATES, buildTemplateHtml } from "@/lib/templates";
import { readMinutes } from "@/lib/format";

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
  image: string;
  imageUrl: string;
  template: string;
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
  const [publishing, setPublishing] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [fullPreview, setFullPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // 전체화면 미리보기 시 배경 스크롤 잠금 + ESC 닫기
  useEffect(() => {
    if (!fullPreview) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullPreview(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [fullPreview]);

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
  const reporter = REPORTERS[d.reporter];
  const readMin = readMinutes(d.body || d.excerpt);
  const tpl = TEMPLATES.find((t) => t.id === d.template);
  const previewHtml = useMemo(
    () => buildTemplateHtml(d.template, d.title || "제목을 입력하세요", d.body || d.excerpt || "", d.imageUrl),
    [d.template, d.title, d.body, d.excerpt, d.imageUrl]
  );

  const save = () => {
    if (!d.title.trim()) return flash("제목을 입력해 주세요.", false);
    if (editId) {
      persist(list.map((x) => (x.id === editId ? { ...x, ...d, savedAt: Date.now() } : x)));
      flash("수정 내용을 임시저장했어요.");
    } else {
      const item: Draft = { ...d, id: "d" + Date.now(), savedAt: Date.now() };
      persist([item, ...list]);
      setEditId(item.id);
      flash("임시저장했어요. (브라우저에 보관 · 발행은 다음 단계)");
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

  const publish = async () => {
    if (!d.title.trim()) return flash("제목을 입력해 주세요.", false);
    if (!d.body.trim()) return flash("본문을 입력해 주세요.", false);
    if (!confirm("이 기사를 사이트에 발행할까요? 대문에 바로 올라갑니다.")) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: d.title, category: d.category, excerpt: d.excerpt, body: d.body,
          reporter: d.reporter, image: d.image, imageUrl: d.imageUrl,
          template: d.template, source: d.source, aiAssisted: d.aiAssisted, featured,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "발행 실패");
      flash("✅ 발행됐어요! 잠시 후 대문에서 확인하세요.");
    } catch (e) {
      flash(e instanceof Error ? e.message : "발행에 실패했어요.", false);
    } finally {
      setPublishing(false);
    }
  };

  const genAI = async () => {
    if (!d.title.trim()) return flash("먼저 제목을 입력하면 AI가 초안을 써드려요.", false);
    setAiLoading(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: d.title, category: cat.name, geminiKey: geminiKey.trim(), groqKey: groqKey.trim() }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "생성 실패");
      setD((p) => ({ ...p, excerpt: j.excerpt || p.excerpt, body: j.body || p.body, aiAssisted: true }));
      flash("AI 초안을 불러왔어요. 사실 확인 후 저장하세요.");
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
        <div className="admin-top-btns">
          <Link className="btn btn-ghost" href="/">← 대문 보기</Link>
          <button className="btn btn-ghost" onClick={logout}>로그아웃</button>
        </div>
      </div>

      {/* 환경설정: AI 키 */}
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
          {/* 섹션 1 · 기본 정보 */}
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">1 · 기본 정보</h2>
              <p className="admin-section-desc">기사의 제목과 분류를 정합니다.</p>
            </div>
            <div className="admin-section-fields">
              <div className="field field--title">
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
              <label className="check-row">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                이 기사를 <b>오늘의 톱기사</b>로 올리기
              </label>
            </div>
          </section>

          {/* 섹션 2 · 디자인 */}
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">2 · 디자인</h2>
              <p className="admin-section-desc">글 레이아웃과 대표 이미지를 고릅니다.</p>
            </div>
            <div className="admin-section-fields">
              <div className="field">
                <label>글 템플릿 <span className="hint">· 레이아웃·색상이 달라져요</span></label>
                <div className="tpl-grid">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} type="button" aria-pressed={d.template === t.id}
                      className={"tpl-card" + (d.template === t.id ? " on" : "")}
                      onClick={() => set("template", t.id)}
                      style={d.template === t.id ? { borderColor: t.accent, color: t.accent } : undefined}>
                      <span className="tpl-emoji" style={{ background: t.grad }}>{t.emoji}</span>
                      <span className="tpl-name">{t.name}</span>
                      <span className="tpl-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
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
            </div>
          </section>

          {/* 섹션 3 · 본문 */}
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">3 · 본문</h2>
              <p className="admin-section-desc">소제목·강조·참고링크로 기사를 채웁니다.</p>
            </div>
            <div className="admin-section-fields">
              <div className="field">
                <div className="field-label-row">
                  <label>본문</label>
                  <button type="button" className="btn btn-ai btn-sm" onClick={genAI} disabled={aiLoading}>
                    {aiLoading ? "AI 작성 중…" : "✦ AI 초안"}
                  </button>
                </div>
                <textarea value={d.body} onChange={(e) => set("body", e.target.value)}
                  placeholder={"본문을 입력하세요.\n\n## 소제목 예시\n[팁] 도움 되는 팁을 여기에"} />
                <details className="editor-help">
                  <summary>본문 문법 도움말</summary>
                  <div className="editor-help-body">
                    <p><b>## 소제목</b> — 소제목(목차 자동 생성) · <b>[팁] [주의] [중요]</b> — 강조 상자</p>
                    <p>참고링크·FAQ·관련글은 아래처럼 넣으면 템플릿에 맞게 정리돼요(선택):</p>
                    <pre>{`[참고자료시작]
LINK1: 중소벤처기업부|공식 공고|https://www.mss.go.kr
[참고자료끝]

[FAQ시작]
Q1: 궁금한 점은?
A1: 이렇게 답해요.
[FAQ끝]

[관련글시작]
POST1: 관련 글 제목|한 줄 설명
[관련글끝]`}</pre>
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* 섹션 4 · 출처 */}
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">4 · 출처</h2>
              <p className="admin-section-desc">신뢰를 위한 자료 출처(선택).</p>
            </div>
            <div className="admin-section-fields">
              <div className="field">
                <label>자료 출처</label>
                <input value={d.source} onChange={(e) => set("source", e.target.value)} placeholder="예: 중소벤처기업부 공고 / 인터뷰" />
              </div>
            </div>
          </section>

          {/* 저장 목록 */}
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">임시저장한 기사 <span className="count-badge">{list.length}</span></h2>
            </div>
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
          </section>

          {/* 하단 고정 액션바 */}
          <div className="admin-actions">
            <div className="admin-actions-secondary">
              <button className="btn btn-ghost" onClick={newDraft}>새 기사</button>
              {msg && <span className={"admin-inline-msg " + (msg.ok ? "ok" : "err")}>{msg.t}</span>}
            </div>
            <div className="admin-actions-primary">
              <button className="btn btn-ghost" onClick={save}>{editId ? "임시저장 (수정)" : "임시저장"}</button>
              <button className="btn btn-publish" onClick={publish} disabled={publishing}>
                {publishing ? "발행 중…" : "🚀 발행하기"}
              </button>
            </div>
          </div>
        </div>

        {/* ===== 미리보기 ===== */}
        <div className="admin-col-preview">
          <div className="preview-panel">
            <div className="preview-toolbar">
              <span className="preview-ttl">미리보기 · {tpl?.name}</span>
              <div className="preview-toolbar-right">
                <div className="preview-tabs" role="tablist">
                  <button className={"preview-tab" + (previewMode === "desktop" ? " on" : "")}
                    onClick={() => setPreviewMode("desktop")}>데스크톱</button>
                  <button className={"preview-tab" + (previewMode === "mobile" ? " on" : "")}
                    onClick={() => setPreviewMode("mobile")}>모바일</button>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setFullPreview(true)}>
                  ⛶ 전체화면
                </button>
              </div>
            </div>
            <div className="preview-stage">
              <div className={"preview-device preview-device--" + previewMode}>
                {!d.title && !d.body
                  ? <div className="preview-empty">제목과 본문을 입력하면<br />선택한 템플릿으로 보여요.</div>
                  : <div className="tpl-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전체화면 미리보기 (대중이 보는 화면) */}
      {mounted && fullPreview && createPortal(
        <div className="fullprev-overlay" onClick={() => setFullPreview(false)}>
          <div className="fullprev-bar" onClick={(e) => e.stopPropagation()}>
            <span className="fullprev-title">대중이 보는 화면 · 미리보기</span>
            <div className="fullprev-bar-right">
              <div className="preview-tabs">
                <button className={"preview-tab" + (previewMode === "desktop" ? " on" : "")}
                  onClick={() => setPreviewMode("desktop")}>데스크톱</button>
                <button className={"preview-tab" + (previewMode === "mobile" ? " on" : "")}
                  onClick={() => setPreviewMode("mobile")}>모바일</button>
              </div>
              <button className="fullprev-close" onClick={() => setFullPreview(false)} aria-label="닫기">✕ 닫기</button>
            </div>
          </div>
          <div className="fullprev-stage" onClick={() => setFullPreview(false)}>
            <div className={"fullprev-device fullprev-device--" + previewMode} onClick={(e) => e.stopPropagation()}>
              {/* 사이트 상단 흉내 */}
              <div className="fullprev-mast">
                <span className="fullprev-logo">온종일뉴스</span>
                <span className="fullprev-cat" style={{ color: cat.color }}>{cat.name}</span>
              </div>
              {/* 신뢰 헤더 */}
              <div className="fullprev-trust">
                <span className="byline-avatar" style={{ background: cat.color }}>{(reporter?.name ?? "온")[0]}</span>
                <div>
                  <div className="fullprev-reporter">{reporter?.name}</div>
                  <div className="fullprev-meta">방금 전 · 읽는 데 약 {readMin}분</div>
                </div>
              </div>
              {/* 템플릿 본문 */}
              <div className="tpl-preview" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
}
