"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/data";
import { todayLabel } from "@/lib/format";
import {
  SearchIcon, MenuIcon, MoonIcon, SunIcon, ClockIcon,
} from "@/icons";

/* 글자크기 단계: 0.9 ~ 1.3 */
const FS_STEPS = [0.9, 1, 1.15, 1.3];

export default function SiteHeader() {
  const [dark, setDark] = useState(false);
  const [fsIdx, setFsIdx] = useState(1);
  const [ready, setReady] = useState(false);

  // 초기값 로드
  useEffect(() => {
    const t = localStorage.getItem("on_theme");
    setDark(t === "dark");
    const s = parseFloat(localStorage.getItem("on_readscale") || "1");
    const i = FS_STEPS.indexOf(s);
    setFsIdx(i >= 0 ? i : 1);
    setReady(true);
  }, []);

  // 다크모드 반영
  useEffect(() => {
    if (!ready) return;
    const mode = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("on_theme", mode);
  }, [dark, ready]);

  // 글자크기 반영
  useEffect(() => {
    if (!ready) return;
    const scale = FS_STEPS[fsIdx];
    document.documentElement.style.setProperty("--read-scale", String(scale));
    localStorage.setItem("on_readscale", String(scale));
  }, [fsIdx, ready]);

  return (
    <>
      {/* 1) 유틸바 */}
      <div className="utilbar">
        <div className="wrap utilbar-inner">
          <div className="util-left">
            <span className="util-date">{todayLabel()}</span>
            <span className="util-sep" />
            <span className="util-tagline">정치는 뺐습니다 · 실용정보만</span>
          </div>
          <div className="util-right">
            {/* 글자 크기 조절 (고연령 배려) */}
            <div className="fs-control" role="group" aria-label="글자 크기 조절">
              <button
                onClick={() => setFsIdx((i) => Math.max(0, i - 1))}
                disabled={fsIdx === 0}
                aria-label="글자 작게"
              >가<span>−</span></button>
              <button
                onClick={() => setFsIdx((i) => Math.min(FS_STEPS.length - 1, i + 1))}
                disabled={fsIdx === FS_STEPS.length - 1}
                aria-label="글자 크게"
              >가<span>＋</span></button>
            </div>
            <span className="util-sep" />
            <ClockIcon size={13} strokeWidth={2} />
            <span className="util-live">실시간 업데이트</span>
          </div>
        </div>
      </div>

      {/* 2) 로고 헤더 */}
      <header className="masthead">
        <div className="wrap masthead-inner">
          <Link className="brand" href="/">
            <span className="brand-ko">온종일뉴스</span>
            <span className="brand-en">ONJONGIL NEWS</span>
          </Link>
          <div className="masthead-right">
            <button
              className="mh-icon"
              onClick={() => setDark((d) => !d)}
              title="화면 모드"
              aria-label="화면 모드 전환"
            >
              {dark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
            </button>
            <form className="mh-search" role="search" onSubmit={(e) => e.preventDefault()}>
              <input placeholder="뉴스 검색" aria-label="검색" />
              <button type="submit" aria-label="검색">
                <SearchIcon size={18} strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 3) 메뉴바 */}
      <nav className="gnb" aria-label="카테고리">
        <div className="wrap gnb-inner">
          <button className="gnb-menu" aria-label="전체 메뉴">
            <MenuIcon size={22} strokeWidth={2} />
          </button>
          <div className="gnb-links">
            <Link className="gnb-link gnb-home" href="/">홈</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.id} className="gnb-link" href={`/#${c.id}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
