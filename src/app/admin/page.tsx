"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, REPORTERS, catOf, type CategoryId } from "@/data";
import { parseBody, BOX_META } from "@/lib/parseBody";
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
  body: "", source: "", aiAssisted: false, image: SWATCHES[0],
});

export default function AdminPage() {
  const [d, setD] = useState(blank());
  const [editId, setEditId] = useState<string | null>(null);
  const [list, setList] = useState<Draft[]>([]);
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setList(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

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

  const blocks = useMemo(() => parseBody(d.body || d.excerpt || ""), [d.body, d.excerpt]);
  const cat = catOf(d.category);
  const reporter = REPORTERS[d.reporter];
  const readMin = readMinutes(d.body);

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
  const edit = (x: Draft) => { setD(x); setEditId(x.id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = (id: string) => {
    persist(list.filter((x) => x.id !== id));
    if (editId === id) newDraft();
  };

  const genAI = async () => {
    if (!d.title.trim()) return flash("먼저 제목을 입력하면 AI가 초안을 써드려요.", false);
    setAiLoading(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: d.title, category: cat.name }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "생성 실패");
      setD((p) => ({
        ...p,
        excerpt: j.excerpt || p.excerpt,
        body: j.body || p.body,
        aiAssisted: true,
      }));
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
        <h1>
          <span className="admin-badge">관리자</span> 기사 작성
        </h1>
        <Link className="btn btn-ghost" href="/">← 대문 보기</Link>
      </div>

      <div className="admin-grid">
        {/* ===== 폼 ===== */}
        <div className="admin-col-form">
          <div className="admin-form">
            <div className="field">
              <label>제목</label>
              <input value={d.title} onChange={(e) => set("title", e.target.value)}
                placeholder="독자가 클릭하고 싶은 제목" />
            </div>

            <div className="field-row">
              <div className="field">
                <label>카테고리</label>
                <select value={d.category}
                  onChange={(e) => set("category", e.target.value as CategoryId)}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>기자 (바이라인)</label>
                <select value={d.reporter} onChange={(e) => set("reporter", e.target.value)}>
                  {Object.values(REPORTERS).map((r) =>
                    <option key={r.id} value={r.id}>{r.name} · {r.role}</option>)}
                </select>
              </div>
            </div>

            <div className="field">
              <label>요약 (한 줄 소개)</label>
              <input value={d.excerpt} onChange={(e) => set("excerpt", e.target.value)}
                placeholder="목록·검색·공유에 쓰이는 짧은 소개" />
            </div>

            <div className="field">
              <label>대표 이미지 색상</label>
              <span className="hint">지금은 색상 배너 · 실제 사진은 추후 업로드 지원</span>
              <div className="swatches">
                {SWATCHES.map((s) => (
                  <button key={s} type="button"
                    className={"swatch" + (d.image === s ? " on" : "")}
                    style={{ background: s }} onClick={() => set("image", s)}
                    aria-label="색상 선택" />
                ))}
              </div>
            </div>

            <div className="field">
              <label>본문</label>
              <span className="hint">
                소제목은 <b>## 제목</b>, 강조 상자는 <b>[팁]</b> <b>[주의]</b> <b>[중요]</b> 로 시작하세요.
              </span>
              <textarea value={d.body} onChange={(e) => set("body", e.target.value)}
                placeholder={"본문을 입력하세요.\n\n## 소제목 예시\n[팁] 도움 되는 팁을 여기에\n[주의] 주의할 점을 여기에"} />
            </div>

            <div className="field">
              <label>자료 출처 (선택)</label>
              <input value={d.source} onChange={(e) => set("source", e.target.value)}
                placeholder="예: 중소벤처기업부 공고 / 인터뷰" />
            </div>

            {msg && <div className={"admin-msg " + (msg.ok ? "ok" : "err")}>{msg.t}</div>}

            <div className="admin-actions">
              <button className="btn btn-ai" onClick={genAI} disabled={aiLoading}>
                {aiLoading ? "AI가 작성 중…" : "✦ AI 초안 생성"}
              </button>
              <button className="btn btn-primary" onClick={save}>
                {editId ? "수정 저장" : "기사 저장"}
              </button>
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
                        <span className="si-date">
                          {new Date(x.savedAt).toLocaleDateString("ko-KR")}
                        </span>
                        <button onClick={() => edit(x)}>수정</button>
                        <button onClick={() => remove(x.id)}>삭제</button>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>

        {/* ===== 미리보기 ===== */}
        <div className="admin-col-preview">
          <div className="preview-label">실시간 미리보기</div>
          <div className="preview-box">
            {!d.title && !d.body ? (
              <div className="preview-empty">제목과 본문을 입력하면<br />여기에 기사 모습이 보여요.</div>
            ) : (
              <article className="article magazine" style={{ margin: 0 }}>
                <div className="article-head">
                  <span className="article-cat" style={{ color: cat.color }}>{cat.name}</span>
                  <div className="rule-top" />
                  <h1>{d.title || "제목을 입력하세요"}</h1>
                  {d.excerpt && <p className="article-lead">{d.excerpt}</p>}
                  <div className="rule-bottom" />
                  <div className="byline">
                    <div className="byline-left">
                      <span className="byline-avatar" style={{ background: cat.color }}>
                        {(reporter?.name ?? "온")[0]}
                      </span>
                      <div className="byline-info">
                        <span className="byline-name">{reporter?.name}</span>
                        <span className="byline-mail">{reporter?.email}</span>
                      </div>
                    </div>
                    <div className="byline-time"><span>방금 · 미리보기</span></div>
                  </div>
                  <div className="art-tools">
                    <span className="art-readtime">읽는 데 약 {readMin}분</span>
                  </div>
                </div>
                <figure className="article-hero">
                  <div className="article-hero-img" style={{ background: d.image }} />
                </figure>
                <div className="article-body">
                  {blocks.map((b, i) => {
                    if (b.type === "h2") return <h2 key={i}>{b.content}</h2>;
                    if (b.type === "box") {
                      const m = BOX_META[b.boxType];
                      return (
                        <blockquote key={i} className="art-box" style={{ borderColor: m.color }}>
                          <strong style={{ color: m.color }}>{m.label}</strong> {b.content}
                        </blockquote>
                      );
                    }
                    return <p key={i}>{b.content}</p>;
                  })}
                </div>
                {(d.source || d.aiAssisted) && (
                  <div className="article-provenance">
                    {d.source && <p><strong>자료 출처</strong> {d.source}</p>}
                    {d.aiAssisted && (
                      <p className="ai-note">
                        이 기사는 AI로 초안을 작성하고 편집자가 사실을 확인·검증했습니다.
                      </p>
                    )}
                  </div>
                )}
              </article>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
