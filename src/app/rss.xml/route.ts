import { getArticles } from "@/lib/articles";
import { REPORTERS, catOf } from "@/data";

const BASE = "https://news.xn--zk5biyyw.com";

// 30분마다 갱신
export const revalidate = 1800;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const articles = (await getArticles()).slice(0, 30);

  const items = articles
    .map((a) => {
      const url = `${BASE}/article/${a.id}`;
      const author = REPORTERS[a.reporter]?.name ?? "온종일뉴스 편집팀";
      return `    <item>
      <title>${esc(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(a.excerpt)}</description>
      <category>${esc(catOf(a.category).name)}</category>
      <dc:creator>${esc(author)}</dc:creator>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>온종일뉴스</title>
    <link>${BASE}</link>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>정치는 뺐습니다 · 사장님·창업자·소상공인을 위한 진짜 실용 뉴스</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
