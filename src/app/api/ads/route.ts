// 관리자 광고 관리 — Supabase ads 저장/조회/삭제. 대문 광고 슬라이더에 노출.
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/adminAuth";
import { serviceClient } from "@/lib/supabase";

async function guard() {
  const c = await cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) return null;
  return serviceClient();
}

// 전체 광고(비활성 포함) — 관리자 목록용
export async function GET() {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  const { data, error } = await sb.from("ads").select("*")
    .order("sort", { ascending: true }).order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ads: data ?? [] });
}

// 저장(신규/수정)
export async function POST(req: Request) {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return Response.json({ error: "형식 오류" }, { status: 400 }); }

  const row: Record<string, unknown> = {
    title: (b.title || "").toString() || null,
    sub: (b.sub || "").toString() || null,
    cta: (b.cta || "").toString() || null,
    url: (b.url || "#").toString(),
    bg: (b.bg || "").toString() || null,
    img: (b.img || "").toString() || null,
    house: !!b.house,
    active: b.active === undefined ? true : !!b.active,
    sort: Number(b.sort) || 0,
  };
  if (b.id) row.id = b.id;

  const q = b.id
    ? sb.from("ads").update(row).eq("id", b.id as string)
    : sb.from("ads").insert(row);
  const { error } = await q;
  if (error) return Response.json({ error: "저장 실패: " + error.message }, { status: 500 });
  revalidatePath("/");
  return Response.json({ ok: true });
}

// 삭제
export async function DELETE(req: Request) {
  const sb = await guard();
  if (!sb) return Response.json({ error: "권한 없음" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id 필요" }, { status: 400 });
  const { error } = await sb.from("ads").delete().eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  revalidatePath("/");
  return Response.json({ ok: true });
}
