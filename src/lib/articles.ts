// 기사 데이터 접근 계층
// Supabase의 '발행된' 기사를 우선 읽고, 없으면(또는 미설정 시) 데모 데이터로 폴백.
import { ARTICLES as DEMO, type Article, type CategoryId } from "@/data";
import { publicClient } from "./supabase";

interface Row {
  slug: string; title: string; excerpt: string | null; body: string | null;
  category: string; reporter_id: string | null; image: string | null;
  image_url: string | null; source: string | null; ai_assisted: boolean | null;
  featured: boolean | null; template: string | null;
  published_at: string | null; created_at: string; updated_at: string | null;
}

function rowToArticle(r: Row): Article {
  return {
    id: r.slug,
    category: (r.category as CategoryId) ?? "consulting",
    title: r.title,
    excerpt: r.excerpt ?? "",
    image: r.image || "linear-gradient(135deg, #334155, #0f172a)",
    imageUrl: r.image_url ?? undefined,
    reporter: r.reporter_id ?? "desk",
    publishedAt: r.published_at ?? r.created_at,
    updatedAt: r.updated_at ?? undefined,
    featured: r.featured ?? false,
    template: r.template ?? "magazine",
    body: r.body ?? undefined,
    source: r.source ?? undefined,
    aiAssisted: r.ai_assisted ?? false,
  };
}

// 발행된 전체 기사 (Supabase 최신순 + 데모 병합)
export async function getArticles(): Promise<Article[]> {
  const sb = publicClient();
  if (!sb) return DEMO;
  try {
    const { data, error } = await sb
      .from("articles").select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error || !data) return DEMO;
    const live = (data as Row[]).map(rowToArticle);
    const liveIds = new Set(live.map((a) => a.id));
    // 라이브 우선, 데모 중 겹치지 않는 것만 뒤에 (초기 빈 DB 대비)
    return [...live, ...DEMO.filter((a) => !liveIds.has(a.id))];
  } catch {
    return DEMO;
  }
}

// 단일 기사 (slug 또는 데모 id)
export async function getArticle(id: string): Promise<Article | null> {
  const sb = publicClient();
  if (sb) {
    try {
      const { data } = await sb
        .from("articles").select("*")
        .eq("slug", id).eq("status", "published").maybeSingle();
      if (data) return rowToArticle(data as Row);
    } catch { /* 폴백 */ }
  }
  return DEMO.find((a) => a.id === id) ?? null;
}
