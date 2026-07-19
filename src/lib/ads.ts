// 광고 데이터 접근 — Supabase 활성 광고 우선, 없으면 데모(data.ts) 폴백.
import { ADS as DEMO, type Ad } from "@/data";
import { publicClient } from "./supabase";

interface AdRow {
  id: string; title: string | null; sub: string | null; cta: string | null;
  url: string | null; bg: string | null; img: string | null;
  house: boolean | null; active: boolean | null; sort: number | null;
}

export async function getAds(): Promise<Ad[]> {
  const sb = publicClient();
  if (!sb) return DEMO;
  try {
    const { data, error } = await sb.from("ads").select("*")
      .eq("active", true).order("sort", { ascending: true }).order("created_at", { ascending: false });
    if (error || !data || data.length === 0) return DEMO;
    return (data as AdRow[]).map((r) => ({
      id: r.id,
      title: r.title ?? undefined,
      sub: r.sub ?? undefined,
      cta: r.cta ?? undefined,
      url: r.url || "#",
      bg: r.bg ?? undefined,
      img: r.img ?? undefined,
      house: r.house ?? false,
    }));
  } catch {
    return DEMO;
  }
}
