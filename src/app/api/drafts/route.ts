// 관리자 초안(draft) — Supabase에 저장/조회/삭제 (어느 기기에서든 이어쓰기)
// status='draft' 로 저장 → 대중에겐 안 보이고(공개 RLS=published만), 관리자만 서버 통해 조회.
import { cookies } from "next/headers";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/adminAuth";
import { serviceClient } from "@/lib/supabase";

const VALID_CAT = ["ai", "franchise", "fund", "marketing", "consulting", "free"];

async function guard() {
  const c = await cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) return null;
  return serviceClient();
}

// 목록
export async function GET() {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  const { data, error } = await sb.from("articles")
    .select("slug,title,category,reporter_id,excerpt,body,source,image,image_url,template,ai_assisted,featured,updated_at")
    .eq("status", "draft").order("updated_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ drafts: data ?? [] });
}

// 저장(신규/수정)
export async function POST(req: Request) {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return Response.json({ error: "형식 오류" }, { status: 400 }); }
  const title = (b.title || "").toString().trim();
  if (!title) return Response.json({ error: "제목이 필요해요." }, { status: 400 });
  const category = (b.category || "consulting").toString();
  const slug = (b.slug || "").toString().trim() || "d-" + Date.now().toString(36);
  const row = {
    slug, title,
    excerpt: (b.excerpt || "").toString(),
    body: (b.body || "").toString(),
    category: VALID_CAT.includes(category) ? category : "consulting",
    reporter_id: (b.reporter || "desk").toString(),
    image: (b.image || "").toString(),
    image_url: (b.imageUrl || "").toString() || null,
    template: (b.template || "magazine").toString(),
    source: (b.source || "").toString() || null,
    ai_assisted: !!b.aiAssisted,
    featured: !!b.featured,
    status: "draft",
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from("articles").upsert(row, { onConflict: "slug" }).select("slug").single();
  if (error) return Response.json({ error: "저장 실패: " + error.message }, { status: 500 });
  return Response.json({ ok: true, slug });
}

// 삭제
export async function DELETE(req: Request) {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return Response.json({ error: "slug 필요" }, { status: 400 });
  const { error } = await sb.from("articles").delete().eq("slug", slug).eq("status", "draft");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
