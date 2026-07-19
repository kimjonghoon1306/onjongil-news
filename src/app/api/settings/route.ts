// 관리자 설정(AI 키 등) — Supabase app_settings 에 저장 → 모든 기기 공유.
// 관리자 쿠키 확인 + service_role. 키는 대중/공개에 노출되지 않음(RLS 무정책).
import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/adminAuth";
import { serviceClient } from "@/lib/supabase";

async function guard() {
  const c = await cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) return null;
  return serviceClient();
}

const KEYS = ["gemini_key", "groq_key"];

// 저장된 키 조회 (관리자만)
export async function GET() {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  const { data, error } = await sb.from("app_settings").select("key,value").in("key", KEYS);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  return Response.json({ geminiKey: map.gemini_key ?? "", groqKey: map.groq_key ?? "" });
}

// 키 저장 (관리자만)
export async function POST(req: Request) {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return Response.json({ error: "형식 오류" }, { status: 400 }); }
  const now = new Date().toISOString();
  const rows = [
    { key: "gemini_key", value: (b.geminiKey || "").toString().trim(), updated_at: now },
    { key: "groq_key", value: (b.groqKey || "").toString().trim(), updated_at: now },
  ];
  const { error } = await sb.from("app_settings").upsert(rows, { onConflict: "key" });
  if (error) return Response.json({ error: "저장 실패: " + error.message }, { status: 500 });
  return Response.json({ ok: true });
}
