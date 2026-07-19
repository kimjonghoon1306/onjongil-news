// 관리자 인증 (서버 전용 · 클라이언트 번들에 포함되지 않음)
// 실제 운영 시 Vercel 환경변수 ADMIN_ID / ADMIN_PW / ADMIN_TOKEN 로 덮어쓰기 권장.

export const ADMIN_ID = process.env.ADMIN_ID || "s9653@naver.com";
export const ADMIN_PW = process.env.ADMIN_PW || "123456";
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "onjongil-admin-session-v1";
export const ADMIN_COOKIE = "on_admin";
