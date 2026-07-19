import { createClient } from "@supabase/supabase-js";

// 따옴표/공백 제거(로컬 env pull 대비)
const clean = (v?: string) => (v || "").trim().replace(/^["']|["']$/g, "");

const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anon = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const service = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

const validUrl = /^https?:\/\//.test(url);
export const supabaseReady = validUrl && !!anon;

// 공개 읽기용 (anon · RLS → 발행된 기사만)
export function publicClient() {
  if (!validUrl || !anon) return null;
  try {
    return createClient(url, anon, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

// 서버 쓰기용 (service_role · RLS 우회)
export function serviceClient() {
  if (!validUrl || !service) return null;
  try {
    return createClient(url, service, { auth: { persistSession: false } });
  } catch {
    return null;
  }
}

// 서버에 저장된 AI 키 조회 (모든 기기 공유용)
export async function getStoredKeys(): Promise<{ gemini: string; groq: string }> {
  const sb = serviceClient();
  if (!sb) return { gemini: "", groq: "" };
  try {
    const { data } = await sb.from("app_settings").select("key,value").in("key", ["gemini_key", "groq_key"]);
    const m: Record<string, string> = {};
    for (const r of data ?? []) m[r.key] = r.value ?? "";
    return { gemini: m.gemini_key ?? "", groq: m.groq_key ?? "" };
  } catch {
    return { gemini: "", groq: "" };
  }
}
