"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdRow {
  id?: string;
  title: string; sub: string; cta: string; url: string;
  bg: string; img: string; house: boolean; active: boolean; sort: number;
}

const grad = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;
const BG_PRESETS = [
  grad("#059669", "#047857"), grad("#2563eb", "#1e40af"),
  grad("#7c3aed", "#5b21b6"), grad("#d97706", "#b45309"),
  grad("#c8102e", "#991b1b"), grad("#334155", "#0f172a"),
];

const blank = (): AdRow => ({
  title: "", sub: "", cta: "자세히 보기", url: "", bg: BG_PRESETS[0],
  img: "", house: false, active: true, sort: 0,
});

export default function AdsManager() {
  const [d, setD] = useState<AdRow>(blank());
  const [list, setList] = useState<AdRow[]>([]);
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof AdRow>(k: K, v: AdRow[K]) => setD((p) => ({ ...p, [k]: v }));
  const flash = (t: string, ok = true) => { setMsg({ t, ok }); setTimeout(() => setMsg(null), 3000); };

  const load = async () => {
    try {
      const res = await fetch("/api/ads");
      const j = await res.json();
      if (res.ok) setList(j.ads ?? []);
    } catch { /* noop */ }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!d.title.trim() && !d.img.trim()) return flash("제목이나 이미지 중 하나는 넣어 주세요.", false);
    setSaving(true);
    try {
      const res = await fetch("/api/ads", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "저장 실패");
      setD(blank());
      await load();
      flash("광고를 저장했어요. 대문에 반영됩니다.");
    } catch (e) {
      flash(e instanceof Error ? e.message : "저장 실패", false);
    } finally { setSaving(false); }
  };

  const edit = (a: AdRow) => { setD({ ...blank(), ...a }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const remove = async (id?: string) => {
    if (!id || !confirm("이 광고를 삭제할까요?")) return;
    await fetch(`/api/ads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
    if (d.id === id) setD(blank());
  };
  const toggle = async (a: AdRow) => {
    await fetch("/api/ads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...a, active: !a.active }) });
    await load();
  };

  return (
    <main className="wrap admin">
      <div className="admin-top">
        <h1><span className="admin-badge">관리자</span> 광고 관리</h1>
        <div className="admin-top-btns">
          <Link className="btn btn-ghost" href="/admin">← 기사 작성</Link>
          <a className="btn btn-ghost" href="/" target="_blank" rel="noreferrer">📄 대문 보기</a>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-col-form">
          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">{d.id ? "광고 수정" : "새 광고 올리기"}</h2>
              <p className="admin-section-desc">이미지 배너 또는 색상+글자 배너로 만들 수 있어요.</p>
            </div>
            <div className="admin-section-fields">
              <div className="field">
                <label>광고 제목</label>
                <input value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="예: 온종일팜 — 산지직송 신선먹거리" />
              </div>
              <div className="field">
                <label>부제 (선택)</label>
                <input value={d.sub} onChange={(e) => set("sub", e.target.value)} placeholder="예: 사장님도 손님도 만족하는 특가" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>버튼 문구</label>
                  <input value={d.cta} onChange={(e) => set("cta", e.target.value)} placeholder="예: 무료 가입" />
                </div>
                <div className="field">
                  <label>클릭 시 이동 주소</label>
                  <input value={d.url} onChange={(e) => set("url", e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="field">
                <label>배너 이미지 주소 (선택)</label>
                <span className="hint">사진 URL을 넣으면 이미지 배너로 나와요(안 잘리게 표시). 비우면 아래 색상 배너.</span>
                <input value={d.img} onChange={(e) => set("img", e.target.value)} placeholder="https://...jpg" />
              </div>
              <div className="field">
                <label>배너 색상 <span className="hint">· 이미지가 없을 때</span></label>
                <div className="swatches">
                  {BG_PRESETS.map((s) => (
                    <button key={s} type="button" className={"swatch" + (d.bg === s ? " on" : "")}
                      style={{ background: s }} onClick={() => set("bg", s)} aria-label="색상" />
                  ))}
                </div>
              </div>
              <label className="check-row">
                <input type="checkbox" checked={d.house} onChange={(e) => set("house", e.target.checked)} />
                온종일그룹 <b>자사 서비스</b> 광고 (AD·자사서비스로 표기)
              </label>
              <div className="field-row">
                <div className="field">
                  <label>정렬 순서 <span className="hint">· 작을수록 먼저</span></label>
                  <input type="number" value={d.sort} onChange={(e) => set("sort", Number(e.target.value))} />
                </div>
                <label className="check-row">
                  <input type="checkbox" checked={d.active} onChange={(e) => set("active", e.target.checked)} />
                  지금 <b>노출</b>하기
                </label>
              </div>

              {msg && <div className={"admin-msg " + (msg.ok ? "ok" : "err")}>{msg.t}</div>}
              <div className="admin-actions" style={{ position: "static" }}>
                <button className="btn btn-ghost" onClick={() => setD(blank())}>새 광고</button>
                <button className="btn btn-publish" onClick={save} disabled={saving}>
                  {saving ? "저장 중…" : d.id ? "수정 저장" : "광고 올리기"}
                </button>
              </div>
            </div>
          </section>

          <section className="admin-section">
            <div className="admin-section-head">
              <h2 className="admin-section-title">등록된 광고 <span className="count-badge">{list.length}</span></h2>
            </div>
            {list.length === 0
              ? <p className="hint">아직 등록된 광고가 없어요.</p>
              : (
                <div className="saved-list">
                  {list.map((a) => (
                    <div className="saved-item" key={a.id}>
                      <span className="ad-dot-preview" style={a.img ? { backgroundImage: `url(${a.img})`, backgroundSize: "cover" } : { background: a.bg }} />
                      <span className="si-title">{a.title || "(이미지 광고)"} {a.house && <b style={{ color: "#0369a1" }}>· 자사</b>}</span>
                      <span className="si-date">{a.active ? "노출중" : "숨김"}</span>
                      <button onClick={() => toggle(a)}>{a.active ? "숨기기" : "노출"}</button>
                      <button onClick={() => edit(a)}>수정</button>
                      <button onClick={() => remove(a.id)}>삭제</button>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </div>

        {/* 미리보기 */}
        <div className="admin-col-preview">
          <div className="preview-label">광고 미리보기</div>
          <div className="ad-preview-box">
            <div className="ad-slider" style={{ marginBottom: 0 }}>
              <div className="ad-slide active" style={d.img ? undefined : { background: d.bg }}>
                {d.img && <>
                  <div className="ad-imgbg" style={{ backgroundImage: `url(${d.img})` }} />
                  <img className="ad-img" src={d.img} alt={d.title || "광고"} />
                </>}
                <span className="ad-badge">{d.house ? "AD · 자사서비스" : "AD · 광고"}</span>
                {(d.img ? (d.title || d.sub || d.cta) : true) && (
                  <div className={d.img ? "ad-overlay" : ""} style={d.img ? undefined : { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <div className="ad-text">
                      {d.title && <h3>{d.title}</h3>}
                      {d.sub && <p>{d.sub}</p>}
                    </div>
                    {d.cta && <span className="ad-cta">{d.cta}</span>}
                  </div>
                )}
              </div>
            </div>
            <p className="hint" style={{ marginTop: 12 }}>실제 대문에서는 여러 광고가 3.5초마다 자동으로 넘어가요.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
