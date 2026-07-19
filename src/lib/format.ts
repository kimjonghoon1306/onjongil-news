// 날짜·읽기시간 포맷 유틸 (언론사 신뢰장치용)

const WD = ["일", "월", "화", "수", "목", "금", "토"];

// 절대 표기: 2026.07.19 09:00
export function fmtAbs(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// 상대 표기: 방금 전 / 32분 전 / 3시간 전 / 어제 / 2026.07.16
export function fmtRel(iso: string, now: Date = new Date("2026-07-19T12:00:00")): string {
  const d = new Date(iso);
  const diff = (now.getTime() - d.getTime()) / 1000; // 초
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 172800) return "어제";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}

// 오늘 날짜(요일) 헤더용: 2026.07.19 (일)
export function todayLabel(now: Date = new Date("2026-07-19T12:00:00")): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())} (${WD[now.getDay()]})`;
}

// 예상 읽기시간(분): 한글 기준 분당 약 350자
export function readMinutes(text?: string): number {
  if (!text) return 1;
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.round(chars / 350));
}
