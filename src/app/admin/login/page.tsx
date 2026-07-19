"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "로그인에 실패했어요.");
      }
    } catch {
      setErr("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <Link href="/" className="login-brand">
          <span className="brand-ko">온종일뉴스</span>
          <span className="brand-en">ONJONGIL NEWS</span>
        </Link>
        <h1 className="login-title">관리자 로그인</h1>
        <p className="login-sub">기사 작성·발행은 관리자만 이용할 수 있어요.</p>

        <div className="field">
          <label htmlFor="id">아이디</label>
          <input id="id" type="text" value={id} onChange={(e) => setId(e.target.value)}
            placeholder="아이디(이메일)" autoComplete="username" autoFocus />
        </div>

        <div className="field">
          <label htmlFor="pw">비밀번호</label>
          <div className="pw-wrap">
            <input id="pw" type={showPw ? "text" : "password"} value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호" autoComplete="current-password" />
            <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}>
              {showPw ? "숨기기" : "보기"}
            </button>
          </div>
        </div>

        {err && <div className="admin-msg err">{err}</div>}

        <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
          {loading ? "확인 중…" : "로그인"}
        </button>

        <Link href="/" className="login-back">← 대문으로 돌아가기</Link>
      </form>
    </main>
  );
}
