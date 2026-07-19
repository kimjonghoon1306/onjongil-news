import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseReady = !!(url && anon);

// 공개 읽기용 (anon 키 · RLS 적용 → 발행된 기사만 보임)
export function publicClient() {
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}

// 서버 쓰기용 (service_role 키 · RLS 우회 → 발행 처리)
export function serviceClient() {
  if (!url || !service) return null;
  return createClient(url, service, { auth: { persistSession: false } });
}
