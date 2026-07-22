import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdminGear from "@/components/AdminGear";

const SITE = "온종일뉴스";
const DESC =
  "정치는 뺀다. 사장님·창업자·소상공인에게 진짜 도움 되는 실용정보만. AI·프랜차이즈·정부지원금·마케팅·컨설팅·무료 툴.";

export const metadata: Metadata = {
  metadataBase: new URL("https://news.xn--zk5biyyw.com"),
  title: {
    default: `${SITE} — 사장님을 위한 실용 뉴스`,
    template: `%s · ${SITE}`,
  },
  description: DESC,
  keywords: ["온종일뉴스", "창업", "정부지원금", "프랜차이즈", "마케팅", "AI", "소상공인"],
  openGraph: {
    type: "website",
    siteName: SITE,
    title: `${SITE} — 사장님을 위한 실용 뉴스`,
    description: DESC,
    locale: "ko_KR",
  },
  twitter: { card: "summary_large_image", title: SITE, description: DESC },
  robots: { index: true, follow: true },
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: `${SITE} RSS` }],
    },
  },
};

// 테마 초기화 (FOUC 방지) — 저장된 다크/글자크기 값을 렌더 전에 적용
const themeInit = `
try {
  var t = localStorage.getItem('on_theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
  var s = localStorage.getItem('on_readscale');
  if (s) document.documentElement.style.setProperty('--read-scale', s);
} catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&family=Noto+Serif+KR:wght@600;700;900&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <AdminGear />
      </body>
    </html>
  );
}
