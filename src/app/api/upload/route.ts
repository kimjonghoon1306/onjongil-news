// 관리자 이미지 업로드 → Supabase Storage('media' 버킷) → 공개 URL 반환.
import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/adminAuth";
import { serviceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX = 8 * 1024 * 1024; // 8MB
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function POST(req: Request) {
  const c = await cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) {
    return Response.json({ error: "관리자만 업로드할 수 있어요." }, { status: 401 });
  }
  const sb = serviceClient();
  if (!sb) return Response.json({ error: "Supabase가 설정되지 않았어요." }, { status: 503 });

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    return Response.json({ error: "파일을 읽지 못했어요." }, { status: 400 });
  }
  if (!file) return Response.json({ error: "사진 파일이 없어요." }, { status: 400 });
  if (!OK_TYPES.includes(file.type)) {
    return Response.json({ error: "이미지 파일만 올릴 수 있어요. (JPG·PNG·WEBP·GIF)" }, { status: 400 });
  }
  if (file.size > MAX) {
    return Response.json({ error: "파일이 너무 커요. (최대 8MB)" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${new Date().getFullYear()}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = new Uint8Array(await file.arrayBuffer());

  const { error } = await sb.storage.from("media").upload(path, buf, {
    contentType: file.type, upsert: false,
  });
  if (error) {
    return Response.json({ error: "업로드 실패: " + error.message }, { status: 500 });
  }
  const { data } = sb.storage.from("media").getPublicUrl(path);
  return Response.json({ ok: true, url: data.publicUrl });
}
