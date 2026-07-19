import { ImageResponse } from "next/og";
import { getArticle } from "@/lib/articles";
import { catOf, REPORTERS } from "@/data";

export const runtime = "nodejs";
export const alt = "온종일뉴스 기사";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CAT_COLOR: Record<string, string> = {
  ai: "#7c3aed", franchise: "#0369a1", fund: "#059669",
  marketing: "#d97706", consulting: "#c8102e", free: "#2563eb",
};

// 기사별 공유 이미지 (제목·카테고리)
export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getArticle(id);
  const title = a?.title ?? "온종일뉴스";
  const catName = a ? catOf(a.category).name : "뉴스";
  const color = a ? (CAT_COLOR[a.category] ?? "#c8102e") : "#c8102e";
  const reporter = a ? (REPORTERS[a.reporter]?.name ?? "온종일뉴스") : "온종일뉴스";

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "72px 80px",
        background: "#ffffff", fontFamily: "sans-serif",
      }}>
        {/* 상단: 로고 + 카테고리 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid #c8102e", borderRadius: 10, color: "#c8102e",
              fontSize: 34, fontWeight: 900,
            }}>溫</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#0b2545", letterSpacing: -1 }}>온종일뉴스</div>
          </div>
          <div style={{
            fontSize: 26, fontWeight: 800, color: "#fff", background: color,
            padding: "8px 22px", borderRadius: 8,
          }}>{catName}</div>
        </div>

        {/* 제목 */}
        <div style={{
          fontSize: title.length > 34 ? 60 : 72, fontWeight: 900, color: "#14181f",
          lineHeight: 1.22, letterSpacing: -2, display: "flex",
        }}>
          {title.length > 60 ? title.slice(0, 58) + "…" : title}
        </div>

        {/* 하단: 기자 + 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: `5px solid ${color}`, paddingTop: 28 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#5b6472" }}>{reporter}</div>
          <div style={{ fontSize: 26, color: "#98a3b5" }}>· 사장님을 위한 실용 뉴스</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
