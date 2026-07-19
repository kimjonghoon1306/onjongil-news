// 관리자 발행 → Supabase articles 에 저장(status='published')
// 관리자 쿠키 확인 + service_role(RLS 우회)로 insert. 발행 후 대문·기사 재검증.
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/adminAuth";
import { serviceClient } from "@/lib/supabase";

const VALID_CAT = ["ai", "franchise", "fund", "marketing", "consulting", "free"];

export async function POST(req: Request) {
  // 1) 인증
  const c = await cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) {
    return Response.json({ error: "관리자만 발행할 수 있어요." }, { status: 401 });
  }

  // 2) Supabase 준비 확인
  const sb = serviceClient();
  if (!sb) {
    return Response.json({ error: "Supabase가 설정되지 않았어요. (환경변수 확인)" }, { status: 503 });
  }

  // 3) 입력
  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return Response.json({ error: "요청 형식 오류" }, { status: 400 }); }
  const title = (b.title || "").toString().trim();
  const category = (b.category || "").toString();
  if (!title) return Response.json({ error: "제목이 필요해요." }, { status: 400 });
  if (!VALID_CAT.includes(category)) return Response.json({ error: "카테고리를 확인해 주세요." }, { status: 400 });

  const slug = (b.slug || "").toString().trim() || "a-" + Date.now().toString(36);
  const now = new Date().toISOString();
  const row = {
    slug,
    title,
    excerpt: (b.excerpt || "").toString(),
    body: (b.body || "").toString(),
    category,
    reporter_id: (b.reporter || "desk").toString(),
    image: (b.image || "").toString(),
    image_url: (b.imageUrl || "").toString() || null,
    template: (b.template || "magazine").toString(),
    source: (b.source || "").toString() || null,
    ai_assisted: !!b.aiAssisted,
    featured: !!b.featured,
    status: "published",
    published_at: now,
  };

  // 4) 저장 (초안이면 발행으로 승격, 아니면 신규)
  const { error } = await sb.from("articles").upsert(row, { onConflict: "slug" }).select("slug").single();
  if (error) {
    return Response.json({ error: "발행 실패: " + error.message }, { status: 500 });
  }

  // 5) 재검증(즉시 반영)
  revalidatePath("/");
  revalidatePath(`/article/${slug}`);
  return Response.json({ ok: true, slug });
}
