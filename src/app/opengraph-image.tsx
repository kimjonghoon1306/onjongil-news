import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "온종일뉴스 — 사장님을 위한 실용 뉴스";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 대문 공유 이미지 (카카오톡·페이스북 미리보기)
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "80px",
          background: "linear-gradient(135deg, #0b2545 0%, #14315c 55%, #7a1420 100%)",
          color: "#fff", fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ff2d78" }} />
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 8, color: "#cbd5e1" }}>
            ONJONGIL NEWS
          </div>
        </div>
        <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: -4, lineHeight: 1.05 }}>
          온종일뉴스
        </div>
        <div style={{ fontSize: 42, fontWeight: 700, marginTop: 24, color: "#f1f5f9" }}>
          사장님을 위한 진짜 실용 뉴스
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
          {["AI", "정부지원금", "프랜차이즈", "마케팅", "컨설팅", "무료 툴"].map((t) => (
            <div key={t} style={{
              fontSize: 26, fontWeight: 700, color: "#fff",
              background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)",
              padding: "10px 22px", borderRadius: 999,
            }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
